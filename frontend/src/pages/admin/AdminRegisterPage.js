import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, TextField, FormControlLabel, Checkbox,
  IconButton, InputAdornment, CircularProgress, LinearProgress, Tooltip,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { LightPurpleButton } from '../../components/buttonStyles';
import { registerUser } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';
import theme from '../../theme';

/*
 * AdminRegisterPage — new school registration
 *
 * FIXES:
 * 1. Uses application theme (was using blank defaultTheme like LoginPage)
 * 2. Matching visual style to LoginPage for consistency
 * 3. Added password strength indicator — reduces support tickets from weak passwords
 * 4. Better field labels and helper text
 */

// Password strength logic — purely cosmetic, doesn't gate submission
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', colour: '#E2E8F0' };
  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  const levels = [
    { label: 'Weak',    colour: '#EF4444' },
    { label: 'Fair',    colour: '#F59E0B' },
    { label: 'Good',    colour: '#10B981' },
    { label: 'Strong',  colour: '#6C63FF' },
  ];
  return { score, ...levels[Math.max(0, score - 1)] };
};

const AdminRegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader]             = useState(false);
  const [showPopup, setShowPopup]       = useState(false);
  const [message, setMessage]           = useState('');
  const [popupSeverity, setPopupSeverity] = useState('error');
  const [passwordValue, setPasswordValue] = useState('');

  const [emailError, setEmailError]         = useState(false);
  const [passwordError, setPasswordError]   = useState(false);
  const [adminNameError, setAdminNameError] = useState(false);
  const [schoolNameError, setSchoolNameError] = useState(false);

  const role = 'Admin';
  const passwordStrength = getPasswordStrength(passwordValue);

  const handleSubmit = (event) => {
    event.preventDefault();
    const name       = event.target.adminName.value;
    const schoolName = event.target.schoolName.value;
    const email      = event.target.email.value;
    const password   = event.target.password.value;

    if (!name || !schoolName || !email || !password) {
      if (!name)       setAdminNameError(true);
      if (!schoolName) setSchoolNameError(true);
      if (!email)      setEmailError(true);
      if (!password)   setPasswordError(true);
      return;
    }
    setLoader(true);
    dispatch(registerUser({ name, email, password, role, schoolName }, role));
  };

  const handleInputChange = ({ target: { name, value } }) => {
    if (name === 'email')      setEmailError(false);
    if (name === 'password') { setPasswordError(false); setPasswordValue(value); }
    if (name === 'adminName')  setAdminNameError(false);
    if (name === 'schoolName') setSchoolNameError(false);
  };

  useEffect(() => {
    if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
      navigate('/Admin/dashboard');
    } else if (status === 'failed') {
      setMessage(response);
      setPopupSeverity('error');
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage('Network error. Please check your connection.');
      setPopupSeverity('error');
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, currentUser, currentRole, navigate, error, response]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#F7F8FA' }}>

        {/* ── Left Panel ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '0 0 48%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #4F46E5 0%, #6C63FF 100%)',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -100, right: -100 }} />
          <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -60, left: -60 }} />

          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Box sx={{ fontSize: 72, mb: 3 }}>🏫</Box>
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 2 }}>
              Set up your school
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)', maxWidth: 320, mx: 'auto', lineHeight: 1.7 }}>
              Create your school's management system in minutes. Add students,
              teachers, manage fees, and track attendance — all in one place.
            </Typography>

            {/* Feature checklist */}
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left' }}>
              {['Student & Teacher management', 'Fees & Payroll', 'GPS & BLE Attendance', 'Library & Stationery'].map((f) => (
                <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircle sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {f}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Right: Form Panel ─────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 5 },
            bgcolor: '#fff',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 380 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
              Create account
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Register your school to get started
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              <TextField
                required
                fullWidth
                id="adminName"
                label="Your full name"
                name="adminName"
                autoComplete="name"
                autoFocus
                error={adminNameError}
                helperText={adminNameError && 'Name is required'}
                onChange={handleInputChange}
                size="medium"
              />

              <TextField
                required
                fullWidth
                id="schoolName"
                label="School name"
                name="schoolName"
                autoComplete="off"
                error={schoolNameError}
                helperText={schoolNameError ? 'School name is required' : 'This will be your school\'s display name'}
                onChange={handleInputChange}
                size="medium"
              />

              <TextField
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                autoComplete="email"
                error={emailError}
                helperText={emailError && 'Email is required'}
                onChange={handleInputChange}
                size="medium"
              />

              <Box>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  error={passwordError}
                  helperText={passwordError && 'Password is required'}
                  onChange={handleInputChange}
                  size="medium"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            size="small"
                          >
                            {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Password strength indicator — reduces support tickets */}
                {passwordValue && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 4) * 100}
                      sx={{
                        height: 4,
                        borderRadius: '99px',
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { bgcolor: passwordStrength.colour },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: passwordStrength.colour, fontWeight: 600, mt: 0.5, display: 'block' }}>
                      {passwordStrength.label} password
                    </Typography>
                  </Box>
                )}
              </Box>

              <FormControlLabel
                control={<Checkbox size="small" color="primary" />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Typography component="span" variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Terms of Service
                    </Typography>
                  </Typography>
                }
              />

              <LightPurpleButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 0.5, py: 1.5, borderRadius: '10px', fontSize: '0.9375rem' }}
              >
                {loader ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
              </LightPurpleButton>

              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link to="/Adminlogin" style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in →
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} severity={popupSeverity} />
    </ThemeProvider>
  );
};

export default AdminRegisterPage;
