import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields and dates')));
      return;
    }

    setState(() => _isSubmitting = true);
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;

    try {
      // Assuming a createLeave endpoint exists or mock it
      // ApiService().createLeave({...})
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave request submitted (API logic pending)')));
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

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Request Leave', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _reasonController,
                      decoration: const InputDecoration(labelText: 'Reason', border: OutlineInputBorder()),
                      validator: (val) => val!.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: Text(_fromDate == null ? 'From: Not set' : 'From: ${DateFormat('MMM dd').format(_fromDate!)}'),
                        ),
                        TextButton(
                          onPressed: () async {
                            final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2100));
                            if (d != null) setState(() => _fromDate = d);
                          },
                          child: const Text('Pick Date'),
                        )
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Text(_toDate == null ? 'To: Not set' : 'To: ${DateFormat('MMM dd').format(_toDate!)}'),
                        ),
                        TextButton(
                          onPressed: () async {
                            final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2100));
                            if (d != null) setState(() => _toDate = d);
                          },
                          child: const Text('Pick Date'),
                        )
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitLeave,
                        child: const Text('Submit'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Align(alignment: Alignment.centerLeft, child: Text('Leave History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          const SizedBox(height: 10),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: ApiService().getTeacherLeaves(user?.id ?? ''),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                if (!snapshot.hasData || snapshot.data!.isEmpty) return const Center(child: Text('No leaves found.'));

                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    final l = snapshot.data![index];
                    Color statusColor = l['status'] == 'Approved' ? Colors.green : (l['status'] == 'Rejected' ? Colors.red : Colors.orange);
                    return Card(
                      child: ListTile(
                        title: Text(l['reason'] ?? ''),
                        subtitle: Text('${DateFormat('MMM dd, yyyy').format(DateTime.parse(l['date'] ?? l['fromDate']))}'), // some APIs use date or fromDate
                        trailing: Chip(label: Text(l['status'] ?? 'Pending'), backgroundColor: statusColor, labelStyle: const TextStyle(color: Colors.white)),
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
