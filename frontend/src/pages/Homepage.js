import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { LightPurpleButton } from '../components/buttonStyles';

/*
 * Homepage — the first screen new users see
 *
 * Design decisions:
 * 1. Two-column layout: visual storytelling (left) + conversion (right).
 *    Left brain (data/logic) reads the right column first — placing CTAs there.
 * 2. The headline is split into 3 lines so each word group lands with weight.
 * 3. "Login" is the primary CTA (contained, high contrast). "Login as Guest"
 *    is secondary (outlined) — it doesn't compete but offers an escape hatch.
 * 4. Background gradient on the left panel adds depth without a photograph
 *    (no external image request, no CLS).
 */
const Homepage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: '#F7F8FA',
      }}
    >
      {/* ── Left: Visual Panel ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 52%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #6C63FF 50%, #8B5CF6 100%)',
          position: 'relative',
          overflow: 'hidden',
          p: 6,
        }}
      >
        {/* Decorative circles — add depth without images */}
        <Box sx={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', top: -120, right: -120,
        }} />
        <Box sx={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', bottom: -80, left: -80,
        }} />

        {/* Brand mark */}
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ fontSize: 64, mb: 2, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>
            🏫
          </Box>
          <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
            School Management<br />Made Effortless
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.80)', maxWidth: 380, mx: 'auto', lineHeight: 1.7 }}>
            Everything your institution needs — attendance, fees, timetables,
            library, payroll, and real-time student tracking — in one platform.
          </Typography>

          {/* Trust signals */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 5 }}>
            {[
              { icon: '✓', text: 'Attendance Tracking' },
              { icon: '✓', text: 'Fee Management' },
              { icon: '✓', text: 'Live GPS Tracker' },
            ].map((item) => (
              <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{
                  width: 18, height: 18, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff',
                }}>
                  {item.icon}
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Right: Auth Panel ──────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          bgcolor: '#fff',
        }}
      >
        {/* Mobile brand mark (hidden on desktop — left panel handles it) */}
        <Box sx={{ display: { md: 'none' }, mb: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
            🏫 School<br />Management
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 360 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
            Sign in to your school dashboard or explore as a guest.
          </Typography>

          {/* Primary CTA — login. Highest visual weight per Fitts's Law (larger = faster to click) */}
          <Link to="/choose" style={{ display: 'block', textDecoration: 'none' }}>
            <LightPurpleButton
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(108,99,255,0.45)' },
              }}
            >
              Sign In
            </LightPurpleButton>
          </Link>

          {/* Secondary CTA — guest mode. Outlined, less visual weight */}
          <Link to="/chooseasguest" style={{ display: 'block', textDecoration: 'none', marginTop: 12 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '10px',
                borderColor: '#E2E8F0',
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: '#EDE9FE' },
              }}
            >
              Explore as Guest
            </Button>
          </Link>

          {/* Register link */}
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            New school?{' '}
            <Link
              to="/Adminregister"
              style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}
            >
              Create an account →
            </Link>
          </Typography>
        </Box>

        {/* Footer */}
        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 6 }}>
          © {new Date().getFullYear()} School Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Homepage;
