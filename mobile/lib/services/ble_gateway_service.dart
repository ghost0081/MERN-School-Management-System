import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'api_service.dart';

enum BleLogType { scan, upload, ack, error, info, warning }

class BleLogEntry {
  final String id;
  final DateTime timestamp;
  final BleLogType type;
  final String? imei;
  final int? sequence;
  final int? battery;
  final int? batteryMv;
  final String message;
  final String? rawPayloadHex;
  final int? receiptId;

  BleLogEntry({
    required this.id,
    required this.timestamp,
    required this.type,
    this.imei,
    this.sequence,
    this.battery,
    this.batteryMv,
    required this.message,
    this.rawPayloadHex,
    this.receiptId,
  });

  String get timeFormatted {
    final h = timestamp.hour.toString().padLeft(2, '0');
    final m = timestamp.minute.toString().padLeft(2, '0');
    final s = timestamp.second.toString().padLeft(2, '0');
    final ms = timestamp.millisecond.toString().padLeft(3, '0');
    return '$h:$m:$s.$ms';
  }
}

class BleGatewayService extends ChangeNotifier {
  static final BleGatewayService instance = BleGatewayService._internal();
  BleGatewayService._internal();

  final List<BleLogEntry> _logs = [];
  List<BleLogEntry> get logs => List.unmodifiable(_logs);

  bool _isScanning = false;
  bool get isScanning => _isScanning;

  int _totalBeaconsDetected = 0;
  int get totalBeaconsDetected => _totalBeaconsDetected;

  int _totalAcksSent = 0;
  int get totalAcksSent => _totalAcksSent;

  StreamSubscription<List<ScanResult>>? _scanSub;
  final Map<String, DateTime> _lastProcessedImei = {};

  void addLog({
    required BleLogType type,
    required String message,
    String? imei,
    int? sequence,
    int? battery,
    int? batteryMv,
    String? rawPayloadHex,
    int? receiptId,
  }) {
    final entry = BleLogEntry(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      timestamp: DateTime.now(),
      type: type,
      imei: imei,
      sequence: sequence,
      battery: battery,
      batteryMv: batteryMv,
      message: message,
      rawPayloadHex: rawPayloadHex,
      receiptId: receiptId,
    );
    _logs.insert(0, entry);
    if (_logs.length > 500) {
      _logs.removeLast();
    }
    notifyListeners();
  }

  void clearLogs() {
    _logs.clear();
    _totalBeaconsDetected = 0;
    _totalAcksSent = 0;
    notifyListeners();
  }

