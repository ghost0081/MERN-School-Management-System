import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class TeacherClass extends StatelessWidget {
  const TeacherClass({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Class Students',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  // Show add assignment dialog/screen
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('New Assignment coming soon')));
                },
                icon: const Icon(Icons.add),
                label: const Text('New Assignment'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getClassStudents(user?.sclassId ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No students found.'));
                }

                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final student = snapshot.data![index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(
                          child: Text(student['name']?[0] ?? 'S'),
                        ),
                        title: Text(student['name'] ?? 'Unknown'),
                        subtitle: Text('Roll No: ${student['rollNum'] ?? '-'}'),
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$value action selected')));
                          },
                          itemBuilder: (BuildContext context) {
                            return {'Take Attendance', 'Provide Marks', 'Assignments'}.map((String choice) {
                              return PopupMenuItem<String>(
                                value: choice,
                                child: Text(choice),
                              );
                            }).toList();
                          },
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
