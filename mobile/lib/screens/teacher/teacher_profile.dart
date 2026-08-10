import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherProfile extends StatelessWidget {
  const TeacherProfile({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Teacher Profile',
            subtitle: 'Personal details and teaching credentials.',
          ),
          PremiumCard(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 46,
                  backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                  child: const Icon(Icons.person_rounded, size: 50, color: AppTheme.primaryColor),
                ),
                const SizedBox(height: 16),
                Text(
                  user?.name ?? 'Teacher Name',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  'Educator • Class ${user?.sclassName ?? 'N/A'}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14, fontWeight: FontWeight.w500),
                ),
                const Divider(height: 32, color: AppTheme.borderColor),
                _buildInfoRow(Icons.email_rounded, 'Email Address', user?.email ?? 'N/A'),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.security_rounded, 'Role / Access', user?.role ?? 'Teacher'),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.class_rounded, 'Assigned Class', user?.sclassName ?? 'Unassigned'),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.menu_book_rounded, 'Teach Subject', user?.teachSubjectName ?? 'Unassigned'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: AppTheme.backgroundColor, borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, size: 18, color: AppTheme.textSecondary),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w500)),
            Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
      ],
    );
  }
}
