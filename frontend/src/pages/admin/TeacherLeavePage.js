import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Divider,
    Box,
} from '@mui/material';

const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';

const formatDate = (date) => new Date(date).toLocaleDateString();
const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start) || isNaN(end)) return 1;
    const diff = Math.abs(end - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const TeacherLeavePage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { leaves, loading } = useSelector(state => state.leave);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [deductionApplied, setDeductionApplied] = useState(false);
    const [deductionAmount, setDeductionAmount] = useState('');
    const [finalAmount, setFinalAmount] = useState('');
    const [deductionReason, setDeductionReason] = useState('');

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getSchoolLeaves(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const leavesList = useMemo(() => Array.isArray(leaves) ? leaves : [], [leaves]);

    const handleReject = async (leave) => {
        if (!currentUser?._id) return;
        await dispatch(setLeaveStatus(leave._id, { status: 'Rejected', approvedBy: currentUser._id }));
        dispatch(getSchoolLeaves(currentUser._id));
    };

    const openApproveDialog = (leave) => {
        setSelectedLeave(leave);
        setDeductionApplied(Boolean(leave.deductionApplied));
        setDeductionAmount(
            leave.deductionAmount !== undefined && leave.deductionAmount !== null
                ? String(leave.deductionAmount)
                : ''
        );
        setFinalAmount(
            leave.finalAmount !== undefined && leave.finalAmount !== null
                ? String(leave.finalAmount)
                : ''
        );
        setDeductionReason(leave.deductionReason || '');
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedLeave(null);
        setDeductionApplied(false);
        setDeductionAmount('');
        setFinalAmount('');
        setDeductionReason('');
    };

    const handleApprove = async () => {
        if (!selectedLeave || !currentUser?._id) return;
        const payload = {
            status: 'Approved',
            approvedBy: currentUser._id,
            deductionApplied,
        };

        if (deductionApplied) {
            payload.deductionAmount = deductionAmount ? Number(deductionAmount) : 0;
            payload.deductionReason = deductionReason || `Leave deduction (${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)`;
        }

        if (finalAmount !== '') {
            payload.finalAmount = Number(finalAmount);
        }

        await dispatch(setLeaveStatus(selectedLeave._id, payload));
        closeDialog();
        dispatch(getSchoolLeaves(currentUser._id));
    };

    return (
        <>
            <Stack spacing={2}>
                {loading && leavesList.length === 0 && (
                    <Typography variant="body2">Loading leaves...</Typography>
                )}
                {leavesList.map(leave => {
                    const totalDays = leave.totalDays || calculateDays(leave.fromDate, leave.toDate);
                    return (
                        <Card key={leave._id}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {leave.teacher?.name || 'Unknown Teacher'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Days: {totalDays}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Typography variant="body2">
                                            {leave.reason}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                                        </Typography>
                                        {leave.deductionApplied && (
                                            <Typography variant="caption" color="error">
                                                Deduction applied: Rs.{leave.deductionAmount || 0} {leave.deductionReason ? `(${leave.deductionReason})` : ''}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Chip label={leave.status} color={statusColor(leave.status)} size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" onClick={() => openApproveDialog(leave)}>
                                                Approve
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleReject(leave)}>
                                                Reject
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    );
                })}
                {!loading && leavesList.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No leave applications found.
                    </Typography>
                )}
            </Stack>

            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Leave &amp; Salary Adjustment</DialogTitle>
                <DialogContent dividers>
                    {selectedLeave && (
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {selectedLeave.teacher?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)} ({selectedLeave.totalDays || calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={deductionApplied}
                                        onChange={(e) => setDeductionApplied(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Apply salary deduction for this leave"
                            />
                            {deductionApplied && (
                                <TextField
                                    margin="dense"
                                    label="Deduction Amount (Rs.)"
                                    type="number"
                                    fullWidth
                                    value={deductionAmount}
                                    onChange={(e) => setDeductionAmount(e.target.value)}
                                    helperText="Total amount to deduct from the teacher's salary for this month"
                                />
                            )}
                            <TextField
                                margin="dense"
                                label="Updated Salary Amount (Rs.)"
                                type="number"
                                fullWidth
                                value={finalAmount}
                                onChange={(e) => setFinalAmount(e.target.value)}
                                helperText="Optional: set the final salary amount for this month after deduction"
                            />
                            {deductionApplied && (
                                <TextField
                                    margin="dense"
                                    label="Deduction Notes"
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    value={deductionReason}
                                    onChange={(e) => setDeductionReason(e.target.value)}
                                    helperText="Reason for deduction (visible in payroll records)"
                                />
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={handleApprove} variant="contained">
                        Approve &amp; Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TeacherLeavePage;