import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { Typography, Stack, Card, CardContent, Grid, Chip, Box, Divider, CircularProgress } from '@mui/material';

const StaffAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector(state => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, 'Staff'));
        }
    }, [dispatch, currentUser]);

    if (loading) {
        return <CircularProgress />;
    }

    const attendance = (userDetails?.attendance) || [];

    const overallStats = attendance.reduce((acc, a) => {
        if (a.status === 'Present') acc.present++;
        else if (a.status === 'Absent') acc.absent++;
        else if (a.status === 'Half Day') acc.halfDay++;
        return acc;
    }, { present: 0, absent: 0, halfDay: 0 });

    const overallPercentage = attendance.length > 0
        ? ((overallStats.present / attendance.length) * 100).toFixed(1)
        : 0;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Attendance Records</Typography>

            {/* Overall Stats */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Overall Attendance</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h3" color="primary">{overallPercentage}%</Typography>
                                <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Chip label={`Present: ${overallStats.present}`} color="success" sx={{ fontSize: '1rem', height: '36px' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Box textAlign="center">
                                <Chip label={`Absent: ${overallStats.absent}`} color="error" sx={{ fontSize: '1rem', height: '36px' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Box textAlign="center">
                                <Chip label={`Half Day: ${overallStats.halfDay}`} color="warning" sx={{ fontSize: '1rem', height: '36px' }} />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Attendance List */}
            {attendance.length > 0 ? (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Attendance History</Typography>
                        <Stack spacing={1}>
                            {attendance.slice().reverse().map((a, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #eee' }}>
                                    <Typography variant="body2">{new Date(a.date).toLocaleDateString()}</Typography>
                                    <Chip 
                                        label={a.status} 
                                        size="small"
                                        color={a.status === 'Present' ? 'success' : a.status === 'Half Day' ? 'warning' : 'error'}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            ) : (
                <Typography>No attendance records found</Typography>
            )}
        </Box>
    );
};

export default StaffAttendance;


