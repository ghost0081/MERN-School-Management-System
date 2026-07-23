import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

class ParentFees extends StatefulWidget {
  const ParentFees({super.key});

  @override
  State<ParentFees> createState() => _ParentFeesState();
}

class _ParentFeesState extends State<ParentFees> {
  bool _isLoading = true;
  List<dynamic> _feesList = [];
  String _selectedMonth = '';
  final List<Map<String, String>> _monthsList = [];

  @override
  void initState() {
    super.initState();
    _generateMonths();
    _fetchData();
  }

  void _generateMonths() {
    final now = DateTime.now();
    for (int i = 0; i < 12; i++) {
      final d = DateTime(now.year, now.month - i, 1);
      final monthStr = '${d.year}-${d.month.toString().padLeft(2, '0')}';
      final monthLabel = DateFormat('MMMM yyyy').format(d);
      _monthsList.add({'value': monthStr, 'label': monthLabel});
    }
    _selectedMonth = _monthsList.first['value']!;
  }

  Future<void> _fetchData() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.studentId != null) {
        // Assume ApiService().getStudentFeeHistory exists, if not we add it. 
        // Wait, earlier I saw: Future<List<dynamic>> getStudentFeeHistory(String studentId) async in api_service.dart
        _feesList = await ApiService().getStudentFeeHistory(user!.studentId!);
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  DateTime? _calculateNextPaymentDate(String lastPaidMonth, String duration) {
    if (lastPaidMonth.isEmpty) return null;
    final parts = lastPaidMonth.split('-');
    if (parts.length != 2) return null;
    final year = int.parse(parts[0]);
    final month = int.parse(parts[1]);
    
    DateTime nextDate = DateTime(year, month - 1, 1);
    int monthsToAdd = 1;
    if (duration == '3 months') monthsToAdd = 3;
    else if (duration == '6 months') monthsToAdd = 6;
    else if (duration == 'Annual') monthsToAdd = 12;
    
    return DateTime(nextDate.year, nextDate.month + monthsToAdd, 1);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    // Calculate Summary
    final paidFeesList = _feesList.where((f) => f['status'] == 'Paid').toList();
    final totalPaidAmount = paidFeesList.fold<double>(0.0, (sum, f) => sum + (double.tryParse(f['amount']?.toString() ?? '0') ?? 0.0));
    final unpaidFeesCount = _feesList.length - paidFeesList.length;
    final paidFeesCount = paidFeesList.length;

    // Find most recent paid fee
    paidFeesList.sort((a, b) {
      final monthCompare = (b['month'] ?? '').compareTo(a['month'] ?? '');
      if (monthCompare != 0) return monthCompare;
      final dateA = a['paidDate'] != null ? DateTime.tryParse(a['paidDate']) ?? DateTime(0) : DateTime(0);
      final dateB = b['paidDate'] != null ? DateTime.tryParse(b['paidDate']) ?? DateTime(0) : DateTime(0);
      return dateB.compareTo(dateA);
    });

    final mostRecentPaidFee = paidFeesList.isNotEmpty ? paidFeesList.first : null;
    final nextPaymentDate = mostRecentPaidFee != null 
        ? _calculateNextPaymentDate(mostRecentPaidFee['month'], mostRecentPaidFee['duration'] ?? 'Monthly')
        : null;

    final filteredFees = _feesList.where((f) => f['month'] == _selectedMonth).toList();
    final currentMonthFee = filteredFees.isNotEmpty ? filteredFees.first : null;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          const Text('Fee Payment Status', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const Text('View your child\'s fee payment status. Only admins can update payment status.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),

          // Month Dropdown
          Card(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _selectedMonth,
                  items: _monthsList.map((m) => DropdownMenuItem(value: m['value'], child: Text(m['label']!))).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedMonth = val);
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Summary Cards
          Row(
            children: [
              Expanded(
                child: Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const Text('Total Paid', style: TextStyle(color: Colors.grey)),
                        const SizedBox(height: 5),
                        Text('₹${totalPaidAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, color: Colors.green, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const Text('Payment Status', style: TextStyle(color: Colors.grey)),
                        const SizedBox(height: 5),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Paid: $paidFeesCount', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 8),
                            Text('Unpaid: $unpaidFeesCount', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                          ],
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          
          if (nextPaymentDate != null)
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const Text('Next Payment Date', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 5),
                    Text(
                      DateFormat('MMM dd, yyyy').format(nextPaymentDate),
                      style: TextStyle(
                        fontSize: 20, 
                        color: nextPaymentDate.isBefore(DateTime.now()) ? Colors.red : Colors.blue, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                    if (nextPaymentDate.isBefore(DateTime.now()))
                      const Text('Payment overdue', style: TextStyle(color: Colors.red, fontSize: 12)),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 16),

          // Current Month Status
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${_monthsList.firstWhere((m) => m['value'] == _selectedMonth)['label']} Fee Status', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  if (currentMonthFee != null) ...[
                    Row(
                      children: [
                        Chip(
                          label: Text(currentMonthFee['status'] ?? 'Unknown'),
                          backgroundColor: currentMonthFee['status'] == 'Paid' ? Colors.green : Colors.red,
                          labelStyle: const TextStyle(color: Colors.white),
                        ),
                        const SizedBox(width: 16),
                        Text('Amount: ₹${currentMonthFee['amount'] ?? 0}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    if (currentMonthFee['paidDate'] != null)
                      Text('Paid on: ${DateFormat('MMM dd, yyyy').format(DateTime.parse(currentMonthFee['paidDate']))}', style: const TextStyle(color: Colors.grey)),
                  ] else ...[
                    Row(
                      children: [
                        const Chip(label: Text('Unpaid'), backgroundColor: Colors.red, labelStyle: TextStyle(color: Colors.white)),
                        const SizedBox(width: 16),
                        const Text('No record found for this month', style: TextStyle(color: Colors.grey)),
                      ],
                    )
                  ]
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          const Text('Fee Payment History', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          
          if (_feesList.isEmpty)
            const Text('No fee records found', style: TextStyle(color: Colors.grey))
          else
            ...(_feesList.toList()..sort((a, b) => (b['month'] ?? '').compareTo(a['month'] ?? ''))).map((fee) {
              final mLabel = _monthsList.firstWhere((m) => m['value'] == fee['month'], orElse: () => {'label': fee['month'] ?? ''})['label'];
              return Card(
                child: ListTile(
                  title: Text('$mLabel - ₹${fee['amount'] ?? 0}'),
                  subtitle: Text(fee['paidDate'] != null ? DateFormat('MMM dd, yyyy').format(DateTime.parse(fee['paidDate'])) : 'No date'),
                  trailing: Chip(
                    label: Text(fee['status'] ?? 'Unknown'),
                    backgroundColor: fee['status'] == 'Paid' ? Colors.green : Colors.red,
                    labelStyle: const TextStyle(color: Colors.white),
                  ),
                ),
              );
            }).toList(),
        ],
      ),
    );
  }
}
