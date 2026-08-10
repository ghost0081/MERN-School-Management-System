import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class StudentComplain extends StatefulWidget {
  const StudentComplain({super.key});

  @override
  State<StudentComplain> createState() => _StudentComplainState();
}

class _StudentComplainState extends State<StudentComplain> {
  final _formKey = GlobalKey<FormState>();
  final _complainController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _complainController.dispose();
    super.dispose();
  }

  void _submitComplain(String userId, String schoolId) async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSubmitting = true);
    
    try {
      final date = DateTime.now().toIso8601String();
      await ApiService().createComplain(userId, date, _complainController.text, schoolId);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Complaint submitted successfully'),
        backgroundColor: Color(0xFF10B981),
      ));
      _complainController.clear();
      setState(() {});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: const Color(0xFFEF4444),
        ));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'Feedback & Complaints',
            subtitle: 'Submit feedback or report issues directly to the administration.',
          ),

          // New Complaint Form
          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('New Complaint', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _complainController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Describe your issue or feedback in detail...',
                    ),
                    validator: (v) => v!.isEmpty ? 'Please enter your complaint text' : null,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : () => _submitComplain(user?.id ?? '', user?.schoolId ?? ''),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Submit Complaint', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          Text('Your Previous Complaints', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),

          FutureBuilder<List<dynamic>>(
            future: ApiService().getComplains(user?.schoolId ?? ''),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Color(0xFFEF4444))));
              }

              final complains = snapshot.data ?? [];
              final myComplains = complains.where((c) {
                final cUser = c['user'];
                return cUser == user?.id || (cUser is Map && cUser['_id'] == user?.id);
              }).toList();

              if (myComplains.isEmpty) {
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
                itemCount: myComplains.length,
                itemBuilder: (context, index) {
                  final complain = myComplains[index];
                  final date = DateTime.tryParse(complain['date'] ?? '');
                  final dateStr = date != null ? DateFormat('MMM dd, yyyy').format(date) : 'Unknown Date';

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
                              Text(dateStr, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w600)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                                child: const Text('Submitted', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.w700)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(complain['complaint'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
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
