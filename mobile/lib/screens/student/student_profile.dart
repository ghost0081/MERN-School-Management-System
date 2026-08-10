import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class StudentProfile extends StatelessWidget {
  const StudentProfile({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'My Profile',
            subtitle: 'Personal credentials and student information.',
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
                  user?.name ?? 'Student Name',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  'Student • Class ${user?.sclassName ?? 'N/A'}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14, fontWeight: FontWeight.w500),
                ),
                const Divider(height: 32, color: AppTheme.borderColor),
                _buildInfoRow(Icons.numbers_rounded, 'Roll Number', user?.email ?? 'N/A'),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.class_rounded, 'Class Assigned', user?.sclassName ?? 'N/A'),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.security_rounded, 'Account Role', user?.role ?? 'Student'),
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
