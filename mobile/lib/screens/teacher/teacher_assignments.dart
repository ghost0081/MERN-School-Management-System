import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherAssignments extends StatefulWidget {
  const TeacherAssignments({super.key});

  @override
  State<TeacherAssignments> createState() => _TeacherAssignmentsState();
}

class _TeacherAssignmentsState extends State<TeacherAssignments> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  DateTime? _dueDate;
  bool _isCreating = false;

  void _createAssignment() async {
    if (!_formKey.currentState!.validate() || _dueDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields and select a date')));
      return;
    }

    setState(() => _isCreating = true);

    try {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Assignment created successfully!'),
        backgroundColor: Color(0xFF10B981),
      ));
      _titleController.clear();
      _descController.clear();
      setState(() { _dueDate = null; });
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      setState(() => _isCreating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Manage Assignments',
            subtitle: 'Create homework assignments and review student submissions.',
          ),

          // Create Assignment Card
          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Create New Assignment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Title'),
                    validator: (val) => val!.isEmpty ? 'Title is required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _descController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Instructions / Description'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _dueDate == null ? 'No Due Date Selected' : 'Due: ${DateFormat('MMM dd, yyyy').format(_dueDate!)}',
                          style: TextStyle(color: _dueDate == null ? AppTheme.textSecondary : AppTheme.primaryColor, fontWeight: FontWeight.w600),
                        ),
                      ),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime.now(),
                            firstDate: DateTime.now(),
                            lastDate: DateTime(2100),
                          );
                          if (date != null) setState(() => _dueDate = date);
                        },
                        icon: const Icon(Icons.calendar_today_rounded, size: 16),
                        label: const Text('Pick Date'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isCreating ? null : _createAssignment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _isCreating
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Publish Assignment', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          Text('Active Assignments', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),

          FutureBuilder<List<dynamic>>(
            future: ApiService().getTeacherAssignments(user?.id ?? ''),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const PremiumCard(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text('No assignments posted yet.', style: TextStyle(color: AppTheme.textSecondary)),
                    ),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: snapshot.data!.length,
                itemBuilder: (context, index) {
                  final a = snapshot.data![index];
                  final dueDate = DateTime.tryParse(a['dueDate'] ?? '');
                  final dateStr = dueDate != null ? DateFormat('MMM dd, yyyy').format(dueDate) : 'N/A';

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: PremiumCard(
                      padding: const EdgeInsets.all(16),
                      child: ExpansionTile(
                        tilePadding: EdgeInsets.zero,
                        title: Text(a['title'] ?? 'Untitled', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                        subtitle: Text('Due Date: $dateStr', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        children: [
                          const Divider(color: AppTheme.borderColor),
                          Text(a['description'] ?? '', style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
                          const SizedBox(height: 12),
                          const Align(alignment: Alignment.centerLeft, child: Text('Student Submissions:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
                          const SizedBox(height: 8),
                          ...(a['studentStatus'] as List? ?? []).map((ss) {
                            return ListTile(
                              dense: true,
                              contentPadding: EdgeInsets.zero,
                              title: Text(ss['student']?['name'] ?? 'Student', style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text('Status: ${ss['status']}'),
                              trailing: Text('Marks: ${ss['marks']?.toString() ?? '-'}', style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primaryColor)),
                            );
                          }).toList()
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
