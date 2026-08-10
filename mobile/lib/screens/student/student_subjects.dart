import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class StudentSubjects extends StatelessWidget {
  const StudentSubjects({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Class Curriculum',
            subtitle: 'Enrolled Class: ${user?.sclassName ?? 'N/A'}',
          ),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getClassSubjects(user?.sclassId ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Color(0xFFEF4444))));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const PremiumCard(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text('No subjects found for your class.', style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final subject = snapshot.data![index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.menu_book_rounded, color: AppTheme.primaryColor, size: 24),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    subject['subName'] ?? 'Subject',
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Code: ${subject['subCode'] ?? 'N/A'} • ${subject['sessions'] ?? 0} Sessions',
                                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                  ),
                                ],
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
          ),
        ],
      ),
    );
  }
}
