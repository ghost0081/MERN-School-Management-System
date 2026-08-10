import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';
import '../../theme.dart';
import '../../widgets/premium_card.dart';
import '../../widgets/page_header.dart';

class ParentShop extends StatefulWidget {
  const ParentShop({super.key});

  @override
  State<ParentShop> createState() => _ParentShopState();
}

class _ParentShopState extends State<ParentShop> {
  bool _isLoading = true;
  List<dynamic> _products = [];
  final List<Map<String, dynamic>> _cart = [];
  bool _isCheckingOut = false;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
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

  void _addToCart(dynamic product) {
    final availableForSale = (product['quantity'] ?? 0) - (product['reorderLevel'] ?? 0);
    
    final existingIndex = _cart.indexWhere((i) => i['stationery'] == product['_id']);
    if (existingIndex >= 0) {
      final item = _cart[existingIndex];
      if (item['quantity'] + 1 > availableForSale) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cannot add more. Maximum available stock reached.')));
        return;
      }
      setState(() {
        _cart[existingIndex]['quantity']++;
      });
    } else {
      if (availableForSale <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cannot add. Product has reached minimum stock level.')));
        return;
      }
      setState(() {
        _cart.add({
          'stationery': product['_id'],
          'productName': product['name'],
          'quantity': 1,
          'unitPrice': product['pricePerUnit'],
          'unit': product['unit'],
        });
      });
    }
  }

  double _getCartTotal() {
    return _cart.fold(0.0, (sum, item) => sum + (item['quantity'] * item['unitPrice']));
  }

  void _checkout() async {
    if (_cart.isEmpty) return;
    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
    setState(() => _isCheckingOut = true);

    final payload = {
      'items': _cart.map((i) => {'stationery': i['stationery'], 'quantity': i['quantity']}).toList(),
      'customerName': user?.name ?? 'Parent',
      'tax': 0,
      'discount': 0,
      'paymentMethod': 'Cash',
      'paymentStatus': 'Paid',
      'schoolId': user?.schoolId,
      'remarks': 'Order placed by parent app',
    };

    try {
      await ApiService().createInvoice(payload);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Order placed successfully!'),
          backgroundColor: Color(0xFF10B981),
        ));
        setState(() {
          _cart.clear();
        });
        _fetchProducts();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: $e'),
          backgroundColor: const Color(0xFFEF4444),
        ));
      }
    } finally {
      if (mounted) setState(() => _isCheckingOut = false);
    }
  }

  void _showCartDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Shopping Cart', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, color: AppTheme.textSecondary),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: AppTheme.borderColor),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 300),
                      child: _cart.isEmpty
                          ? const Center(child: Text('Your cart is empty', style: TextStyle(color: AppTheme.textSecondary)))
                          : ListView.builder(
                              shrinkWrap: true,
                              itemCount: _cart.length,
                              itemBuilder: (context, i) {
                                final item = _cart[i];
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(item['productName'], style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                            const SizedBox(height: 2),
                                            Text('Qty: ${item['quantity']} × ₹${item['unitPrice']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                                          ],
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          Text('₹${item['quantity'] * item['unitPrice']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444)),
                                            onPressed: () {
                                              setState(() {
                                                _cart.removeAt(i);
                                              });
                                              setStateDialog(() {});
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),
                    const Divider(height: 24, color: AppTheme.borderColor),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Amount:', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                        Text('₹${_getCartTotal()}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.primaryColor)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    if (_cart.isNotEmpty)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isCheckingOut
                              ? null
                              : () {
                                  Navigator.pop(ctx);
                                  _checkout();
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: _isCheckingOut ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Text('Place Order (₹${_getCartTotal()})'),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryColor),
      );
    }

    final availableProducts = _products.where((p) => (p['quantity'] ?? 0) > 0).toList();

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            title: 'School Shop',
            subtitle: 'Order books, uniforms, and stationery directly from the school store.',
            trailing: Badge(
              label: Text(_cart.length.toString()),
              isLabelVisible: _cart.isNotEmpty,
              backgroundColor: AppTheme.primaryColor,
              child: IconButton(
                icon: const Icon(Icons.shopping_bag_rounded, color: AppTheme.primaryColor),
                onPressed: _showCartDialog,
                tooltip: 'View Cart',
              ),
            ),
          ),

          Expanded(
            child: availableProducts.isEmpty
                ? const PremiumCard(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text('No school store items available right now.', style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    ),
                  )
                : GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.72,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: availableProducts.length,
                    itemBuilder: (context, index) {
                      final product = availableProducts[index];
                      final qty = product['quantity'] ?? 0;
                      final reorder = product['reorderLevel'] ?? 0;
                      final available = qty - reorder;

                      return PremiumCard(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product['name'] ?? '',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              product['category'] ?? 'General',
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w500),
                            ),
                            const Spacer(),
                            if (available > 0)
                              Text('In Stock: $available ${product['unit']}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w700)),
                            if (qty <= reorder)
                              Container(
                                margin: const EdgeInsets.only(top: 4),
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                                child: const Text('Low Stock', style: TextStyle(fontSize: 10, color: Color(0xFFF59E0B), fontWeight: FontWeight.w700)),
                              ),
                            const SizedBox(height: 8),
                            Text(
                              '₹${product['pricePerUnit']}/${product['unit']}',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppTheme.primaryColor),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () => _addToCart(product),
                                icon: const Icon(Icons.add_shopping_cart_rounded, size: 16),
                                label: const Text('Add to Cart', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryColor,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                          ],
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
