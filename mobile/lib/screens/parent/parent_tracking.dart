import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import 'dart:async';

class ParentTracking extends StatefulWidget {
  const ParentTracking({super.key});

  @override
  State<ParentTracking> createState() => _ParentTrackingState();
}

class _ParentTrackingState extends State<ParentTracking> {
  bool _isLoading = true;
  Map<String, dynamic>? _trackerData;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchTrackerData();
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _fetchTrackerData();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchTrackerData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.studentId != null) {
        final data = await ApiService().getDeviceData(user!.studentId!);
        if (mounted) {
          setState(() {
            _trackerData = data;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching tracker data: $e");
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(String? isoString) {
    if (isoString == null) return 'Unknown';
    final date = DateTime.tryParse(isoString);
    if (date == null) return 'Unknown';
    return DateFormat('MMM dd, yyyy - hh:mm a').format(date);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final status = _trackerData?['status'] ?? 'Offline';
    final isOnline = status == 'Online';

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Live GPS Tracker', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                Chip(
                  label: Text('Device $status'),
                  backgroundColor: isOnline ? Colors.green.shade100 : Colors.red.shade100,
                  labelStyle: TextStyle(color: isOnline ? Colors.green : Colors.red, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Location Intel
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.explore, color: Colors.deepPurple),
                        SizedBox(width: 8),
                        Text('Location Intel', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(),
                    _buildRow('Latitude', _trackerData?['latitude']?.toStringAsFixed(6) ?? '0.000000'),
                    _buildRow('Longitude', _trackerData?['longitude']?.toStringAsFixed(6) ?? '0.000000'),
                    _buildRow('Movement Speed', '${_trackerData?['speed'] ?? 0} km/h'),
                    _buildRow('Course', '${_trackerData?['course'] ?? 0}°'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Hardware Info
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.memory, color: Colors.deepPurple),
                        SizedBox(width: 8),
                        Text('Hardware state', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(),
                    const Text('Device telemetry is pushed dynamically from the GT06 tracker over a raw TCP socket, posting GPS coordinates directly to the server.', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Last Seen
            Card(
              color: Colors.deepPurple,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.access_time, color: Colors.white),
                        SizedBox(width: 8),
                        Text('Last Seen Sync', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const Text('The tracker last reported its state at:', style: TextStyle(color: Colors.white70)),
                    Text(_formatDate(_trackerData?['last_updated']), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                    const SizedBox(height: 10),
                    const Text('IMEI:', style: TextStyle(color: Colors.white70)),
                    Text(_trackerData?['imei'] ?? 'N/A', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
