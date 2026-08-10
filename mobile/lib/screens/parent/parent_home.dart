import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class ParentHome extends StatefulWidget {
  const ParentHome({super.key});

  @override
  State<ParentHome> createState() => _ParentHomeState();
}

class _ParentHomeState extends State<ParentHome> {
  bool _isLoading = true;
  Map<String, dynamic>? _studentDetails;
  List<dynamic> _assignments = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.studentId != null) {
        _studentDetails = await ApiService().getStudentDetails(user!.studentId!);
        _assignments = await ApiService().getStudentAssignments(user.studentId!);
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryColor),
      );
    }

    final user = Provider.of<AuthProvider>(context).currentUser;
    final sName = _studentDetails?['name'] ?? 'Unknown';
    final sRoll = _studentDetails?['rollNum']?.toString() ?? 'N/A';
    final sClass = _studentDetails?['sclassName']?['sclassName'] ?? 'N/A';
    final sSchool = _studentDetails?['school']?['schoolName'] ?? 'N/A';

    // Calculate Attendance Stats
    final attendance = (_studentDetails?['attendance'] as List<dynamic>?) ?? [];
    int present = 0;
    int absent = 0;
    for (var a in attendance) {
      if (a['status'] == 'Present') present++;
      if (a['status'] == 'Absent') absent++;
    }
    final attendancePercentage = attendance.isNotEmpty 
        ? ((present / attendance.length) * 100).toStringAsFixed(1) 
        : '0';

    // Calculate Assignments Stats
    int submitted = 0;
    int pending = 0;
    for (var a in _assignments) {
      final statuses = (a['studentStatus'] as List<dynamic>?) ?? [];
      final myStatus = statuses.firstWhere(
        (ss) => (ss['student']?['_id'] ?? ss['student']) == user?.studentId,
        orElse: () => null,
      );
      if (myStatus != null && myStatus['status'] == 'Submitted') {
        submitted++;
      } else {
        pending++;
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'Welcome, ${user?.name ?? 'Parent'}',
            subtitle: 'Here is an overview of your child\'s progress.',
          ),
          
          // Child Information
          PremiumCard(
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: const BoxDecoration(
                    color: AppTheme.backgroundColor,
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16)),
                    border: Border(bottom: BorderSide(color: AppTheme.borderColor)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.person_rounded, color: AppTheme.primaryColor, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Child Information',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      _buildInfoRow('Student Name', sName),
                      const Divider(height: 24, color: AppTheme.borderColor),
                      _buildInfoRow('Roll Number', sRoll),
                      const Divider(height: 24, color: AppTheme.borderColor),
                      _buildInfoRow('Class Enrolled', sClass),
                      const Divider(height: 24, color: AppTheme.borderColor),
                      _buildInfoRow('School', sSchool),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Row for KPIs
          Row(
            children: [
              // Attendance Overview
              Expanded(
                child: PremiumCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.fact_check_rounded, color: Color(0xFF10B981), size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Attendance',
                            style: Theme.of(context).textTheme.labelLarge,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '$attendancePercentage%',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Color(0xFF10B981), letterSpacing: -1),
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          _buildMiniBadge(Icons.check_circle_rounded, '$present', const Color(0xFF10B981), const Color(0xFFD1FAE5)),
                          _buildMiniBadge(Icons.cancel_rounded, '$absent', const Color(0xFFEF4444), const Color(0xFFFEE2E2)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              
              // Assignments Overview
              Expanded(
                child: PremiumCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.assignment_rounded, color: AppTheme.primaryColor, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Assignments',
                            style: Theme.of(context).textTheme.labelLarge,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '${_assignments.length}',
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppTheme.primaryColor, letterSpacing: -1),
                      ),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          _buildMiniBadge(Icons.task_alt_rounded, '$submitted', const Color(0xFF10B981), const Color(0xFFD1FAE5)),
                          _buildMiniBadge(Icons.pending_actions_rounded, '$pending', const Color(0xFFF59E0B), const Color(0xFFFEF3C7)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Attendance
          PremiumCard(
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: const BoxDecoration(
                    color: AppTheme.backgroundColor,
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16)),
                    border: Border(bottom: BorderSide(color: AppTheme.borderColor)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_month_rounded, color: AppTheme.primaryColor, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Recent Attendance Log',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: attendance.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Center(
                          child: Text(
                            'No attendance records found.',
                            style: TextStyle(color: AppTheme.textSecondary),
                          ),
                        ),
                      )
                    : Column(
                        children: attendance.take(5).map((a) {
                          final isPresent = a['status'] == 'Present';
                          return ListTile(
                            leading: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: isPresent ? const Color(0xFFD1FAE5) : const Color(0xFFFEE2E2),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(
                                isPresent ? Icons.check_rounded : Icons.close_rounded,
                                color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                              ),
                            ),
                            title: Text(
                              a['date'] != null ? a['date'].toString().split('T')[0] : 'Unknown Date',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                a['status'] ?? 'Unknown',
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
        ),
        Text(
          value,
          style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }

  Widget _buildMiniBadge(IconData icon, String value, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
