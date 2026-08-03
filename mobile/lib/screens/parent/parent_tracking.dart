import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:math' as math;
import 'dart:async';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class ParentTracking extends StatefulWidget {
  const ParentTracking({super.key});

  @override
  State<ParentTracking> createState() => _ParentTrackingState();
}

class _ParentTrackingState extends State<ParentTracking> {
  bool _isLoading = true;
  bool _isSavingGeofence = false;
  Map<String, dynamic>? _trackerData;
  Timer? _timer;
  final MapController _mapController = MapController();

  // Geofence State
  Map<String, dynamic> _geofence = {
    'lat': 0.0,
    'lng': 0.0,
    'radius': 500,
    'name': 'Safe Zone',
    'enabled': false,
  };
  bool _isEditingGeofence = false;

  @override
  void initState() {
    super.initState();
    _fetchTrackerData();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!_isEditingGeofence) {
        _fetchTrackerData();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  // Haversine distance in meters between two coordinates
  double _calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
    if (lat1 == 0 || lon1 == 0 || lat2 == 0 || lon2 == 0) return 999999;
    const r = 6371000.0; // Earth radius in meters
    final dLat = (lat2 - lat1) * (math.pi / 180);
    final dLon = (lon2 - lon1) * (math.pi / 180);
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1 * (math.pi / 180)) *
            math.cos(lat2 * (math.pi / 180)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return r * c;
  }

