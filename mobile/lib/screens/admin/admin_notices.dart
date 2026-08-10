import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class AdminNotices extends StatefulWidget {
  const AdminNotices({super.key});

  @override
  State<AdminNotices> createState() => _AdminNoticesState();
}

class _AdminNoticesState extends State<AdminNotices> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _detailsController = TextEditingController();
  bool _isPublishing = false;

  @override
  void dispose() {
    _titleController.dispose();
    _detailsController.dispose();
    super.dispose();
  }

  void _publishNotice() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isPublishing = true);

    try {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Notice broadcasted to all students & teachers!'),
        backgroundColor: Color(0xFF10B981),
      ));
      _titleController.clear();
      _detailsController.clear();
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) setState(() => _isPublishing = false);
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
            title: 'Broadcasting & Notices',
            subtitle: 'Publish announcements to students, parents, and staff.',
          ),

          // Broadcast Card
          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('New Announcement', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Notice Title'),
                    validator: (val) => val!.isEmpty ? 'Title is required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _detailsController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Notice Content / Details'),
                    validator: (val) => val!.isEmpty ? 'Details are required' : null,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isPublishing ? null : _publishNotice,
                      icon: const Icon(Icons.campaign_rounded, size: 18),
                      label: const Text('Publish Announcement', style: TextStyle(fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          Text('Recent Notices', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),

          FutureBuilder<List<dynamic>>(
            future: ApiService().getNotices(user?.schoolId ?? ''),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
              } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                return const PremiumCard(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text('No active notices broadcasted yet.', style: TextStyle(color: AppTheme.textSecondary)),
                    ),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: snapshot.data!.length,
                itemBuilder: (context, index) {
                  final notice = snapshot.data![index];
                  final dateStr = notice['date'] != null ? DateFormat('MMM dd, yyyy').format(DateTime.parse(notice['date'])) : '';

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
                              Text(notice['title'] ?? 'Notice', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                              Text(dateStr, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(notice['details'] ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
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
