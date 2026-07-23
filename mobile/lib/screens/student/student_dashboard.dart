import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

import 'student_home.dart';
import 'student_subjects.dart';
import 'student_attendance.dart';
import 'student_assignments.dart';
import 'student_timetable.dart';
import 'student_complain.dart';
import 'student_profile.dart';

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
    'Home',
    'Subjects',
    'Attendance',
    'Assignments',
    'Timetable',
    'Complain',
    'Profile',
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    Navigator.pop(context); // Close the drawer
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
              ),
              child: const Center(
                child: Text(
                  'School CRM',
                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            _buildDrawerItem(0, 'Home', Icons.home),
            _buildDrawerItem(1, 'Subjects', Icons.book),
            _buildDrawerItem(2, 'Attendance', Icons.fact_check),
            _buildDrawerItem(3, 'Assignments', Icons.assignment),
            _buildDrawerItem(4, 'Timetable', Icons.schedule),
            _buildDrawerItem(5, 'Complain', Icons.report_problem),
            const Divider(),
            const Padding(
              padding: EdgeInsets.only(left: 16.0, top: 8.0, bottom: 8.0),
              child: Text('User', style: TextStyle(color: Colors.grey)),
            ),
            _buildDrawerItem(6, 'Profile', Icons.person),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () async {
                await Provider.of<AuthProvider>(context, listen: false).logout();
                if (context.mounted) {
                  Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
                }
              },
            ),
          ],
        ),
      ),
      body: _screens[_selectedIndex],
    );
  }

  Widget _buildDrawerItem(int index, String title, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: _selectedIndex == index ? Theme.of(context).primaryColor : null),
      title: Text(
        title,
        style: TextStyle(
          color: _selectedIndex == index ? Theme.of(context).primaryColor : null,
          fontWeight: _selectedIndex == index ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: _selectedIndex == index,
      onTap: () => _onItemTapped(index),
    );
  }
}
