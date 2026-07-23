import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/api_service.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cannot add more. Maximum available quantity reached.')));
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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed successfully!')));
        setState(() {
          _cart.clear();
        });
        _fetchProducts(); // Refresh stock
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
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
            return AlertDialog(
              title: const Text('Shopping Cart'),
              content: SizedBox(
                width: double.maxFinite,
                child: _cart.isEmpty
                    ? const Text('Your cart is empty')
                    : ListView.builder(
                        shrinkWrap: true,
                        itemCount: _cart.length,
                        itemBuilder: (context, i) {
                          final item = _cart[i];
                          return ListTile(
                            title: Text(item['productName']),
                            subtitle: Text('Qty: ${item['quantity']} - ₹${item['unitPrice']} each'),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () {
                                setState(() {
                                  _cart.removeAt(i);
                                });
                                setStateDialog(() {});
                              },
                            ),
                          );
                        },
                      ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
                if (_cart.isNotEmpty)
                  ElevatedButton(
                    onPressed: _isCheckingOut
                        ? null
                        : () {
                            Navigator.pop(ctx);
                            _checkout();
                          },
                    child: _isCheckingOut ? const CircularProgressIndicator() : Text('Checkout (₹${_getCartTotal()})'),
                  )
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    final availableProducts = _products.where((p) => (p['quantity'] ?? 0) > 0).toList();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Stationery Shop', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              Badge(
                label: Text(_cart.length.toString()),
                isLabelVisible: _cart.isNotEmpty,
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart),
                  onPressed: _showCartDialog,
                ),
              )
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: availableProducts.isEmpty
                ? const Center(child: Text('No products available.'))
                : GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.75,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: availableProducts.length,
                    itemBuilder: (context, index) {
                      final product = availableProducts[index];
                      final qty = product['quantity'] ?? 0;
                      final reorder = product['reorderLevel'] ?? 0;
                      final available = qty - reorder;

                      return Card(
                        elevation: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(product['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 2, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Text(product['category'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                              const Spacer(),
                              if (available > 0)
                                Text('Available: $available ${product['unit']}', style: const TextStyle(color: Colors.blue, fontSize: 12)),
                              if (qty <= reorder)
                                const Chip(label: Text('Limited Stock', style: TextStyle(fontSize: 10)), backgroundColor: Colors.orange),
                              const SizedBox(height: 8),
                              Text('₹${product['pricePerUnit']}/${product['unit']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.blue)),
                              const SizedBox(height: 8),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () => _addToCart(product),
                                  child: const Text('Add', style: TextStyle(fontSize: 12)),
                                ),
                              )
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