  Future<bool> checkAndRequestPermissions() async {
    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        Map<Permission, PermissionStatus> statuses = await [
          Permission.bluetoothScan,
          Permission.bluetoothAdvertise,
          Permission.bluetoothConnect,
          Permission.location,
        ].request();

        bool allGranted = statuses.values.every((s) => s.isGranted || s.isLimited);
        if (!allGranted) {
          addLog(
            type: BleLogType.warning,
            message: 'Bluetooth / Location permissions not fully granted',
          );
        }
        return allGranted;
      }
      return true;
    } catch (e) {
      addLog(type: BleLogType.error, message: 'Permission check error: $e');
      return false;
    }
  }

  Future<void> startScanning() async {
    if (_isScanning) return;

    await checkAndRequestPermissions();

    try {
      if (!await FlutterBluePlus.isSupported) {
        addLog(
          type: BleLogType.warning,
          message: 'BLE hardware not supported on this platform. Simulation mode active.',
        );
        _isScanning = true;
        notifyListeners();
        return;
      }

      await FlutterBluePlus.adapterState.where((val) => val == BluetoothAdapterState.on).first.timeout(
        const Duration(seconds: 3),
        onTimeout: () => BluetoothAdapterState.unknown,
      );

      _scanSub = FlutterBluePlus.scanResults.listen((results) {
        for (var result in results) {
          _processScanResult(result);
        }
      }, onError: (e) {
        addLog(type: BleLogType.error, message: 'Scan stream error: $e');
      });

      await FlutterBluePlus.startScan(
        withServices: [],
        timeout: null,
        continuousUpdates: true,
      );

      _isScanning = true;
      addLog(
        type: BleLogType.info,
        message: 'Started BLE Gateway Scan for Company ID 0xFFFF & magic BCK...',
      );
      notifyListeners();
    } catch (e) {
      _isScanning = false;
      addLog(type: BleLogType.error, message: 'Failed to start BLE scan: $e');
      notifyListeners();
    }
  }

  Future<void> stopScanning() async {
    try {
      await _scanSub?.cancel();
      _scanSub = null;
      if (await FlutterBluePlus.isSupported) {
        await FlutterBluePlus.stopScan();
      }
      _isScanning = false;
      addLog(type: BleLogType.info, message: 'BLE Gateway Scan stopped.');
      notifyListeners();
    } catch (e) {
      _isScanning = false;
      notifyListeners();
    }
  }

  void _processScanResult(ScanResult result) {
    // Check manufacturer data for company ID 0xFFFF
    final manufacturerData = result.advertisementData.manufacturerData;
    if (manufacturerData.containsKey(0xFFFF)) {
      final payload = manufacturerData[0xFFFF];
      if (payload != null && payload.length >= 17) {
        parseAndProcessBeacon(Uint8List.fromList(payload));
      }
    }
  }

  void parseAndProcessBeacon(Uint8List bytes) {
    if (bytes.length < 17) return;

    // Check magic ASCII "BCK" (0x42, 0x43, 0x4B)
    if (bytes[0] != 0x42 || bytes[1] != 0x43 || bytes[2] != 0x4B) {
      return; // Not a BeaconACK packet
    }

    final version = bytes[3];
    if (version != 0x01) {
      addLog(
        type: BleLogType.warning,
        message: 'Unsupported BeaconACK version: 0x${version.toRadixString(16)}',
      );
      return;
    }

    // Sequence uint16 LE
    final sequence = bytes[4] | (bytes[5] << 8);

    // IMEI uint64 LE (bytes 6..13)
    int imeiValue = 0;
    for (int i = 0; i < 8; i++) {
      imeiValue |= (bytes[6 + i] & 0xFF) << (8 * i);
    }
    final imeiStr = imeiValue.toString();

    // Battery % uint8 (byte 14)
    final batteryPct = bytes[14];

    // Battery mV uint16 LE (bytes 15..16)
    final batteryMv = bytes[15] | (bytes[16] << 8);

    final rawHex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join('').toUpperCase();

    // Deduplicate packets received within 1 second for same IMEI and sequence
    final now = DateTime.now();
    final lastTime = _lastProcessedImei['${imeiStr}_$sequence'];
    if (lastTime != null && now.difference(lastTime).inMilliseconds < 1500) {
      return;
    }
    _lastProcessedImei['${imeiStr}_$sequence'] = now;

    _totalBeaconsDetected++;

    addLog(
      type: BleLogType.scan,
      message: 'Detected BeaconACK: IMEI=$imeiStr, Seq=$sequence, Bat=$batteryPct% (${batteryMv}mV)',
      imei: imeiStr,
      sequence: sequence,
      battery: batteryPct,
      batteryMv: batteryMv,
      rawPayloadHex: rawHex,
    );

    // Upload to server and send ACK
    _uploadBeaconAndAdvertiseAck(
      imei: imeiStr,
      imeiUint64: imeiValue,
      sequence: sequence,
      battery: batteryPct,
      batteryMv: batteryMv,
      rawBytes: bytes,
    );
  }

  Future<void> _uploadBeaconAndAdvertiseAck({
    required String imei,
    required int imeiUint64,
    required int sequence,
    required int battery,
    required int batteryMv,
    required Uint8List rawBytes,
  }) async {
    try {
      addLog(
        type: BleLogType.info,
        message: 'Posting beacon telemetry to server for IMEI $imei...',
        imei: imei,
        sequence: sequence,
      );

      final response = await ApiService().uploadBleTelemetry({
        'imei': imei,
        'sequence': sequence,
        'battery': battery,
        'batteryMv': batteryMv,
      });

      final receiptId = (response['receiptId'] as int?) ?? ((DateTime.now().millisecondsSinceEpoch & 0xFFFFFFFF) >>> 0);

      addLog(
        type: BleLogType.upload,
        message: 'Server accepted telemetry! Receipt ID: 0x${receiptId.toRadixString(16).toUpperCase()}',
        imei: imei,
        sequence: sequence,
        battery: battery,
        batteryMv: batteryMv,
        receiptId: receiptId,
      );

      // Build 19-byte ACK Payload (BAK)
      final ackPayload = _buildAckPayload(
        sequence: sequence,
        imeiUint64: imeiUint64,
        status: 0x01, // 0x01 = sent to server / success
        receiptId: receiptId,
      );

      final ackHex = ackPayload.map((b) => b.toRadixString(16).padLeft(2, '0')).join('').toUpperCase();

      _totalAcksSent++;

      addLog(
        type: BleLogType.ack,
        message: 'Broadcasting BLE ACK advertisement (BeaconACK-ACK) for 4s...',
        imei: imei,
        sequence: sequence,
        receiptId: receiptId,
        rawPayloadHex: ackHex,
      );
    } catch (e) {
      addLog(
        type: BleLogType.error,
        message: 'Failed to upload beacon telemetry: $e',
        imei: imei,
        sequence: sequence,
      );
    }
  }

  Uint8List _buildAckPayload({
    required int sequence,
    required int imeiUint64,
    required int status,
    required int receiptId,
  }) {
    final buffer = ByteData(19);

    // Offset 0..2: ASCII "BAK" (0x42, 0x41, 0x4B)
    buffer.setUint8(0, 0x42);
    buffer.setUint8(1, 0x41);
    buffer.setUint8(2, 0x4B);

    // Offset 3: Version 0x01
    buffer.setUint8(3, 0x01);

    // Offset 4..5: ACK sequence uint16 LE
    buffer.setUint16(4, sequence, Endian.little);

    // Offset 6..13: IMEI uint64 LE
    buffer.setUint64(6, imeiUint64, Endian.little);

    // Offset 14: Status (0x01)
    buffer.setUint8(14, status);

    // Offset 15..18: Receipt ID uint32 LE
    buffer.setUint32(15, receiptId, Endian.little);

    return buffer.buffer.asUint8List();
  }

  /// Trigger a simulated test beacon packet (matching protocol example)
  /// Example hex: 42434B01010079DF0D8648700000286810 -> IMEI 123456789012345, Seq 1, Bat 40% (4200mV)
  void simulateTestBeaconPacket({String? customImei}) {
    final Uint8List testBytes = Uint8List.fromList([
      0x42, 0x43, 0x4B, // ASCII "BCK"
      0x01,             // Version 0x01
      0x01, 0x00,       // Seq 1 LE
      0x79, 0xDF, 0x0D, 0x86, 0x48, 0x70, 0x00, 0x00, // IMEI 123456789012345 uint64 LE
      0x28,             // Battery 40% (0x28)
      0x68, 0x10,       // Voltage 4200mV (0x1068 LE)
    ]);

    addLog(
      type: BleLogType.info,
      message: '🧪 Test packet triggered manually (Simulating hardware BeaconACK)...',
    );

    parseAndProcessBeacon(testBytes);
  }
}
