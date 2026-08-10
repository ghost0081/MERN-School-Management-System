import { Container, Grid, Paper, Box, Typography, Button } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getFinancialAccounting } from '../../redux/financialRelated/financialHandle';
import FinancialAccounting from './financialRelated/FinancialAccounting';
import { fetchAttendanceReport, fetchFeesReport } from '../../redux/reportRelated/reportHandle';
import AttendanceFeesCharts from '../../components/reports/AttendanceFeesCharts';
import { StatCardSkeleton } from '../../components/SkeletonLoaders';
import { useNavigate } from 'react-router-dom';

// ── Stat Card Icons (inline SVG — no external image request) ─────────────────
const StudentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="#6C63FF"/>
  </svg>
);
const ClassIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 3C10.34 3 9 4.34 9 6C9 7.66 10.34 9 12 9C13.66 9 15 7.66 15 6C15 4.34 13.66 3 12 3ZM18 8H21V21H3V8H6C6 6.9 6.45 5.9 7.17 5.17C6.45 4.45 6 3.77 6 3H4C2.9 3 2 3.9 2 5V22H22V5C22 3.9 21.1 3 20 3H18C18 3.77 17.55 4.45 16.83 5.17C17.55 5.9 18 6.9 18 8Z" fill="#0EA5E9"/>
  </svg>
);
const TeacherIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#10B981"/>
  </svg>
);
const FeesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="#F59E0B"/>
  </svg>
);

// ── Quick Action Button ────────────────────────────────────────────────────
const QuickAction = ({ label, to, colour }) => {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate(to)}
      variant="outlined"
      size="small"
      sx={{
        borderRadius: '8px',
        borderColor: colour + '40',
        color: colour,
        fontWeight: 600,
        fontSize: '0.8125rem',
        px: 2,
        '&:hover': { bgcolor: colour + '10', borderColor: colour },
      }}
    >
      {label}
    </Button>
  );
};

// ──────────────────────────────────────────────────────────────────────────────

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentsList, loading: studentsLoading } = useSelector((state) => state.student);
  const { sclassesList, loading: classesLoading }  = useSelector((state) => state.sclass);
  const { teachersList, loading: teachersLoading } = useSelector((state) => state.teacher);
  const { financialData } = useSelector((state) => state.financial);
  const { currentUser }   = useSelector(state => state.user);

  const adminID     = currentUser._id;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dispatch(getAllStudents(adminID));
    dispatch(getAllSclasses(adminID, 'Sclass'));
    dispatch(getAllTeachers(adminID));
    dispatch(getFinancialAccounting(adminID, currentYear));
    dispatch(fetchAttendanceReport(adminID, 6));
    dispatch(fetchFeesReport(adminID, 6));
  }, [adminID, dispatch, currentYear]);

  const numberOfStudents = studentsList?.length  ?? 0;
  const numberOfClasses  = sclassesList?.length  ?? 0;
  const numberOfTeachers = teachersList?.length  ?? 0;
  const totalFees        = financialData?.totalRevenue ?? 0;

  const isLoading = studentsLoading || classesLoading || teachersLoading;

  const stats = [
    {
      label: 'Total Students',
      value: numberOfStudents,
      prefix: '',
      icon: <StudentIcon />,
      colour: '#6C63FF',
      bg: '#EDE9FE',
      action: { label: 'View All', to: '/Admin/students' },
    },
    {
      label: 'Total Classes',
      value: numberOfClasses,
      prefix: '',
      icon: <ClassIcon />,
      colour: '#0EA5E9',
      bg: '#E0F2FE',
      action: { label: 'Manage', to: '/Admin/classes' },
    },
    {
      label: 'Total Teachers',
      value: numberOfTeachers,
      prefix: '',
      icon: <TeacherIcon />,
      colour: '#10B981',
      bg: '#D1FAE5',
      action: { label: 'View All', to: '/Admin/teachers' },
    },
    {
      label: 'Fees Collected',
      value: totalFees,
      prefix: '₹',
      icon: <FeesIcon />,
      colour: '#F59E0B',
      bg: '#FEF3C7',
      action: { label: 'Manage', to: '/Admin/fees' },
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Welcome back, {currentUser.name?.split(' ')[0] || 'Admin'} 👋 — here's what's happening at {currentUser.schoolName || 'your school'}.
        </Typography>
      </Box>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {isLoading
          ? [1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <StatCardSkeleton />
              </Grid>
            ))
          : stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <KpiCard {...stat} />
              </Grid>
            ))
        }
      </Grid>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: '14px', border: '1px solid #E2E8F0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <QuickAction label="+ Add Student"     to="/Admin/addstudents"  colour="#6C63FF" />
          <QuickAction label="+ Add Teacher"     to="/Admin/teachers/chooseclass" colour="#0EA5E9" />
          <QuickAction label="+ Add Notice"      to="/Admin/addnotice"    colour="#10B981" />
          <QuickAction label="+ Add Class"       to="/Admin/addclass"     colour="#F59E0B" />
          <QuickAction label="View Reports"      to="/Admin/reports"      colour="#8B5CF6" />
          <QuickAction label="Manage Fees"       to="/Admin/fees"         colour="#EC4899" />
        </Box>
      </Paper>

      {/* ── Charts ───────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <AttendanceFeesCharts hideSummaries />
        </Grid>
      </Grid>

      {/* ── Financial Overview ────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <FinancialAccounting />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Recent Notices
            </Typography>
            <SeeNotice />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ── KPI Card Component ────────────────────────────────────────────────────────
const KpiCard = ({ label, value, prefix, icon, colour, bg, action }) => {
  const navigate = useNavigate();
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
        },
      }}
      onClick={() => navigate(action.to)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(action.to); }}
      aria-label={`${label}: ${value}. Click to ${action.label}`}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 52, height: 52,
          borderRadius: '12px',
          bgcolor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 0.5,
        }}
      >
        {icon}
      </Box>

      {/* Label */}
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', lineHeight: 1, letterSpacing: '0.06em' }}
      >
        {label}
      </Typography>

      {/* Value */}
      <KpiValue start={0} end={value} duration={2.2} prefix={prefix} colour={colour} />

      {/* Action link */}
      <Typography
        variant="caption"
        sx={{
          color: colour, fontWeight: 600, mt: 'auto',
          display: 'flex', alignItems: 'center', gap: 0.25,
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {action.label} →
      </Typography>
    </Paper>
  );
};

const KpiValue = styled(CountUp)`
  font-size: 2.25rem;
  font-weight: 800;
  color: ${(props) => props.colour || '#0F172A'};
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

export default AdminHomePage;