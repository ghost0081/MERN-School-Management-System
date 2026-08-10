import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherComplain extends StatefulWidget {
  const TeacherComplain({super.key});

  @override
  State<TeacherComplain> createState() => _TeacherComplainState();
}

class _TeacherComplainState extends State<TeacherComplain> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  bool _isSubmitting = false;

  void _submitComplain() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSubmitting = true);
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
    
    try {
      await ApiService().createComplain(
        user?.id ?? '',
        DateTime.now().toIso8601String(),
        'Title: ${_titleController.text}\nDescription: ${_descController.text}',
        user?.schoolId ?? '',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Complaint Submitted'),
          backgroundColor: Color(0xFF10B981),
        ));
        _titleController.clear();
        _descController.clear();
        setState(() {});
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: const Color(0xFFEF4444)));
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
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
            title: 'Teacher Feedback & Issue Escalation',
            subtitle: 'Submit official issues or feedback directly to administration.',
          ),

          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('New Complaint', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Title / Subject'),
                    validator: (val) => val!.isEmpty ? 'Title is required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _descController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Description / Details'),
                    validator: (val) => val!.isEmpty ? 'Description is required' : null,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitComplain,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Submit Complaint', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          Text('Submitted Complaints', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),

          FutureBuilder<List<dynamic>>(
            future: ApiService().getComplains(user?.schoolId ?? ''),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
              } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                return const PremiumCard(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text('No complaints submitted yet.', style: TextStyle(color: AppTheme.textSecondary)),
                    ),
                  ),
                );
              }

              final complains = snapshot.data!.where((c) => c['user'] != null && (c['user']['_id'] == user?.id || c['user'] == user?.id)).toList();
              
              if (complains.isEmpty) {
                return const PremiumCard(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text('You have not submitted any complaints yet.', style: TextStyle(color: AppTheme.textSecondary)),
                    ),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: complains.length,
                itemBuilder: (context, index) {
                  final c = complains[index];
                  final date = c['date'] != null ? DateFormat('MMM dd, yyyy').format(DateTime.parse(c['date'])) : '';

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: PremiumCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(c['title'] ?? 'Complaint', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                              Text(date, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(c['description'] ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
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
