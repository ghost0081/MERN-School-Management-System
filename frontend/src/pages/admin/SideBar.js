import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Collapse, List } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const SideBar = () => {
    const location = useLocation();
    const [staffOpen, setStaffOpen] = React.useState(
        location.pathname.startsWith("/Admin/staff") || location.pathname.startsWith("/Admin/payroll")
    );

    const handleStaffClick = () => {
        setStaffOpen(!staffOpen);
    };

    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === ("/" || "/Admin/dashboard") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/classes">
                    <ListItemIcon>
                        <ClassOutlinedIcon color={location.pathname.startsWith('/Admin/classes') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Classes" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/subjects">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/Admin/subjects") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers">
                    <ListItemIcon>
                        <SupervisorAccountOutlinedIcon color={location.pathname.startsWith("/Admin/teachers") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Teachers" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/students">
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.startsWith("/Admin/students") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/notices">
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={location.pathname.startsWith("/Admin/notices") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Notices" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/complains">
                    <ListItemIcon>
                        <ReportIcon color={location.pathname.startsWith("/Admin/complains") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complains" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/timetable">
                    <ListItemIcon>
                        <AccessTimeIcon color={location.pathname.startsWith("/Admin/timetable") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Timetable" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teacher-leave">
                    <ListItemIcon>
                        <EventBusyIcon color={location.pathname.startsWith("/Admin/teacher-leave") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Teacher Leave" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/parents">
                    <ListItemIcon>
                        <FamilyRestroomIcon color={location.pathname.startsWith("/Admin/parents") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Parents" />
                </ListItemButton>
                <ListItemButton onClick={handleStaffClick}>
                    <ListItemIcon>
                        <GroupsIcon color={(location.pathname.startsWith("/Admin/staff") || location.pathname.startsWith("/Admin/payroll")) ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Staff" />
                    {staffOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={staffOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton 
                            component={Link} 
                            to="/Admin/staff" 
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon>
                                <PersonAddAlt1Icon color={location.pathname.startsWith("/Admin/staff") && !location.pathname.startsWith("/Admin/payroll") ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText primary="Add Staff" />
                        </ListItemButton>
                        <ListItemButton 
                            component={Link} 
                            to="/Admin/payroll" 
                            sx={{ pl: 4 }}
                        >
                            <ListItemIcon>
                                <AccountBalanceWalletIcon color={location.pathname.startsWith("/Admin/payroll") ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText primary="Payroll" />
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton component={Link} to="/Admin/fees">
                    <ListItemIcon>
                        <AccountBalanceIcon color={location.pathname.startsWith("/Admin/fees") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Fees" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Admin/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Admin/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default SideBar
