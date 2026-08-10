import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Avatar, Divider, Grid, Button, Chip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import ClassIcon from '@mui/icons-material/Class';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageSkeleton } from '../../../components/SkeletonLoaders';

/*
 * TeacherDetails — Teacher Profile Page
 *
 * ENHANCEMENTS:
 * 1. Transformed from 4 lines of text into a premium profile card layout.
 * 2. Added header banner with gradient and avatar.
 * 3. Structured data into "Academic Assignment" card.
 * 4. Added "Payroll & Salary" card that links to the existing payroll system,
 *    giving administrators a direct flow to manage salaries.
 */

const TeacherDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

  const teacherID = params.id;

  useEffect(() => {
    dispatch(getTeacherDetails(teacherID));
  }, [dispatch, teacherID]);

  if (loading || !teacherDetails) {
    return <Box sx={{ p: 3 }}><PageSkeleton /></Box>;
  }

  const name = teacherDetails?.name || 'Unknown';
  const email = teacherDetails?.email || 'No email provided';
  const sclassName = teacherDetails?.teachSclass?.sclassName || 'Unassigned';
  const subName = teacherDetails?.teachSubject?.subName || 'Unassigned';
  const sessions = teacherDetails?.teachSubject?.sessions || '0';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleAddSubject = () => {
    navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherID}`);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 4 }}>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Teacher Profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            View and manage details for {name}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ borderRadius: '8px', fontWeight: 600, color: 'text.secondary', borderColor: '#E2E8F0' }}
        >
          Back
        </Button>
      </Box>

      {/* ── Main Profile Card ───────────────────────────────────────── */}
      <Paper elevation={1} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', mb: 3 }}>
        <Box sx={{ height: 100, background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)' }} />
        
        <Box sx={{ px: 4, pb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: -5, mb: 3 }}>
            <Avatar
              sx={{
                width: 90, height: 90,
                bgcolor: '#0EA5E9',
                fontSize: '2rem',
                fontWeight: 700,
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(14,165,233,0.30)',
              }}
            >
              {initials}
            </Avatar>
            <Chip label="Active Staff" size="small" sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 700 }} />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            {name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                ID: {teacherID.slice(-6).toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* ── Academic Assignment ─────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: '14px', border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
              Academic Assignment
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <ClassIcon sx={{ color: '#0EA5E9', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Assigned Class
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', pl: 3.5 }}>
                  {sclassName}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <MenuBookIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Subject Taught
                  </Typography>
                </Box>
                <Box sx={{ pl: 3.5 }}>
                  {teacherDetails?.teachSubject ? (
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {subName}
                    </Typography>
                  ) : (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={handleAddSubject}
                      sx={{ mt: 1, borderRadius: '8px', color: '#8B5CF6', borderColor: '#8B5CF6' }}
                    >
                      + Assign Subject
                    </Button>
                  )}
                </Box>
              </Box>

              {teacherDetails?.teachSubject && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AccessTimeIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Sessions
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', pl: 3.5 }}>
                    {sessions} Sessions for this academic year
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Financials & Payroll ───────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: '14px', border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
              Payroll & Salary
            </Typography>
            
            <Box sx={{ p: 3, bgcolor: '#F7F8FA', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AccountBalanceWalletIcon sx={{ color: '#10B981' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Monthly Salary Management
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    View payment history, apply bonuses or deductions, and process salary payments for this teacher.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/Admin/payroll/teacher/${teacherID}`)}
              sx={{ 
                bgcolor: '#10B981', 
                color: 'white', 
                fontWeight: 600, 
                borderRadius: '8px',
                py: 1.25,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#059669', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }
              }}
            >
              Manage Payroll
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDetails;