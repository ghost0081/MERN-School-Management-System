import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Complain Submitted')));
        _titleController.clear();
        _descController.clear();
        setState(() {}); // Refresh list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
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

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Submission Form
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('New Complain', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
                      validator: (val) => val!.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _descController,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
                      validator: (val) => val!.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitComplain,
                        child: _isSubmitting ? const CircularProgressIndicator() : const Text('Submit Complain'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text('Previous Complains', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 10),
          // List of Complains
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getComplains(user?.schoolId ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No complains found.'));
                }

                // Filter for this user only if needed, but backend usually returns school complains. 
                // Let's assume we show all complains for the school or filter by user id.
                final complains = snapshot.data!.where((c) => c['user'] != null && (c['user']['_id'] == user?.id || c['user'] == user?.id)).toList();
                
                if (complains.isEmpty) {
                   return const Center(child: Text('You have not made any complains yet.'));
                }

                return ListView.builder(
                  itemCount: complains.length,
                  itemBuilder: (context, index) {
                    final c = complains[index];
                    return Card(
                      child: ListTile(
                        title: Text(c['title'] ?? 'No Title'),
                        subtitle: Text(c['description'] ?? ''),
                        trailing: Text(c['date'] != null ? DateFormat('MMM dd, yyyy').format(DateTime.parse(c['date'])) : ''),
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