  Future<void> _fetchTrackerData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.studentId != null) {
        final data = await ApiService().getDeviceData(user!.studentId!);
        if (mounted) {
          setState(() {
            _trackerData = data;
            if (data['geofence'] != null && !_isEditingGeofence) {
              final gf = data['geofence'] as Map;
              _geofence = {
                'lat': (gf['lat'] ?? 0).toDouble(),
                'lng': (gf['lng'] ?? 0).toDouble(),
                'radius': (gf['radius'] ?? 500).toInt(),
                'name': gf['name'] ?? 'Safe Zone',
                'enabled': gf['enabled'] ?? false,
              };
            }
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

  Future<void> _saveGeofence() async {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
    if (user?.studentId == null) return;

    setState(() {
      _isSavingGeofence = true;
    });

    try {
      await ApiService().updateGeofence(user!.studentId!, _geofence);
      setState(() {
        _isEditingGeofence = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Safe Zone Geo-Fence saved successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save geofence: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSavingGeofence = false;
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
    final double lat = (_trackerData?['latitude'] ?? 0).toDouble();
    final double lng = (_trackerData?['longitude'] ?? 0).toDouble();

    // Polyline history points
    final List<LatLng> polylinePoints = [];
    if (_trackerData?['path_history'] != null && _trackerData!['path_history'] is List) {
      for (var pt in _trackerData!['path_history']) {
        if (pt is Map && pt['lat'] != null && pt['lng'] != null) {
          polylinePoints.add(LatLng(pt['lat'].toDouble(), pt['lng'].toDouble()));
        }
      }
    }
    if (lat != 0 && lng != 0) {
      if (polylinePoints.isEmpty || polylinePoints.last.latitude != lat || polylinePoints.last.longitude != lng) {
        polylinePoints.add(LatLng(lat, lng));
      }
    }

    final bool isGeofenceActive = _geofence['enabled'] == true && _geofence['lat'] != 0.0 && _geofence['lng'] != 0.0;
    final double? distanceMeters = isGeofenceActive && lat != 0 && lng != 0
        ? _calculateDistanceMeters(lat, lng, _geofence['lat'], _geofence['lng'])
        : null;
    final bool isInsideSafeZone = distanceMeters != null && distanceMeters <= (_geofence['radius'] ?? 500);

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header & Refresh
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Live GPS Tracker', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    Chip(
                      label: Text('Device $status'),
                      backgroundColor: isOnline ? Colors.green.shade100 : Colors.red.shade100,
                      labelStyle: TextStyle(color: isOnline ? Colors.green : Colors.red, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh, color: Colors.deepPurple),
                      onPressed: _fetchTrackerData,
                      tooltip: 'Refresh GPS',
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Geofence Action Button
            ElevatedButton.icon(
              onPressed: () {
                if (!_isEditingGeofence && (_geofence['lat'] == 0.0 || _geofence['lat'] == 0)) {
                  setState(() {
                    _geofence['lat'] = lat != 0 ? lat : 28.6139;
                    _geofence['lng'] = lng != 0 ? lng : 77.2090;
                    _geofence['radius'] = 500;
                    _geofence['enabled'] = true;
                  });
                }
                setState(() {
                  _isEditingGeofence = !_isEditingGeofence;
                });
              },
              icon: Icon(_isEditingGeofence ? Icons.close : Icons.security, color: Colors.white),
              label: Text(_isEditingGeofence ? 'Cancel Editing' : '📍 Set Safe Zone (Geo-Fence)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isEditingGeofence ? Colors.orange.shade700 : Colors.deepPurple,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),

            // GEO-FENCE EDITING BANNER
            if (_isEditingGeofence)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  border: Border.all(color: Colors.green.shade400, width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '📍 Creating / Editing Safe Zone Geo-Fence',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.green),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Tap anywhere on the map below to move the Safe Zone center (e.g. School Campus or Home). Adjust radius slider below.',
                      style: TextStyle(fontSize: 13, color: Colors.black87),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Safe Zone Radius: ${_geofence['radius']} meters',
                      style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.green),
                    ),
                    Slider(
                      value: (_geofence['radius'] ?? 500).toDouble(),
                      min: 100,
                      max: 3000,
                      divisions: 29,
                      label: '${_geofence['radius']}m',
                      activeColor: Colors.green,
                      onChanged: (val) {
                        setState(() {
                          _geofence['radius'] = val.toInt();
                          _geofence['enabled'] = true;
                        });
                      },
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _geofence['enabled'] = false;
                              _geofence['lat'] = 0.0;
                              _geofence['lng'] = 0.0;
                            });
                          },
                          child: const Text('Disable Geo-Fence', style: TextStyle(color: Colors.red)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          onPressed: _isSavingGeofence ? null : _saveGeofence,
                          icon: const Icon(Icons.save, size: 18),
                          label: Text(_isSavingGeofence ? 'Saving...' : 'Save Safe Zone to DB'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

            // GEOFENCE ALERT BANNER
            if (isGeofenceActive)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: isInsideSafeZone ? Colors.green.shade50 : Colors.red.shade50,
                  border: Border.all(color: isInsideSafeZone ? Colors.green : Colors.red, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      isInsideSafeZone ? Icons.verified_user : Icons.warning_amber_rounded,
                      color: isInsideSafeZone ? Colors.green.shade700 : Colors.red.shade700,
                      size: 28,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        isInsideSafeZone
                            ? '🟢 CHILD IS SAFE: Currently inside the designated Safe Zone (${distanceMeters.round()}m from zone center).'
                            : '🚨 SAFETY ALERT: Child is OUTSIDE the designated Safe Zone! (${(distanceMeters ?? 0).round()}m away from center).',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isInsideSafeZone ? Colors.green.shade900 : Colors.red.shade900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // LIVE MAP VIEW
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              clipBehavior: Clip.antiAlias,
              child: SizedBox(
                height: 380,
                child: FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: lat != 0 && lng != 0 ? LatLng(lat, lng) : const LatLng(28.6139, 77.2090),
                    initialZoom: 14.0,
                    onTap: (tapPosition, point) {
                      if (_isEditingGeofence) {
                        setState(() {
                          _geofence['lat'] = point.latitude;
                          _geofence['lng'] = point.longitude;
                          _geofence['enabled'] = true;
                        });
                      }
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.crm.school.mobile',
                    ),
                    if (polylinePoints.length > 1)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: polylinePoints,
                            color: Colors.deepPurple,
                            strokeWidth: 4.0,
                          ),
                        ],
                      ),
                    if (isGeofenceActive || _isEditingGeofence)
                      CircleLayer(
                        circles: [
                          CircleMarker(
                            point: LatLng((_geofence['lat'] ?? 0).toDouble(), (_geofence['lng'] ?? 0).toDouble()),
                            radius: (_geofence['radius'] ?? 500).toDouble(),
                            useRadiusInMeter: true,
                            color: Colors.green.withValues(alpha: 0.25),
                            borderColor: Colors.green,
                            borderStrokeWidth: 2.0,
                          ),
                        ],
                      ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: lat != 0 && lng != 0 ? LatLng(lat, lng) : const LatLng(28.6139, 77.2090),
                          width: 44,
                          height: 44,
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.deepPurple,
                            size: 40,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Location Intel
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
            const SizedBox(height: 24),
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
