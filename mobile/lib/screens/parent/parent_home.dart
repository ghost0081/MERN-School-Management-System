import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class ParentHome extends StatefulWidget {
  const ParentHome({super.key});

  @override
  State<ParentHome> createState() => _ParentHomeState();
}

class _ParentHomeState extends State<ParentHome> {
  bool _isLoading = true;
  Map<String, dynamic>? _studentDetails;
  List<dynamic> _assignments = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.studentId != null) {
        // Fetch student details to get attendance, name, rollNum, class, school
        _studentDetails = await ApiService().getStudentDetails(user!.studentId!);
        // Fetch assignments for the student
        _assignments = await ApiService().getStudentAssignments(user.studentId!);
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

    final user = Provider.of<AuthProvider>(context).currentUser;
    final sName = _studentDetails?['name'] ?? 'Loading...';
    final sRoll = _studentDetails?['rollNum']?.toString() ?? 'Loading...';
    final sClass = _studentDetails?['sclassName']?['sclassName'] ?? 'Loading...';
    final sSchool = _studentDetails?['school']?['schoolName'] ?? 'Loading...';

    // Calculate Attendance Stats
    final attendance = (_studentDetails?['attendance'] as List<dynamic>?) ?? [];
    int present = 0;
    int absent = 0;
    for (var a in attendance) {
      if (a['status'] == 'Present') present++;
      if (a['status'] == 'Absent') absent++;
    }
    final attendancePercentage = attendance.isNotEmpty ? ((present / attendance.length) * 100).toStringAsFixed(1) : '0';

    // Calculate Assignments Stats
    int submitted = 0;
    int pending = 0;
    for (var a in _assignments) {
      final statuses = (a['studentStatus'] as List<dynamic>?) ?? [];
      final myStatus = statuses.firstWhere(
        (ss) => (ss['student']?['_id'] ?? ss['student']) == user?.studentId,
        orElse: () => null,
      );
      if (myStatus != null && myStatus['status'] == 'Submitted') {
        submitted++;
      } else {
        pending++; // 'Assigned' or 'Pending'
      }
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          Text('Welcome, ${user?.name ?? 'Parent'}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          
          // Child Information
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Child Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
                  const SizedBox(height: 10),
                  Text('Name: $sName', style: const TextStyle(fontSize: 16)),
                  Text('Roll Number: $sRoll', style: const TextStyle(fontSize: 16)),
                  Text('Class: $sClass', style: const TextStyle(fontSize: 16)),
                  Text('School: $sSchool', style: const TextStyle(fontSize: 16)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Attendance Overview
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Attendance Overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
                  const SizedBox(height: 10),
                  Text('$attendancePercentage%', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.green)),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Chip(label: Text('Present: $present'), backgroundColor: Colors.green.shade100),
                      Chip(label: Text('Absent: $absent'), backgroundColor: Colors.red.shade100),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text('Total Records: ${attendance.length}', style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Assignments Overview
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Assignments Overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Chip(label: Text('Submitted: $submitted'), backgroundColor: Colors.green.shade100),
                      Chip(label: Text('Pending: $pending'), backgroundColor: Colors.orange.shade100),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text('Total Assignments: ${_assignments.length}', style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Recent Attendance
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Recent Attendance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
                  const SizedBox(height: 10),
                  if (attendance.isEmpty)
                    const Text('No attendance records', style: TextStyle(color: Colors.grey))
                  else
                    ...attendance.take(5).map((a) {
                      final isPresent = a['status'] == 'Present';
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(a['date'] != null ? a['date'].toString().split('T')[0] : 'Unknown Date'),
                            Chip(
                              label: Text(a['status'] ?? 'Unknown'),
                              backgroundColor: isPresent ? Colors.green : Colors.red,
                              labelStyle: const TextStyle(color: Colors.white),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
