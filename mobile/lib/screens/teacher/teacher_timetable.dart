import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherTimetable extends StatelessWidget {
  const TeacherTimetable({super.key});

  final List<String> days = const ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Teacher Schedule',
            subtitle: 'Weekly lecture timetable and period assignments.',
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getTeacherTimetable(user?.id ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Color(0xFFEF4444))));
                }

                final items = snapshot.data ?? [];

                return ListView.builder(
                  itemCount: days.length,
                  itemBuilder: (context, index) {
                    final day = days[index];
                    final dayData = items.firstWhere((i) => i['day'] == day, orElse: () => null);
                    final periods = (dayData?['periods'] as List<dynamic>?) ?? [];

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
                                ? const Text('No teaching periods assigned for this day.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13))
                                : Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: periods.map((p) {
                                      final start = p['start'] ?? '';
                                      final end = p['end'] ?? '';
                                      final sub = p['subject']?['subName'] ?? 'Subject';
                                      final cName = dayData?['sclassName']?['sclassName'] ?? 'Class';
                                      return Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        decoration: BoxDecoration(
                                          color: AppTheme.backgroundColor,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: AppTheme.borderColor),
                                        ),
                                        child: Text(
                                          '$start-$end • $sub • Class $cName',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
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
