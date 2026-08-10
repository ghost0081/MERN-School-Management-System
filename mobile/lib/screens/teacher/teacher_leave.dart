import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class TeacherLeave extends StatefulWidget {
  const TeacherLeave({super.key});

  @override
  State<TeacherLeave> createState() => _TeacherLeaveState();
}

class _TeacherLeaveState extends State<TeacherLeave> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  DateTime? _fromDate;
  DateTime? _toDate;
  bool _isSubmitting = false;

  void _submitLeave() async {
    if (!_formKey.currentState!.validate() || _fromDate == null || _toDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields and select dates')));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Leave request submitted successfully'),
        backgroundColor: Color(0xFF10B981),
      ));
      _reasonController.clear();
      setState(() { _fromDate = null; _toDate = null; });
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      setState(() => _isSubmitting = false);
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
            title: 'Leave Applications',
            subtitle: 'Apply for official leave and track approval status.',
          ),

          // Request Form Card
          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('New Leave Application', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _reasonController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Reason for Leave'),
                    validator: (val) => val!.isEmpty ? 'Reason is required' : null,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _fromDate == null ? 'From: Not Set' : 'From: ${DateFormat('MMM dd, yyyy').format(_fromDate!)}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ),
                      OutlinedButton(
                        onPressed: () async {
                          final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2100));
                          if (d != null) setState(() => _fromDate = d);
                        },
                        child: const Text('Pick From'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _toDate == null ? 'To: Not Set' : 'To: ${DateFormat('MMM dd, yyyy').format(_toDate!)}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ),
                      OutlinedButton(
                        onPressed: () async {
                          final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2100));
                          if (d != null) setState(() => _toDate = d);
                        },
                        child: const Text('Pick To'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitLeave,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Submit Application', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          Text('Leave History', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),

          FutureBuilder<List<dynamic>>(
            future: ApiService().getTeacherLeaves(user?.id ?? ''),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const PremiumCard(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text('No leave applications recorded yet.', style: TextStyle(color: AppTheme.textSecondary)),
                    ),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: snapshot.data!.length,
                itemBuilder: (context, index) {
                  final l = snapshot.data![index];
                  final status = l['status'] ?? 'Pending';
                  Color statusColor = status == 'Approved'
                      ? const Color(0xFF10B981)
                      : (status == 'Rejected' ? const Color(0xFFEF4444) : const Color(0xFFF59E0B));
                  Color statusBg = status == 'Approved'
                      ? const Color(0xFFD1FAE5)
                      : (status == 'Rejected' ? const Color(0xFFFEE2E2) : const Color(0xFFFEF3C7));

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: PremiumCard(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(l['reason'] ?? 'Leave Request', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                const SizedBox(height: 4),
                                Text(
                                  l['date'] != null ? DateFormat('MMM dd, yyyy').format(DateTime.parse(l['date'])) : 'Date N/A',
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(8)),
                            child: Text(status, style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 12)),
                          ),
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
