import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { Box, Typography, Grid, Paper, Card, CardContent, Chip, CircularProgress } from '@mui/material';

const StaffHomePage = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails } = useSelector(state => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, 'Staff'));
        }
    }, [dispatch, currentUser]);

    const attendance = (userDetails?.attendance) || [];
    const attendanceStats = attendance.reduce((acc, a) => {
        if (a.status === 'Present') acc.present++;
        else if (a.status === 'Absent') acc.absent++;
        else if (a.status === 'Half Day') acc.halfDay++;
        return acc;
    }, { present: 0, absent: 0, halfDay: 0 });
    
    const attendancePercentage = attendance.length > 0 
        ? ((attendanceStats.present / attendance.length) * 100).toFixed(1)
        : 0;

    if (!currentUser) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Welcome, {currentUser.name}
            </Typography>

            <Grid container spacing={3}>
                {/* Staff Info Card */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                            Staff Information
                        </Typography>
                        <Typography variant="body1"><strong>Name:</strong> {currentUser.name || 'Loading...'}</Typography>
                        <Typography variant="body1"><strong>Email:</strong> {currentUser.email || 'Loading...'}</Typography>
                        <Typography variant="body1"><strong>Role:</strong> {currentUser.role || 'Loading...'}</Typography>
                        <Typography variant="body1"><strong>Mobile:</strong> {currentUser.mobile || 'N/A'}</Typography>
                        <Typography variant="body1"><strong>Status:</strong> 
                            <Chip 
                                label={currentUser.status || 'Active'} 
                                color={currentUser.status === 'Active' ? 'success' : currentUser.status === 'On Leave' ? 'warning' : 'default'}
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        </Typography>
                        {userDetails?.salary && (
                            <Typography variant="body1"><strong>Salary:</strong> ₹{userDetails.salary.toLocaleString()}</Typography>
                        )}
                        {userDetails?.joiningDate && (
                            <Typography variant="body1"><strong>Joining Date:</strong> {new Date(userDetails.joiningDate).toLocaleDateString()}</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Attendance Stats */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Attendance Overview
                            </Typography>
                            <Typography variant="h3" sx={{ color: 'success.main', mb: 1 }}>
                                {attendancePercentage}%
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={4}>
                                    <Chip label={`Present: ${attendanceStats.present}`} color="success" />
                                </Grid>
                                <Grid item xs={4}>
                                    <Chip label={`Absent: ${attendanceStats.absent}`} color="error" />
                                </Grid>
                                <Grid item xs={4}>
                                    <Chip label={`Half Day: ${attendanceStats.halfDay}`} color="warning" />
                                </Grid>
                            </Grid>
                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Total Records: {attendance.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Attendance */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Recent Attendance
                            </Typography>
                            {attendance.slice(0, 10).map((a, idx) => (
                                <Box key={idx} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">{new Date(a.date).toLocaleDateString()}</Typography>
                                    <Chip 
                                        label={a.status} 
                                        size="small"
                                        color={a.status === 'Present' ? 'success' : a.status === 'Half Day' ? 'warning' : 'error'}
                                    />
                                </Box>
                            ))}
                            {attendance.length === 0 && <Typography variant="body2" color="text.secondary">No attendance records</Typography>}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Additional Info */}
                {userDetails?.address && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                    Address
                                </Typography>
                                <Typography variant="body2">{userDetails.address}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default StaffHomePage;

