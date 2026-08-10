import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Avatar, Divider,
  CircularProgress, Paper, Chip,
} from '@mui/material';
import {
  EditOutlined, SaveOutlined, CloseOutlined,
  EmailOutlined, SchoolOutlined, PersonOutlined,
} from '@mui/icons-material';
import { updateUser } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';

/*
 * AdminProfile — rebuilt from scratch
 *
 * The old version was a raw <div> with unstyled text:
 *   "Name: X  Email: Y  School: Z"
 * The edit functionality was 100% commented out.
 *
 * This restoration:
 * 1. Renders a proper profile card with avatar, name, email, school
 * 2. Restores the edit flow using the existing updateUser Redux action
 * 3. Inline edit mode — fields appear in place, no navigation required
 * 4. Cancellable — users can revert without saving
 */
const AdminProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, status, response } = useSelector(state => state.user);

  const [editMode, setEditMode]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [showPopup, setShowPopup]     = useState(false);
  const [message, setMessage]         = useState('');
  const [popupSeverity, setPopupSeverity] = useState('success');

  // Editable fields
  const [name,       setName]       = useState(currentUser.name       || '');
  const [email,      setEmail]      = useState(currentUser.email      || '');
  const [schoolName, setSchoolName] = useState(currentUser.schoolName || '');
  const [password,   setPassword]   = useState('');

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    const fields = password
      ? { name, email, schoolName, password }
      : { name, email, schoolName };
    setSaving(true);
    try {
      await dispatch(updateUser(fields, currentUser._id, 'Admin'));
      setMessage('Profile updated successfully!');
      setPopupSeverity('success');
      setShowPopup(true);
      setEditMode(false);
      setPassword('');
    } catch {
      setMessage('Failed to update profile. Please try again.');
      setPopupSeverity('error');
      setShowPopup(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setSchoolName(currentUser.schoolName || '');
    setPassword('');
    setEditMode(false);
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>Profile</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Manage your personal information and school details
        </Typography>
      </Box>

      {/* ── Profile Card ─────────────────────────────────────────────── */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Top banner */}
        <Box
          sx={{
            height: 80,
            background: 'linear-gradient(135deg, #4F46E5 0%, #6C63FF 100%)',
          }}
        />

        {/* Avatar + name section */}
        <Box sx={{ px: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: -4, mb: 2 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#6C63FF',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(108,99,255,0.30)',
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ display: 'flex', gap: 1, mt: 5 }}>
              {!editMode ? (
                <Button
                  startIcon={<EditOutlined />}
                  variant="outlined"
                  onClick={() => setEditMode(true)}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    color: 'text.secondary',
                    fontWeight: 600,
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: '#EDE9FE' },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    startIcon={<CloseOutlined />}
                    variant="outlined"
                    onClick={handleCancel}
                    size="small"
                    sx={{ borderRadius: '8px', borderColor: '#E2E8F0', color: 'text.secondary', fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlined />}
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    size="small"
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {currentUser.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label="Admin"
                size="small"
                sx={{ bgcolor: '#EDE9FE', color: '#6C63FF', fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {currentUser.schoolName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Information Fields ──────────────────────────────────────── */}
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Full Name */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                Full Name
              </Typography>
            </Box>
            {editMode ? (
              <TextField
                fullWidth value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                size="medium"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {currentUser.name || '—'}
              </Typography>
            )}
          </Box>

          {/* Email */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EmailOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                Email Address
              </Typography>
            </Box>
            {editMode ? (
              <TextField
                fullWidth value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email" placeholder="your@email.com" size="medium"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {currentUser.email || '—'}
              </Typography>
            )}
          </Box>

          {/* School Name */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SchoolOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                School Name
              </Typography>
            </Box>
            {editMode ? (
              <TextField
                fullWidth value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="School name" size="medium"
              />
            ) : (
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {currentUser.schoolName || '—'}
              </Typography>
            )}
          </Box>

          {/* Password — only in edit mode */}
          {editMode && (
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1, lineHeight: 1 }}>
                New Password
              </Typography>
              <TextField
                fullWidth value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password" placeholder="Leave blank to keep current password"
                size="medium"
                helperText="Only fill this if you want to change your password"
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} severity={popupSeverity} />
    </Box>
  );
};

export default AdminProfile;