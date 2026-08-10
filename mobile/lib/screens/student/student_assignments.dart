import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class StudentAssignments extends StatelessWidget {
  const StudentAssignments({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Assignments',
            subtitle: 'Track your pending homework and view graded submissions.',
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getStudentAssignments(user?.id ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Color(0xFFEF4444))));
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const PremiumCard(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text('No assignments found.', style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final assignment = snapshot.data![index];
                    
                    final date = DateTime.tryParse(assignment['dueDate'] ?? '');
                    final dueDateStr = date != null ? DateFormat('MMM dd, yyyy').format(date) : 'N/A';
                    final subject = assignment['subject'] != null ? assignment['subject']['subName'] : 'General';
                    
                    String status = 'Pending';
                    String marks = '-';
                    final studentStatuses = assignment['studentStatus'] as List<dynamic>?;
                    if (studentStatuses != null) {
                      for (var s in studentStatuses) {
                        if (s['student'] != null && s['student']['_id'] == user?.id) {
                          status = s['status'] ?? 'Pending';
                          marks = s['marks']?.toString() ?? '-';
                          break;
                        }
                      }
                    }

                    final isSubmitted = status == 'Submitted';

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    subject,
                                    style: const TextStyle(color: AppTheme.primaryColor, fontSize: 12, fontWeight: FontWeight.w700),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isSubmitted ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    status,
                                    style: TextStyle(
                                      color: isSubmitted ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              assignment['title'] ?? 'Untitled Assignment',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                            ),
                            if ((assignment['description'] ?? '').isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(
                                assignment['description'],
                                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                              ),
                            ],
                            const Divider(height: 24, color: AppTheme.borderColor),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.event_outlined, size: 16, color: AppTheme.textSecondary),
                                    const SizedBox(width: 6),
                                    Text('Due: $dueDateStr', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
                                  ],
                                ),
                                Text(
                                  'Score: $marks',
                                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.primaryColor),
                                ),
                              ],
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
