import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class AdminFinancials extends StatefulWidget {
  const AdminFinancials({super.key});

  @override
  State<AdminFinancials> createState() => _AdminFinancialsState();
}

class _AdminFinancialsState extends State<AdminFinancials> {
  List<dynamic> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchFinancials();
  }

  Future<void> _fetchFinancials() async {
    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user?.schoolId != null) {
        _products = await ApiService().getStationery(user!.schoolId);
      }
    } catch (e) {
      debugPrint(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
    }

    final totalInventoryValue = _products.fold(0.0, (sum, item) => sum + ((item['quantity'] ?? 0) * (item['pricePerUnit'] ?? 0)));

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            title: 'School Financials & Revenue',
            subtitle: 'Overview of store inventory value, fees, and ledger summaries.',
          ),

          // Total Value Card
          PremiumCard(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '₹${totalInventoryValue.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Color(0xFF10B981), letterSpacing: -1),
                    ),
                    const SizedBox(height: 4),
                    const Text('Total Stationery Inventory Value', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD1FAE5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF10B981), size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          Text('Store Items Ledger', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),

          Expanded(
            child: _products.isEmpty
                ? const PremiumCard(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text('No store inventory items found.', style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    ),
                  )
                : ListView.builder(
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final item = _products[index];
                      final qty = item['quantity'] ?? 0;
                      final price = item['pricePerUnit'] ?? 0;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: PremiumCard(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['name'] ?? 'Item', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text('Stock: $qty ${item['unit'] ?? ''} • ₹$price each', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                                ],
                              ),
                              Text('₹${qty * price}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.primaryColor)),
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
