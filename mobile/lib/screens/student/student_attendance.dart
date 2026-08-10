import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class StudentAttendance extends StatelessWidget {
  const StudentAttendance({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: FutureBuilder<Map<String, dynamic>>(
        future: ApiService().getStudentDetails(user?.id ?? ''),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Color(0xFFEF4444))));
          }

          final studentData = snapshot.data;
          final List<dynamic>? attendance = studentData?['attendance'];

          if (attendance == null || attendance.isEmpty) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                PageHeader(
                  title: 'My Attendance',
                  subtitle: 'View your subject-wise presence and attendance log.',
                ),
                Expanded(
                  child: PremiumCard(
                    child: Center(
                      child: Text('Currently you have no attendance details recorded.', style: TextStyle(color: AppTheme.textSecondary)),
                    ),
                  ),
                ),
              ],
            );
          }

          final presentCount = attendance.where((r) => r['status'] == 'Present').length;
          final absentCount = attendance.where((r) => r['status'] == 'Absent').length;
          final percentage = (presentCount / attendance.length * 100).toStringAsFixed(1);

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const PageHeader(
                title: 'My Attendance',
                subtitle: 'View your subject-wise presence and attendance log.',
              ),

              // KPI Header
              PremiumCard(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$percentage%',
                          style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w800, color: Color(0xFF10B981), letterSpacing: -1),
                        ),
                        const SizedBox(height: 4),
                        const Text('Overall Attendance', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(8)),
                          child: Text('Present: $presentCount', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w700, fontSize: 12)),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(8)),
                          child: Text('Absent: $absentCount', style: const TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700, fontSize: 12)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              Expanded(
                child: ListView.builder(
                  itemCount: attendance.length,
                  itemBuilder: (context, index) {
                    final record = attendance[index];
                    final date = DateTime.tryParse(record['date'] ?? '');
                    final dateStr = date != null ? DateFormat('MMM dd, yyyy').format(date) : 'Unknown Date';
                    final isPresent = record['status'] == 'Present';

                    final subjectName = record['subName'] is Map 
                        ? record['subName']['subName'] 
                        : 'Subject';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: isPresent ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                isPresent ? Icons.check_circle_rounded : Icons.cancel_rounded,
                                color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(subjectName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text(dateStr, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isPresent ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                record['status'] ?? 'Unknown',
                                style: TextStyle(
                                  color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
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
