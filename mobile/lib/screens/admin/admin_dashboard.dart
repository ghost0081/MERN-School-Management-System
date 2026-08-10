import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';
import '../../theme.dart';
import 'admin_home.dart';
import 'admin_tracker.dart';
import 'admin_financials.dart';
import 'admin_notices.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    AdminHome(),
    AdminTracker(),
    AdminFinancials(),
    AdminNotices(),
  ];

  final List<String> _titles = const [
    'Admin Overview',
    'Fleet & GPS Wearable Map',
    'Financials & Revenue',
    'School Notices',
  ];

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        elevation: 0,
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primaryColor, Color(0xFF3B82F6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              accountName: Text(
                user?.name ?? 'School Administrator',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              accountEmail: Text(user?.email ?? 'admin@school.com'),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white.withOpacity(0.2),
                child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 36),
              ),
            ),
            _buildDrawerTile(0, 'Overview', Icons.space_dashboard_rounded),
            _buildDrawerTile(1, 'Live GPS Wearables', Icons.my_location_rounded),
            _buildDrawerTile(2, 'Financials & Fees', Icons.account_balance_wallet_rounded),
            _buildDrawerTile(3, 'Announcements', Icons.campaign_rounded),
            const Spacer(),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
              title: const Text('Logout', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
              onTap: () {
                Provider.of<AuthProvider>(context, listen: false).logout();
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
    );
  }

  Widget _buildDrawerTile(int index, String title, IconData icon) {
    final isSelected = _selectedIndex == index;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        selected: isSelected,
        selectedTileColor: AppTheme.primaryColor.withOpacity(0.1),
        leading: Icon(icon, color: isSelected ? AppTheme.primaryColor : AppTheme.textSecondary),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? AppTheme.primaryColor : AppTheme.textPrimary,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        onTap: () {
          setState(() {
            _selectedIndex = index;
          });
          Navigator.pop(context);
        },
      ),
    );
  }
}
