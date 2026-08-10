import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, TextField, FormControlLabel, Checkbox,
  IconButton, InputAdornment, CircularProgress, Backdrop, Divider,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { LightPurpleButton, GhostButton } from '../components/buttonStyles';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import theme from '../theme';

/*
 * LoginPage — role-aware login screen
 *
 * CRITICAL FIX: The old version created `const defaultTheme = createTheme()`
 * — a blank MUI theme — and wrapped the entire login in it. This meant the
 * brand colours, typography, and border radius from theme.js were completely
 * ignored on the highest-visibility screen in the product.
 *
 * Now uses the application's theme directly.
 *
 * Layout: Split panel — brand identity left (desktop), form right.
 * The background image (designlogin.jpg) is replaced with a CSS gradient
 * so there is no external image request and no CLS on initial load.
 */

const ROLE_CONFIG = {
  Admin:   { icon: '👤', colour: '#6C63FF', description: 'Manage the entire school system' },
  Teacher: { icon: '📚', colour: '#0EA5E9', description: 'Access classes and student records' },
  Student: { icon: '🎓', colour: '#10B981', description: 'View your courses and attendance' },
  Parent:  { icon: '👨‍👩‍👧', colour: '#F59E0B', description: "Monitor your child's progress" },
  Staff:   { icon: '🏢', colour: '#8B5CF6', description: 'View your details and schedule' },
};

