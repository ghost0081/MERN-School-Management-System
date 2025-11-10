import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { createLeave, getTeacherLeaves } from '../../redux/leaveRelated/leaveHandle';
import { Card, CardContent, Typography, Grid, TextField, Button, Chip, Stack } from '@mui/material';

const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';

const TeacherLeave = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { leaves } = useSelector(state => state.leave);

    const [form, setForm] = useState({ reason: '', fromDate: '', toDate: '' });

    useEffect(() => {
        if (currentUser?._id) dispatch(getTeacherLeaves(currentUser._id));
    }, [dispatch, currentUser]);

    const submit = (e) => {
        e.preventDefault();
        dispatch(createLeave({
            teacher: currentUser._id,
            school: currentUser.school._id,
            reason: form.reason,
            fromDate: form.fromDate,
            toDate: form.toDate,
        })).then(() => dispatch(getTeacherLeaves(currentUser._id)));
    };

    return (
        <Stack spacing={3}>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Request Leave</Typography>
                    <Grid container spacing={2} component="form" onSubmit={submit}>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required /></Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth type="date" label="From" InputLabelProps={{ shrink: true }} value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} required /></Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth type="date" label="To" InputLabelProps={{ shrink: true }} value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} required /></Grid>
                        <Grid item xs={12}><Button type="submit" variant="contained">Submit</Button></Grid>
                    </Grid>
                </CardContent>
            </Card>

            {leaves.map(l => (
                <Card key={l._id}>
                    <CardContent>
                        <Typography variant="subtitle1">{l.reason}</Typography>
                        <Typography variant="caption">{new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()}</Typography>
                        <br />
                        <Chip label={l.status} color={statusColor(l.status)} size="small" sx={{ mt: 1 }} />
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};

export default TeacherLeave;








