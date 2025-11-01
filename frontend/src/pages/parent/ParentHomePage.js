import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getAssignments } from '../../redux/assignmentRelated/assignmentHandle';
import { Box, Typography, Grid, Paper, Card, CardContent, Chip, CircularProgress } from '@mui/material';

const ParentHomePage = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails } = useSelector(state => state.user);
    const { assignments, loading: assignLoading } = useSelector(state => state.assignment);

    useEffect(() => {
        if (currentUser?.student) {
            dispatch(getUserDetails(currentUser.student, 'Student'));
            dispatch(getAssignments('student', currentUser.student));
        }
    }, [dispatch, currentUser]);

    const attendance = (userDetails?.attendance) || [];
    const attendanceStats = attendance.reduce((acc, a) => {
        if (a.status === 'Present') acc.present++;
        else if (a.status === 'Absent') acc.absent++;
        return acc;
    }, { present: 0, absent: 0 });
    const attendancePercentage = attendance.length > 0 
        ? ((attendanceStats.present / attendance.length) * 100).toFixed(1)
        : 0;

    const assignmentsStats = assignments.reduce((acc, a) => {
        const rec = (a.studentStatus || []).find(ss => (ss.student && ss.student._id ? ss.student._id : ss.student) === currentUser?.student) || {};
        if (rec.status === 'Submitted') acc.submitted++;
        else if (rec.status === 'Assigned' || rec.status === 'Pending') acc.pending++;
        return acc;
    }, { submitted: 0, pending: 0 });

    if (!currentUser?.student) {
        return <Typography>No student information available</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Welcome, {currentUser.name}
            </Typography>

            <Grid container spacing={3}>
                {/* Student Info Card */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                            Child Information
                        </Typography>
                        <Typography variant="body1"><strong>Name:</strong> {userDetails?.name || 'Loading...'}</Typography>
                        <Typography variant="body1"><strong>Roll Number:</strong> {userDetails?.rollNum || 'Loading...'}</Typography>
                        <Typography variant="body1"><strong>Class:</strong> {userDetails?.sclassName?.sclassName || 'Loading...'}</Typography>
                        <Typography variant="body1"><strong>School:</strong> {userDetails?.school?.schoolName || 'Loading...'}</Typography>
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
                                <Grid item xs={6}>
                                    <Chip label={`Present: ${attendanceStats.present}`} color="success" />
                                </Grid>
                                <Grid item xs={6}>
                                    <Chip label={`Absent: ${attendanceStats.absent}`} color="error" />
                                </Grid>
                            </Grid>
                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Total Records: {attendance.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Assignments Stats */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                                Assignments Overview
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Chip label={`Submitted: ${assignmentsStats.submitted}`} color="success" variant="outlined" />
                                </Grid>
                                <Grid item xs={6}>
                                    <Chip label={`Pending: ${assignmentsStats.pending}`} color="warning" variant="outlined" />
                                </Grid>
                            </Grid>
                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Total Assignments: {assignments.length}
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
                            {attendance.slice(0, 5).map((a, idx) => (
                                <Box key={idx} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">{new Date(a.date).toLocaleDateString()}</Typography>
                                    <Chip 
                                        label={a.status} 
                                        size="small"
                                        color={a.status === 'Present' ? 'success' : 'error'}
                                    />
                                </Box>
                            ))}
                            {attendance.length === 0 && <Typography variant="body2" color="text.secondary">No attendance records</Typography>}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ParentHomePage;






