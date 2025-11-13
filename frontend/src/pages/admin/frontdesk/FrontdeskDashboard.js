import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Divider,
    Chip,
    Alert,
} from '@mui/material';
import { createVisitor, fetchVisitors } from '../../../redux/visitorRelated/visitorHandle';
import { clearRecentVisitor } from '../../../redux/visitorRelated/visitorSlice';

const defaultFormState = {
    name: '',
    contactNumber: '',
    purpose: '',
    hostName: '',
    notes: '',
};

const FrontdeskDashboard = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { visitors, recentVisitor, loading, error, response } = useSelector((state) => state.visitor);

    const [form, setForm] = useState(defaultFormState);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(fetchVisitors(currentUser._id, { status: 'Checked In', limit: 50 }));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (recentVisitor) {
            setForm(defaultFormState);
        }
        return () => {
            dispatch(clearRecentVisitor());
        };
    }, [recentVisitor, dispatch]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFormError('');
        if (!form.name.trim()) {
            setFormError('Visitor name is required.');
            return;
        }
        if (!currentUser?._id) {
            setFormError('School identifier missing.');
            return;
        }

        const payload = {
            ...form,
            school: currentUser._id,
        };
        dispatch(createVisitor(payload));
    };

    const checkedInVisitors = useMemo(
        () => (Array.isArray(visitors) ? visitors.filter((visitor) => visitor.status === 'Checked In') : []),
        [visitors]
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Front Desk
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Register visitors, generate visitor cards with unique IDs, and monitor active check-ins.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3 }} elevation={3}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Create Visitor Card
                        </Typography>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formError}
                            </Alert>
                        )}
                        {response && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                {response}
                            </Alert>
                        )}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                Unable to create visitor. Please try again.
                            </Alert>
                        )}
                        <Stack
                            component="form"
                            spacing={2}
                            onSubmit={handleSubmit}
                        >
                            <TextField
                                label="Visitor Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Contact Number"
                                name="contactNumber"
                                value={form.contactNumber}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Purpose of Visit"
                                name="purpose"
                                value={form.purpose}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <TextField
                                label="Meeting With / Host"
                                name="hostName"
                                value={form.hostName}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Visitor Card'}
                            </Button>
                        </Stack>

                        {recentVisitor && (
                            <Paper sx={{ mt: 3, p: 2, borderLeft: '4px solid #4caf50' }} variant="outlined">
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Visitor Card Created
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    #{recentVisitor.visitorCode}
                                </Typography>
                                <Typography variant="body1">{recentVisitor.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Present this ID at the front desk.
                                </Typography>
                            </Paper>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Active Visitors
                            </Typography>
                            <Chip
                                label={`${checkedInVisitors.length} checked in`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {checkedInVisitors.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No visitors are currently checked in. Create a visitor card to add them here.
                            </Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {checkedInVisitors.map((visitor) => (
                                    <Grid item xs={12} sm={6} key={visitor._id}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderLeft: '4px solid #1976d2',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                #{visitor.visitorCode}
                                            </Typography>
                                            <Typography variant="body1">{visitor.name}</Typography>
                                            {visitor.hostName && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Meeting: {visitor.hostName}
                                                </Typography>
                                            )}
                                            {visitor.purpose && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Purpose: {visitor.purpose}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                Checked in at {new Date(visitor.checkInTime).toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FrontdeskDashboard;

