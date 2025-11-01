import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAssignments } from '../../redux/assignmentRelated/assignmentHandle';
import { Card, CardContent, Stack, Typography, Box, Grid, Chip, Divider } from '@mui/material';

const ParentAssignments = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { assignments } = useSelector(state => state.assignment);

    useEffect(() => {
        if (currentUser?.student) dispatch(getAssignments('student', currentUser.student));
    }, [dispatch, currentUser]);

    // Filter and process assignments for the current student
    const studentAssignments = assignments.map(a => {
        const rec = (a.studentStatus || []).find(ss => (ss.student && ss.student._id ? ss.student._id : ss.student) === currentUser?.student) || {};
        return {
            ...a,
            studentStatus: rec
        };
    });

    const assignmentsStats = studentAssignments.reduce((acc, a) => {
        const status = a.studentStatus?.status || 'Pending';
        if (status === 'Submitted') acc.submitted++;
        else if (status === 'Assigned' || status === 'Pending') acc.pending++;
        return acc;
    }, { submitted: 0, pending: 0 });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Assignments</Typography>
            
            {/* Overall Stats */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Assignment Overview</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box textAlign="center">
                                <Chip label={`Submitted: ${assignmentsStats.submitted}`} color="success" variant="outlined" sx={{ fontSize: '1rem', height: '36px' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box textAlign="center">
                                <Chip label={`Pending: ${assignmentsStats.pending}`} color="warning" variant="outlined" sx={{ fontSize: '1rem', height: '36px' }} />
                            </Box>
                        </Grid>
                    </Grid>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        Total Assignments: {studentAssignments.length}
                    </Typography>
                </CardContent>
            </Card>

            {/* Assignment List */}
            {studentAssignments.length > 0 ? (
                <Stack spacing={2}>
                    {studentAssignments.map(a => {
                        const status = a.studentStatus?.status || 'Pending';
                        const marks = a.studentStatus?.marks;
                        const isOverdue = new Date(a.dueDate) < new Date() && status !== 'Submitted';
                        
                        return (
                            <Card key={a._id}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6">{a.title}</Typography>
                                        <Chip 
                                            label={status} 
                                            color={status === 'Submitted' ? 'success' : isOverdue ? 'error' : 'warning'}
                                            size="small"
                                        />
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2"><strong>Subject:</strong> {a.subject?.subName || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2"><strong>Due Date:</strong> {new Date(a.dueDate).toLocaleDateString()}</Typography>
                                        </Grid>
                                        {a.description && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">{a.description}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                    {status === 'Submitted' && marks !== undefined && (
                                        <Box sx={{ mt: 2 }}>
                                            <Chip label={`Marks: ${marks}`} color="primary" variant="outlined" />
                                        </Box>
                                    )}
                                    {isOverdue && (
                                        <Box sx={{ mt: 2 }}>
                                            <Chip label="Overdue" color="error" size="small" />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            ) : (
                <Typography>No assignments</Typography>
            )}
        </Box>
    );
};

export default ParentAssignments;






