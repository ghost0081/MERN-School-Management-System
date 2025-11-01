import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { Typography, Stack, Card, CardContent, Grid, Chip, Box, Divider } from '@mui/material';

const ParentAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails } = useSelector(state => state.user);

    useEffect(() => {
        if (currentUser?.student) dispatch(getUserDetails(currentUser.student, 'Student'));
    }, [dispatch, currentUser]);

    const attendance = (userDetails?.attendance) || [];
    
    // Group attendance by subject
    const groupedAttendance = attendance.reduce((acc, a) => {
        const subjectName = a.subName || 'General';
        if (!acc[subjectName]) {
            acc[subjectName] = { present: 0, absent: 0, records: [] };
        }
        if (a.status === 'Present') acc[subjectName].present++;
        else if (a.status === 'Absent') acc[subjectName].absent++;
        acc[subjectName].records.push(a);
        return acc;
    }, {});

    const overallStats = attendance.reduce((acc, a) => {
        if (a.status === 'Present') acc.present++;
        else if (a.status === 'Absent') acc.absent++;
        return acc;
    }, { present: 0, absent: 0 });

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
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Chip label={`Absent: ${overallStats.absent}`} color="error" sx={{ fontSize: '1rem', height: '36px' }} />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Subject-wise Attendance */}
            {Object.keys(groupedAttendance).length > 0 ? (
                <Stack spacing={2}>
                    <Typography variant="h6">Subject-wise Attendance</Typography>
                    {Object.entries(groupedAttendance).map(([subject, stats]) => {
                        const subjectPercentage = stats.records.length > 0 
                            ? ((stats.present / stats.records.length) * 100).toFixed(1)
                            : 0;
                        return (
                            <Card key={subject}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{subject}</Typography>
                                        <Chip label={`${subjectPercentage}%`} color={subjectPercentage >= 75 ? 'success' : subjectPercentage >= 50 ? 'warning' : 'error'} />
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Present: {stats.present}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">Absent: {stats.absent}</Typography>
                                        </Grid>
                                    </Grid>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Total Classes: {stats.records.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            ) : (
                <Typography>No attendance records</Typography>
            )}
        </Box>
    );
};

export default ParentAttendance;






