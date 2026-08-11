import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/ble_gateway_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class BleLogsScreen extends StatefulWidget {
  const BleLogsScreen({super.key});

  @override
  State<BleLogsScreen> createState() => _BleLogsScreenState();
}

class _BleLogsScreenState extends State<BleLogsScreen> {
  BleLogType? _selectedFilter;
  final BleGatewayService _bleService = BleGatewayService.instance;

  @override
  void initState() {
    super.initState();
    _bleService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _bleService.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  Color _getTypeColor(BleLogType type) {
    switch (type) {
      case BleLogType.scan:
        return const Color(0xFF3B82F6); // Blue
      case BleLogType.upload:
        return const Color(0xFF10B981); // Emerald Green
      case BleLogType.ack:
        return const Color(0xFF8B5CF6); // Purple
      case BleLogType.error:
        return const Color(0xFFEF4444); // Red
      case BleLogType.warning:
        return const Color(0xFFF59E0B); // Amber
      case BleLogType.info:
        return const Color(0xFF6B7280); // Gray
    }
  }

  IconData _getTypeIcon(BleLogType type) {
    switch (type) {
      case BleLogType.scan:
        return Icons.bluetooth_searching_rounded;
      case BleLogType.upload:
        return Icons.cloud_upload_rounded;
      case BleLogType.ack:
        return Icons.cell_tower_rounded;
      case BleLogType.error:
        return Icons.error_outline_rounded;
      case BleLogType.warning:
        return Icons.warning_amber_rounded;
      case BleLogType.info:
        return Icons.info_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final logs = _bleService.logs.where((log) {
      if (_selectedFilter == null) return true;
      return log.type == _selectedFilter;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('BeaconACK BLE Gateway', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.cleaning_services_rounded),
            tooltip: 'Clear Logs',
            onPressed: () {
              _bleService.clearLogs();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('BLE Gateway logs cleared.')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.bug_report_rounded, color: AppTheme.primaryColor),
            tooltip: 'Simulate Beacon Packet',
            onPressed: () {
              _bleService.simulateTestBeaconPacket();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Triggered test BeaconACK packet.')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const PageHeader(
              title: 'BLE Telemetry & ACK Logs',
              subtitle: 'Real-time protocol monitoring for BeaconACK tags.',
            ),
            const SizedBox(height: 12),

            // Gateway Control Card
            PremiumCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            _bleService.isScanning
                                ? Icons.bluetooth_searching_rounded
                                : Icons.bluetooth_disabled_rounded,
                            color: _bleService.isScanning ? const Color(0xFF10B981) : Colors.grey,
                            size: 24,
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _bleService.isScanning ? 'Gateway Scanning Active' : 'Gateway Stopped',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              Text(
                                _bleService.isScanning
                                    ? 'Scanning for company ID 0xFFFF & magic BCK'
                                    : 'Tap switch to start background scan',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Switch.adaptive(
                        value: _bleService.isScanning,
                        activeTrackColor: const Color(0xFF10B981),
                        onChanged: (val) async {
                          if (val) {
                            await _bleService.startScanning();
                          } else {
                            await _bleService.stopScanning();
                          }
                        },
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem('Beacons', '${_bleService.totalBeaconsDetected}', const Color(0xFF3B82F6)),
                      _buildStatItem('ACKs Sent', '${_bleService.totalAcksSent}', const Color(0xFF8B5CF6)),
                      _buildStatItem('Total Logs', '${_bleService.logs.length}', const Color(0xFF6B7280)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Test Simulation Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.science_rounded, color: Color(0xFF2563EB), size: 20),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Testing without hardware? Tap button to trigger protocol simulation.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF1E40AF), fontWeight: FontWeight.w500),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => _bleService.simulateTestBeaconPacket(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    child: const Text('Test Packet'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All', null),
                  _buildFilterChip('Scans', BleLogType.scan),
                  _buildFilterChip('Uploads', BleLogType.upload),
                  _buildFilterChip('ACKs', BleLogType.ack),
                  _buildFilterChip('Errors', BleLogType.error),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Logs Stream List
            if (logs.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.receipt_long_rounded, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      Text(
                        'No BLE Logs Yet',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Start scanning or trigger a test packet above.',
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: logs.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final log = logs[index];
                  final typeColor = _getTypeColor(log.type);

                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: typeColor.withValues(alpha: 0.3), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: typeColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                children: [
                                  Icon(_getTypeIcon(log.type), size: 14, color: typeColor),
                                  const SizedBox(width: 4),
                                  Text(
                                    log.type.name.toUpperCase(),
                                    style: TextStyle(color: typeColor, fontWeight: FontWeight.bold, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              log.timeFormatted,
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontFamily: 'monospace'),
                            ),
                            const Spacer(),
                            if (log.rawPayloadHex != null)
                              IconButton(
                                icon: const Icon(Icons.copy_rounded, size: 16, color: Colors.grey),
                                constraints: const BoxConstraints(),
                                padding: EdgeInsets.zero,
                                tooltip: 'Copy Hex Payload',
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: log.rawPayloadHex!));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Hex payload copied to clipboard')),
                                  );
                                },
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          log.message,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.3),
                        ),

                        // Telemetry details badges
                        if (log.imei != null || log.sequence != null || log.battery != null) ...[
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: [
                              if (log.imei != null) _buildBadge('IMEI: ${log.imei}', Icons.badge_rounded, const Color(0xFF4F46E5)),
                              if (log.sequence != null) _buildBadge('Seq: ${log.sequence}', Icons.numbers_rounded, const Color(0xFF0284C7)),
                              if (log.battery != null) _buildBadge('Bat: ${log.battery}%', Icons.battery_charging_full_rounded, const Color(0xFF16A34A)),
                              if (log.batteryMv != null) _buildBadge('${log.batteryMv} mV', Icons.bolt_rounded, const Color(0xFFD97706)),
                              if (log.receiptId != null) _buildBadge('Receipt: 0x${log.receiptId!.toRadixString(16).toUpperCase()}', Icons.receipt_rounded, const Color(0xFF7C3AED)),
                            ],
                          ),
                        ],

                        // Hex payload viewer
                        if (log.rawPayloadHex != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: SelectableText(
                              'HEX: ${log.rawPayloadHex}',
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                color: Color(0xFF38BDF8),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildFilterChip(String label, BleLogType? type) {
    final isSelected = _selectedFilter == type;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppTheme.primaryColor,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        onSelected: (selected) {
          setState(() {
            _selectedFilter = selected ? type : null;
          });
        },
      ),
    );
  }

  Widget _buildBadge(String text, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}
