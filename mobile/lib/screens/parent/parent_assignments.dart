import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class ParentAssignments extends StatefulWidget {
  const ParentAssignments({super.key});

  @override
  State<ParentAssignments> createState() => _ParentAssignmentsState();
}

class _ParentAssignmentsState extends State<ParentAssignments> {
  bool _isLoading = true;
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
        _assignments = await ApiService().getStudentAssignments(user!.studentId!);
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final user = Provider.of<AuthProvider>(context).currentUser;

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
        pending++; // 'Assigned' or 'Pending'
      }
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Assignments', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),

          // Overall Stats
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Text('Assignment Overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Chip(label: Text('Submitted: $submitted'), backgroundColor: Colors.green.shade100),
                      Chip(label: Text('Pending: $pending'), backgroundColor: Colors.orange.shade100),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text('Total Assignments: ${_assignments.length}', style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Assignment List
          Expanded(
            child: _assignments.isEmpty
                ? const Center(child: Text('No assignments', style: TextStyle(color: Colors.grey)))
                : ListView.builder(
                    itemCount: _assignments.length,
                    itemBuilder: (context, index) {
                      final a = _assignments[index];
                      final statuses = (a['studentStatus'] as List<dynamic>?) ?? [];
                      final myStatus = statuses.firstWhere(
                        (ss) => (ss['student']?['_id'] ?? ss['student']) == user?.studentId,
                        orElse: () => null,
                      );

                      final statusText = myStatus?['status'] ?? 'Pending';
                      final marks = myStatus?['marks'];
                      final dueDate = a['dueDate'] != null ? DateTime.tryParse(a['dueDate']) : null;
                      
                      final isOverdue = dueDate != null && dueDate.isBefore(DateTime.now()) && statusText != 'Submitted';

                      Color statusColor = Colors.orange;
                      if (statusText == 'Submitted') statusColor = Colors.green;
                      else if (isOverdue) statusColor = Colors.red;

                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(a['title'] ?? 'No Title', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  ),
                                  Chip(
                                    label: Text(statusText),
                                    backgroundColor: statusColor,
                                    labelStyle: const TextStyle(color: Colors.white),
                                  ),
                                ],
                              ),
                              const Divider(),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('Subject: ${a['subject']?['subName'] ?? 'N/A'}'),
                                  Text('Due: ${dueDate != null ? DateFormat('MMM dd, yyyy').format(dueDate) : 'N/A'}'),
                                ],
                              ),
                              if (a['description'] != null && a['description'].toString().isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(a['description'], style: const TextStyle(color: Colors.grey)),
                              ],
                              if (statusText == 'Submitted' && marks != null) ...[
                                const SizedBox(height: 8),
                                Chip(label: Text('Marks: $marks'), backgroundColor: Colors.blue.shade100),
                              ],
                              if (isOverdue) ...[
                                const SizedBox(height: 8),
                                const Chip(label: Text('Overdue'), backgroundColor: Colors.red, labelStyle: TextStyle(color: Colors.white)),
                              ]
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
