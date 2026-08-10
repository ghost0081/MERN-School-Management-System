import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherClass extends StatelessWidget {
  const TeacherClass({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Class Roster',
            subtitle: 'View and manage student records, attendance, and grades.',
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getClassStudents(user?.sclassId ?? ''),
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
                        child: Text('No students found in this class.', style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final student = snapshot.data![index];
                    final initial = (student['name'] ?? 'S')[0].toUpperCase();

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                              child: Text(
                                initial,
                                style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w800, fontSize: 16),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    student['name'] ?? 'Unknown Student',
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Roll No: ${student['rollNum'] ?? '-'}',
                                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                            PopupMenuButton<String>(
                              icon: const Icon(Icons.more_vert_rounded, color: AppTheme.textSecondary),
                              onSelected: (value) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$value selected')));
                              },
                              itemBuilder: (BuildContext context) {
                                return {'Take Attendance', 'Provide Marks', 'View Record'}.map((String choice) {
                                  return PopupMenuItem<String>(
                                    value: choice,
                                    child: Text(choice),
                                  );
                                }).toList();
                              },
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
