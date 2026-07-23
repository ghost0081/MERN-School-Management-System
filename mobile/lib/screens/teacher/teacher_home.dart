import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class TeacherHome extends StatefulWidget {
  const TeacherHome({super.key});

  @override
  State<TeacherHome> createState() => _TeacherHomeState();
}

class _TeacherHomeState extends State<TeacherHome> {
  int _classStudents = 0;
  int _totalLessons = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      
      final students = await ApiService().getClassStudents(user?.sclassId ?? '');
      _classStudents = students.length;

      if (user?.teachSubjectId != null && user!.teachSubjectId!.isNotEmpty) {
        final subjectDetails = await ApiService().getSubjectDetails(user.teachSubjectId!);
        _totalLessons = int.tryParse(subjectDetails['sessions']?.toString() ?? '0') ?? 0;
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildCard(context, 'Class Students', '$_classStudents', Icons.groups, Colors.blue),
                _buildCard(context, 'Total Lessons', '$_totalLessons', Icons.book, Colors.green),
                _buildCard(context, 'Tests Taken', '24', Icons.assignment, Colors.orange),
                _buildCard(context, 'Total Hours', '30hrs', Icons.access_time, Colors.redAccent),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'No Notices to Show Right Now',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context, String title, String data, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 40, color: color),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(data, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green[700])),
        ],
      ),
    );
  }
}
