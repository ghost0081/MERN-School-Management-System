import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
import { Card, CardContent, Typography, Button, Chip, Stack, Grid } from '@mui/material';

const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';

const TeacherLeavePage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { leaves } = useSelector(state => state.leave);

    useEffect(() => {
        if (currentUser?._id) dispatch(getSchoolLeaves(currentUser._id));
    }, [dispatch, currentUser]);

    const update = async (id, status) => {
        await dispatch(setLeaveStatus(id, status));
        dispatch(getSchoolLeaves(currentUser._id));
    };

    return (
        <Stack spacing={2}>
            {leaves.map(l => (
                <Card key={l._id}>
                    <CardContent>
                        <Grid container alignItems="center">
                            <Grid item xs={3}><Typography variant="body1">{l.teacher?.name}</Typography></Grid>
                            <Grid item xs={5}><Typography variant="body2">{l.reason} ({new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()})</Typography></Grid>
                            <Grid item xs={2}><Chip label={l.status} color={statusColor(l.status)} size="small" /></Grid>
                            <Grid item xs={2}>
                                <Button size="small" onClick={() => update(l._id, 'Approved')}>Approve</Button>
                                <Button size="small" onClick={() => update(l._id, 'Rejected')}>Reject</Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};

export default TeacherLeavePage;








