import 'package:flutter/material.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherPayroll extends StatelessWidget {
  const TeacherPayroll({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          PageHeader(
            title: 'Teacher Payroll & Salary',
            subtitle: 'View monthly salary slips, breakdown, and payment history.',
          ),
          PremiumCard(
            padding: EdgeInsets.all(32.0),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.payments_rounded, size: 48, color: AppTheme.primaryColor),
                  SizedBox(height: 16),
                  Text(
                    'Payroll Details',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Monthly salary slips and breakdown will appear here once finalized by school admin.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
