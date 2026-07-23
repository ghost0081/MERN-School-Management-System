import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class StudentAttendance extends StatelessWidget {
  const StudentAttendance({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: FutureBuilder<Map<String, dynamic>>(
        future: ApiService().getStudentDetails(user?.id ?? ''),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final studentData = snapshot.data;
          final List<dynamic>? attendance = studentData?['attendance'];

          if (attendance == null || attendance.isEmpty) {
            return const Center(
              child: Text(
                'Currently You Have No Attendance Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Attendance Details',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: attendance.length,
                  itemBuilder: (context, index) {
                    final record = attendance[index];
                    final date = DateTime.tryParse(record['date'] ?? '');
                    final dateStr = date != null ? DateFormat('MM/dd/yyyy').format(date) : 'Unknown Date';
                    
                    final subjectName = record['subName'] is Map 
                        ? record['subName']['subName'] 
                        : 'Subject';

                    return Card(
                      child: ListTile(
                        leading: Icon(
                          record['status'] == 'Present' ? Icons.check_circle : Icons.cancel,
                          color: record['status'] == 'Present' ? Colors.green : Colors.red,
                        ),
                        title: Text('$subjectName - ${record['status']}'),
                        subtitle: Text(dateStr),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
