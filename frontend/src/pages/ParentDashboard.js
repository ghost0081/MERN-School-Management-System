import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, Box, Toolbar, List, Typography, Divider, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccountMenu from '../components/AccountMenu';
import { AppBar, Drawer } from '../components/styles';
import ParentSideBar from './parent/ParentSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Logout from './Logout';
import ParentHomePage from './parent/ParentHomePage';
import ParentAssignments from './parent/ParentAssignments';
import ParentAttendance from './parent/ParentAttendance';

const ParentDashboard = () => {
  const [open, setOpen] = useState(true);
  const toggleDrawer = () => setOpen(!open);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar open={open} position='absolute'>
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ marginRight: '36px', ...(open && { display: 'none' }) }}>
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Parent Dashboard
          </Typography>
          <AccountMenu />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1] }}>
          <IconButton onClick={toggleDrawer}><ChevronLeftIcon /></IconButton>
        </Toolbar>
        <Divider />
        <List component="nav"><ParentSideBar /></List>
      </Drawer>
      <Box component="main" sx={{ backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.grey[900], flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Routes>
          <Route path='/' element={<ParentHomePage />} />
          <Route path='*' element={<Navigate to='/' />} />
          <Route path='/Parent/attendance' element={<ParentAttendance />} />
          <Route path='/Parent/assignments' element={<ParentAssignments />} />
          <Route path='/logout' element={<Logout />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default ParentDashboard;



