import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:math' as math;
import 'dart:async';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

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

  double _calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
    if (lat1 == 0 || lon1 == 0 || lat2 == 0 || lon2 == 0) return 999999;
    const r = 6371000.0;
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
            backgroundColor: Color(0xFF10B981),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save geofence: $e'), backgroundColor: const Color(0xFFEF4444)),
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
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryColor),
      );
    }

    String status = _trackerData?['status'] ?? 'Offline';
    final lastUpdatedStr = _trackerData?['last_updated'];
    if (lastUpdatedStr != null) {
      final lastUpdatedDate = DateTime.tryParse(lastUpdatedStr.toString());
      if (lastUpdatedDate != null) {
        final diff = DateTime.now().toUtc().difference(lastUpdatedDate.toUtc()).inSeconds.abs();
        if (diff > 120) {
          status = 'Offline';
        }
      }
    } else {
      status = 'Offline';
    }
    final isOnline = status == 'Online';
    final double lat = (_trackerData?['latitude'] ?? 0).toDouble();
    final double lng = (_trackerData?['longitude'] ?? 0).toDouble();

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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Live GPS Tracker',
            subtitle: 'Real-time telemetry and geofence monitoring.',
            trailing: IconButton(
              icon: const Icon(Icons.refresh_rounded, color: AppTheme.primaryColor),
              onPressed: _fetchTrackerData,
              tooltip: 'Refresh GPS',
            ),
          ),

          // Status & Set Geofence Action
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: isOnline ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isOnline ? Icons.signal_cellular_alt_rounded : Icons.signal_cellular_connected_no_internet_0_bar_rounded,
                      size: 16,
                      color: isOnline ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Tracker $status',
                      style: TextStyle(
                        color: isOnline ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
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
                  icon: Icon(_isEditingGeofence ? Icons.close_rounded : Icons.security_rounded, size: 18),
                  label: Text(
                    _isEditingGeofence ? 'Cancel Safe Zone' : 'Set Safe Zone',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isEditingGeofence ? const Color(0xFFF59E0B) : AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // GEO-FENCE EDITING BANNER
          if (_isEditingGeofence)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                border: Border.all(color: const Color(0xFF10B981), width: 1.5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '📍 Creating / Editing Safe Zone Geo-Fence',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFF065F46)),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Tap anywhere on the map to place the center of your Safe Zone. Use the slider below to expand or shrink the radius.',
                    style: TextStyle(fontSize: 13, color: Color(0xFF064E3B), height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Safe Zone Radius: ${_geofence['radius']} meters',
                    style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF065F46)),
                  ),
                  Slider(
                    value: (_geofence['radius'] ?? 500).toDouble(),
                    min: 100,
                    max: 3000,
                    divisions: 29,
                    label: '${_geofence['radius']}m',
                    activeColor: const Color(0xFF10B981),
                    onChanged: (val) {
                      setState(() {
                        _geofence['radius'] = val.toInt();
                        _geofence['enabled'] = true;
                      });
                    },
                  ),
                  const SizedBox(height: 4),
                  Wrap(
                    alignment: WrapAlignment.end,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _geofence['enabled'] = false;
                            _geofence['lat'] = 0.0;
                            _geofence['lng'] = 0.0;
                          });
                        },
                        child: const Text('Disable Geo-Fence', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700)),
                      ),
                      ElevatedButton.icon(
                        onPressed: _isSavingGeofence ? null : _saveGeofence,
                        icon: const Icon(Icons.save_rounded, size: 18),
                        label: Text(_isSavingGeofence ? 'Saving...' : 'Save Safe Zone'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
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
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: isInsideSafeZone ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                border: Border.all(color: isInsideSafeZone ? const Color(0xFF10B981) : const Color(0xFFEF4444), width: 1.5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Icon(
                    isInsideSafeZone ? Icons.verified_user_rounded : Icons.warning_amber_rounded,
                    color: isInsideSafeZone ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      isInsideSafeZone
                          ? 'CHILD IS SAFE: Currently inside the designated Safe Zone (${distanceMeters.round()}m from zone center).'
                          : 'SAFETY ALERT: Child is OUTSIDE the designated Safe Zone! (${(distanceMeters ?? 0).round()}m away from center).',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: isInsideSafeZone ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // MAP
          PremiumCard(
            padding: EdgeInsets.zero,
            child: SizedBox(
              height: 380,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
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
                            color: AppTheme.primaryColor,
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
                            color: const Color(0xFF10B981).withValues(alpha: 0.25),
                            borderColor: const Color(0xFF10B981),
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
                            Icons.location_on_rounded,
                            color: AppTheme.primaryColor,
                            size: 40,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Location Intel
          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.explore_rounded, color: AppTheme.primaryColor, size: 20),
                    const SizedBox(width: 8),
                    Text('Location Telemetry', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 16),
                _buildRow('Latitude', _trackerData?['latitude']?.toStringAsFixed(6) ?? '0.000000'),
                const Divider(height: 20, color: AppTheme.borderColor),
                _buildRow('Longitude', _trackerData?['longitude']?.toStringAsFixed(6) ?? '0.000000'),
                const Divider(height: 20, color: AppTheme.borderColor),
                _buildRow('Movement Speed', '${_trackerData?['speed'] ?? 0} km/h'),
                const Divider(height: 20, color: AppTheme.borderColor),
                _buildRow('Course Heading', '${_trackerData?['course'] ?? 0}°'),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Last Seen Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppTheme.primaryColor, Color(0xFF3B82F6)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.sync_rounded, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text('Last Synced Telemetry', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('The GT06 tracker last reported its coordinates at:', style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 4),
                Text(_formatDate(_trackerData?['last_updated']), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 16),
                const Text('Hardware IMEI Number', style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 2),
                Text(_trackerData?['imei'] ?? 'N/A', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
      ],
    );
  }
}
