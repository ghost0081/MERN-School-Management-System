import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/*
 * AppTheme — Premium Design System for Mobile
 * 
 * Maps the web application's design tokens (Inter font, indigo brand, 
 * slate neutrals, and flat borders) to Flutter's Material 3 theme engine.
 */
class AppTheme {
  // ── Colors ──────────────────────────────────────────────────────────────
  static const Color primaryColor = Color(0xFF6C63FF); // Brand Indigo
  static const Color primaryDark = Color(0xFF4F46E5);
  static const Color primaryLight = Color(0xFFEDE9FE);
  
  static const Color backgroundColor = Color(0xFFF7F8FA);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF64748B); // Slate 500
  static const Color textDisabled = Color(0xFF94A3B8); // Slate 400
  
  static const Color borderColor = Color(0xFFE2E8F0); // Slate 200

  // ── Theme Data ──────────────────────────────────────────────────────────
  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.interTextTheme();

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: primaryDark,
        background: backgroundColor,
        surface: surfaceColor,
        error: const Color(0xFFEF4444), // Red 500
      ),
      scaffoldBackgroundColor: backgroundColor,
      
      // ── Typography ──────────────────────────────────────────────────────
      textTheme: baseTextTheme.copyWith(
        displayLarge: baseTextTheme.displayLarge?.copyWith(color: textPrimary, fontWeight: FontWeight.w800),
        displayMedium: baseTextTheme.displayMedium?.copyWith(color: textPrimary, fontWeight: FontWeight.w800),
        displaySmall: baseTextTheme.displaySmall?.copyWith(color: textPrimary, fontWeight: FontWeight.w700),
        headlineMedium: baseTextTheme.headlineMedium?.copyWith(color: textPrimary, fontWeight: FontWeight.w700),
        titleLarge: baseTextTheme.titleLarge?.copyWith(color: textPrimary, fontWeight: FontWeight.w700),
        bodyLarge: baseTextTheme.bodyLarge?.copyWith(color: textPrimary, fontWeight: FontWeight.w500),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(color: textPrimary, fontWeight: FontWeight.w500),
        labelLarge: baseTextTheme.labelLarge?.copyWith(color: textSecondary, fontWeight: FontWeight.w600, letterSpacing: 0.5),
      ),

      // ── App Bar ─────────────────────────────────────────────────────────
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceColor,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0, // Prevents tinting on scroll in M3
        iconTheme: IconThemeData(color: textSecondary),
      ),

      // ── Buttons ─────────────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textSecondary,
          side: const BorderSide(color: borderColor),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),

      // ── Inputs ──────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: backgroundColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFEF4444)),
        ),
        labelStyle: GoogleFonts.inter(color: textSecondary, fontWeight: FontWeight.w500),
        hintStyle: GoogleFonts.inter(color: textDisabled),
        prefixIconColor: textSecondary,
      ),

      // ── Cards ───────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderColor),
        ),
        margin: EdgeInsets.zero,
      ),
    );
  }
}