const LoginPage = ({ role }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

  const [showPassword, setShowPassword]   = useState(false);
  const [guestLoader, setGuestLoader]     = useState(false);
  const [loader, setLoader]               = useState(false);
  const [showPopup, setShowPopup]         = useState(false);
  const [message, setMessage]             = useState('');
  const [popupSeverity, setPopupSeverity] = useState('error');

  const [emailError, setEmailError]           = useState(false);
  const [passwordError, setPasswordError]     = useState(false);
  const [rollNumberError, setRollNumberError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.Admin;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (role === 'Student') {
      const rollNum     = event.target.rollNumber.value;
      const studentName = event.target.studentName.value;
      const password    = event.target.password.value;
      if (!rollNum || !studentName || !password) {
        if (!rollNum)     setRollNumberError(true);
        if (!studentName) setStudentNameError(true);
        if (!password)    setPasswordError(true);
        return;
      }
      setLoader(true);
      dispatch(loginUser({ rollNum, studentName, password }, role));
    } else if (role === 'Parent') {
      const rollNum  = event.target.rollNumber.value;
      const password = event.target.password.value;
      if (!rollNum || !password) {
        if (!rollNum)  setRollNumberError(true);
        if (!password) setPasswordError(true);
        return;
      }
      setLoader(true);
      dispatch(loginUser({ rollNum, password }, role));
    } else {
      const email    = event.target.email.value;
      const password = event.target.password.value;
      if (!email || !password) {
        if (!email)    setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }
      setLoader(true);
      dispatch(loginUser({ email, password }, role));
    }
  };

  const handleInputChange = ({ target: { name } }) => {
    if (name === 'email')       setEmailError(false);
    if (name === 'password')    setPasswordError(false);
    if (name === 'rollNumber')  setRollNumberError(false);
    if (name === 'studentName') setStudentNameError(false);
  };

  // Guest credentials — same as original, no business logic changed
  const guestModeHandler = () => {
    const password = 'zxc';
    if (role === 'Admin')        dispatch(loginUser({ email: 'yogendra@12', password }, role));
    else if (role === 'Student') dispatch(loginUser({ rollNum: '1', studentName: 'Dipesh Awasthi', password }, role));
    else if (role === 'Teacher') dispatch(loginUser({ email: 'tony@12', password }, role));
    else if (role === 'Staff')   dispatch(loginUser({ email: 'staff@example.com', password }, role));
    setGuestLoader(true);
  };

  const searchParams = new URLSearchParams(location.search);
  const nextPath = searchParams.get('next');

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin')        navigate(nextPath || '/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
      else if (currentRole === 'Parent')  navigate('/Parent/dashboard');
      else if (currentRole === 'Staff')   navigate('/Staff/dashboard');
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
      setGuestLoader(false);
    }
  }, [status, currentRole, navigate, error, response, currentUser, nextPath]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#F7F8FA' }}>

        {/* ── Left: Brand Panel ──────────────────────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '0 0 48%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(145deg, ${roleConfig.colour}DD 0%, ${roleConfig.colour} 100%)`,
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -100, right: -100 }} />
          <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -60, left: -60 }} />

          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Box sx={{ fontSize: 72, mb: 3 }}>{roleConfig.icon}</Box>
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 2 }}>
              {role} Portal
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 320, mx: 'auto', lineHeight: 1.7 }}>
              {roleConfig.description}
            </Typography>

            {/* School branding */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, mt: 5, px: 3, py: 1.5,
              bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '99px', backdropFilter: 'blur(8px)',
            }}>
              <School sx={{ color: '#fff', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                School Management System
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Right: Form Panel ──────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 6 },
            bgcolor: '#fff',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 380 }}>

            {/* Mobile role badge */}
            <Box sx={{ display: { md: 'none' }, mb: 3 }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75,
                bgcolor: '#EDE9FE', borderRadius: '99px',
              }}>
                <span>{roleConfig.icon}</span>
                <Typography variant="caption" sx={{ color: '#6C63FF', fontWeight: 700 }}>
                  {role} Login
                </Typography>
              </Box>
            </Box>

            <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              Sign in to continue to your {role.toLowerCase()} dashboard
            </Typography>

            {/* ── Form ────────────────────────────────────────────────── */}
            <Box component="form" noValidate onSubmit={handleSubmit}>

              {/* Student / Parent: roll number field */}
              {(role === 'Student' || role === 'Parent') && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="rollNumber"
                  label="Roll Number"
                  name="rollNumber"
                  autoComplete="off"
                  type="number"
                  autoFocus
                  error={rollNumberError}
                  helperText={rollNumberError && 'Roll number is required'}
                  onChange={handleInputChange}
                  sx={{ mb: 1 }}
                />
              )}

              {/* Student only: name field */}
              {role === 'Student' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="studentName"
                  label="Full Name"
                  name="studentName"
                  autoComplete="name"
                  error={studentNameError}
                  helperText={studentNameError && 'Name is required'}
                  onChange={handleInputChange}
                  sx={{ mb: 1 }}
                />
              )}

              {/* Admin / Teacher / Staff: email field */}
              {role !== 'Student' && role !== 'Parent' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={emailError}
                  helperText={emailError && 'Email is required'}
                  onChange={handleInputChange}
                  sx={{ mb: 1 }}
                />
              )}

              {/* Password — universal */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                error={passwordError}
                helperText={passwordError && 'Password is required'}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        size="small"
                      >
                        {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Remember me + forgot password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, mb: 1 }}>
                <FormControlLabel
                  control={<Checkbox size="small" color="primary" />}
                  label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                />
                <Typography
                  component="a"
                  href="#"
                  variant="body2"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Forgot password?
                </Typography>
              </Box>

              {/* Primary action */}
              <LightPurpleButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 1, py: 1.5, borderRadius: '10px', fontSize: '0.9375rem' }}
              >
                {loader ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </LightPurpleButton>

              {/* Guest login */}
              {(role === 'Admin' || role === 'Student' || role === 'Teacher' || role === 'Staff') && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.disabled">or</Typography>
                  </Divider>
                  <GhostButton
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={guestModeHandler}
                    sx={{ py: 1.5, borderRadius: '10px', fontSize: '0.9375rem' }}
                  >
                    Continue as Guest
                  </GhostButton>
                </>
              )}

              {/* Sign up link — admin only */}
              {role === 'Admin' && (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
                  New school?{' '}
                  <Link to="/Adminregister" style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>
                    Create an account →
                  </Link>
                </Typography>
              )}

            </Box>
          </Box>
        </Box>
      </Box>

      {/* Guest loading overlay */}
      <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1, backdropFilter: 'blur(4px)' }} open={guestLoader}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" size={48} />
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>Signing in as guest…</Typography>
        </Box>
      </Backdrop>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} severity={popupSeverity} />
    </ThemeProvider>
  );
};

export default LoginPage;
