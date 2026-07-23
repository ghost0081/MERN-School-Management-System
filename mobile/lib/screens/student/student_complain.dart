import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Complain submitted successfully')));
      _complainController.clear();
      setState(() {}); // Refresh list
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Complains',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getComplains(user?.schoolId ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }

                final complains = snapshot.data ?? [];
                
                // Filter complains to only show this student's complains (assuming backend returns all for school)
                final myComplains = complains.where((c) {
                  final cUser = c['user'];
                  return cUser == user?.id || (cUser is Map && cUser['_id'] == user?.id);
                }).toList();

                if (myComplains.isEmpty) {
                  return const Center(child: Text('You have no complains.'));
                }

                return ListView.builder(
                  itemCount: myComplains.length,
                  itemBuilder: (context, index) {
                    final complain = myComplains[index];
                    final date = DateTime.tryParse(complain['date'] ?? '');
                    final dateStr = date != null ? DateFormat('MM/dd/yyyy').format(date) : 'Unknown';

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text(dateStr, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(complain['complaint'] ?? '', style: const TextStyle(fontSize: 16, color: Colors.black87)),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          const Text('New Complain', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Form(
            key: _formKey,
            child: Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _complainController,
                    decoration: const InputDecoration(
                      hintText: 'Write your complain here...',
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) => v!.isEmpty ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isSubmitting ? null : () => _submitComplain(user?.id ?? '', user?.schoolId ?? ''),
                  child: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('SUBMIT'),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
