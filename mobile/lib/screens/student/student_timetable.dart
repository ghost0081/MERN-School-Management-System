import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class StudentTimetable extends StatelessWidget {
  const StudentTimetable({super.key});

  final List<String> days = const ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Class Timetable',
            subtitle: 'Weekly schedule of periods and teachers.',
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getClassTimetable(user?.sclassId ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Color(0xFFEF4444))));
                }

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

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.today_rounded, color: AppTheme.primaryColor, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  day,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            periods.isEmpty
                                ? const Text('No periods scheduled for this day.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13))
                                : Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: periods.map((p) {
                                      final time = '${p['startTime'] ?? ''}-${p['endTime'] ?? ''}';
                                      final subject = p['subject'] != null ? p['subject']['subName'] : 'Subject';
                                      final teacher = p['teacher'] != null ? p['teacher']['name'] : 'Teacher';
                                      
                                      return Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        decoration: BoxDecoration(
                                          color: AppTheme.backgroundColor,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: AppTheme.borderColor),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(Icons.schedule_rounded, size: 14, color: AppTheme.textSecondary),
                                            const SizedBox(width: 6),
                                            Text(
                                              '$time • $subject ($teacher)',
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                            ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
