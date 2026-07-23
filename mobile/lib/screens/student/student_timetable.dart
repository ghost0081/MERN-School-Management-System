import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class StudentTimetable extends StatelessWidget {
  const StudentTimetable({super.key});

  final List<String> days = const ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: FutureBuilder<List<dynamic>>(
        future: ApiService().getClassTimetable(user?.sclassId ?? ''),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          // Build a map of Day -> Periods
          final Map<String, List<dynamic>> schedule = {
            for (var d in days) d: []
          };

          if (snapshot.hasData) {
            for (var dayRecord in snapshot.data!) {
              final dayName = dayRecord['day'];
              if (schedule.containsKey(dayName)) {
                schedule[dayName] = dayRecord['periods'] ?? [];
              }
            }
          }

          return ListView.builder(
            itemCount: days.length,
            itemBuilder: (context, index) {
              final day = days[index];
              final periods = schedule[day]!;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        day,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      periods.isEmpty
                          ? const Text('No periods', style: TextStyle(color: Colors.grey))
                          : SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: periods.map((p) {
                                  final time = '${p['startTime']}-${p['endTime']}';
                                  final subject = p['subject'] != null ? p['subject']['subName'] : '';
                                  final teacher = p['teacher'] != null ? p['teacher']['name'] : '';
                                  
                                  return Container(
                                    margin: const EdgeInsets.only(right: 8),
                                    child: Chip(
                                      backgroundColor: Colors.grey[200],
                                      label: Text('$time • $subject • $teacher'),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
