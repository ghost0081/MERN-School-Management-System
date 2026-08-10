import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import '../../theme.dart';

import 'student_home.dart';
import 'student_subjects.dart';
import 'student_attendance.dart';
import 'student_assignments.dart';
import 'student_timetable.dart';
import 'student_complain.dart';
import 'student_profile.dart';

/*
 * StudentDashboard — Premium UI Rewrite
 * 
 * Replaces default Material Drawer with a stylized premium navigation drawer.
 */
class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const StudentHome(),
    const StudentSubjects(),
    const StudentAttendance(),
    const StudentAssignments(),
    const StudentTimetable(),
    const StudentComplain(),
    const StudentProfile(),
  ];

  final List<String> _titles = [
    'Dashboard',
    'My Subjects',
    'Attendance Record',
    'Assignments',
    'Timetable',
    'Complaints',
    'My Profile',
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    Navigator.pop(context); // Close the drawer
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      drawer: Drawer(
        backgroundColor: AppTheme.backgroundColor,
        child: Column(
          children: [
            // Premium Drawer Header
            Container(
              width: double.infinity,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 24,
                bottom: 24,
                left: 24,
                right: 24,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.primaryColor,
                    Color(0xFF3B82F6), // Blue 500
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.school_rounded,
                      size: 32,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'SchoolMS',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.name ?? 'Student Portal',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            
            // Drawer Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                children: [
                  _buildDrawerItem(0, 'Dashboard', Icons.space_dashboard_rounded),
                  _buildDrawerItem(1, 'Subjects', Icons.book_rounded),
                  _buildDrawerItem(2, 'Attendance', Icons.fact_check_rounded),
                  _buildDrawerItem(3, 'Assignments', Icons.assignment_rounded),
                  _buildDrawerItem(4, 'Timetable', Icons.schedule_rounded),
                  _buildDrawerItem(5, 'Complaints', Icons.report_problem_rounded),
                  
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0, top: 16.0, bottom: 8.0),
                    child: Text(
                      'ACCOUNT',
                      style: TextStyle(
                        color: AppTheme.textDisabled,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  
                  _buildDrawerItem(6, 'Profile', Icons.person_rounded),
                ],
              ),
            ),

            // Logout Button at bottom
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                leading: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
                title: const Text(
                  'Sign Out',
                  style: TextStyle(
                    color: Color(0xFFEF4444),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                tileColor: const Color(0xFFFEF2F2),
                onTap: () async {
                  await Provider.of<AuthProvider>(context, listen: false).logout();
                  if (context.mounted) {
                    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
                  }
                },
              ),
            ),
          ],
        ),
      ),
      body: _screens[_selectedIndex],
    );
  }

  Widget _buildDrawerItem(int index, String title, IconData icon) {
    final isSelected = _selectedIndex == index;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        leading: Icon(
          icon, 
          color: isSelected ? AppTheme.primaryColor : AppTheme.textSecondary,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? AppTheme.primaryColor : AppTheme.textPrimary,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        selected: isSelected,
        tileColor: isSelected ? AppTheme.primaryLight : Colors.transparent,
        onTap: () => _onItemTapped(index),
      ),
    );
  }
}
