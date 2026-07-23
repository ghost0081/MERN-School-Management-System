import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class ParentAttendance extends StatefulWidget {
  const ParentAttendance({super.key});

  @override
  State<ParentAttendance> createState() => _ParentAttendanceState();
}

class _ParentAttendanceState extends State<ParentAttendance> {
  bool _isLoading = true;
  Map<String, dynamic>? _studentDetails;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.studentId != null) {
        _studentDetails = await ApiService().getStudentDetails(user!.studentId!);
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final attendance = (_studentDetails?['attendance'] as List<dynamic>?) ?? [];
    
    // Calculate overall stats
    int present = 0;
    int absent = 0;
    
    // Calculate grouped stats
    final Map<String, Map<String, int>> groupedAttendance = {};

    for (var a in attendance) {
      if (a['status'] == 'Present') present++;
      if (a['status'] == 'Absent') absent++;

      final subName = a['subName']?.toString() ?? 'General';
      if (!groupedAttendance.containsKey(subName)) {
        groupedAttendance[subName] = {'present': 0, 'absent': 0, 'total': 0};
      }
      
      groupedAttendance[subName]!['total'] = groupedAttendance[subName]!['total']! + 1;
      if (a['status'] == 'Present') {
        groupedAttendance[subName]!['present'] = groupedAttendance[subName]!['present']! + 1;
      } else if (a['status'] == 'Absent') {
        groupedAttendance[subName]!['absent'] = groupedAttendance[subName]!['absent']! + 1;
      }
    }

    final overallPercentage = attendance.isNotEmpty ? ((present / attendance.length) * 100).toStringAsFixed(1) : '0.0';

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          const Text('Attendance Records', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Overall Attendance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Text('$overallPercentage%', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.blue)),
                          const Text('Attendance Rate', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                      Column(
                        children: [
                          Chip(label: Text('Present: $present'), backgroundColor: Colors.green.shade100),
                          Chip(label: Text('Absent: $absent'), backgroundColor: Colors.red.shade100),
                        ],
                      )
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          const Text('Subject-wise Attendance', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          
          if (groupedAttendance.isEmpty)
            const Text('No attendance records', style: TextStyle(color: Colors.grey))
          else
            ...groupedAttendance.entries.map((entry) {
              final subName = entry.key;
              final stats = entry.value;
              final subPercent = stats['total']! > 0 ? ((stats['present']! / stats['total']!) * 100).toStringAsFixed(1) : '0.0';
              final double parsedPercent = double.tryParse(subPercent) ?? 0.0;
              
              Color chipColor = Colors.green;
              if (parsedPercent < 50) chipColor = Colors.red;
              else if (parsedPercent < 75) chipColor = Colors.orange;

              return Card(
                elevation: 2,
                margin: const EdgeInsets.symmetric(vertical: 8),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(subName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          Chip(
                            label: Text('$subPercent%'),
                            backgroundColor: chipColor,
                            labelStyle: const TextStyle(color: Colors.white),
                          ),
                        ],
                      ),
                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Present: ${stats['present']}'),
                          Text('Absent: ${stats['absent']}'),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Total Classes: ${stats['total']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      )
                    ],
                  ),
                ),
              );
            }).toList(),
        ],
      ),
    );
  }
}
