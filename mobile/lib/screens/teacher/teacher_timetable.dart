import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class TeacherTimetable extends StatelessWidget {
  const TeacherTimetable({super.key});

  final List<String> days = const ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: FutureBuilder<List<dynamic>>(
        future: ApiService().getTeacherTimetable(user?.id ?? ''),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final items = snapshot.data ?? [];

          return ListView.builder(
            itemCount: days.length,
            itemBuilder: (context, index) {
              final day = days[index];
              final dayData = items.firstWhere((i) => i['day'] == day, orElse: () => null);

              final periods = (dayData?['periods'] as List<dynamic>?) ?? [];

              return Card(
                margin: const EdgeInsets.only(bottom: 16.0),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(day, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      periods.isEmpty
                          ? const Text('No periods')
                          : Wrap(
                              spacing: 8.0,
                              runSpacing: 8.0,
                              children: periods.map((p) {
                                final start = p['start'] ?? '';
                                final end = p['end'] ?? '';
                                final sub = p['subject']?['subName'] ?? '';
                                final cName = dayData?['sclassName']?['sclassName'] ?? '';
                                return Chip(
                                  label: Text('$start-$end • $sub • Class $cName'),
                                  backgroundColor: Colors.blue.shade100,
                                );
                              }).toList(),
                            )
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
