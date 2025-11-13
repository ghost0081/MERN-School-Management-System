import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Divider,
} from '@mui/material';
import AttendanceFeesCharts from '../../../components/reports/AttendanceFeesCharts';
import { fetchAttendanceReport, fetchFeesReport } from '../../../redux/reportRelated/reportHandle';

const formatMonthLabel = (value) => {
    if (!value) return value;
    const date = new Date(`${value}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

const ReportsDashboard = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { attendance, fees } = useSelector((state) => state.report);

    const [monthsRange, setMonthsRange] = useState(6);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(fetchAttendanceReport(currentUser._id, monthsRange));
            dispatch(fetchFeesReport(currentUser._id, monthsRange));
        }
    }, [dispatch, currentUser, monthsRange]);

    const attendanceSummary = attendance?.totals || { present: 0, absent: 0, overallPercentage: 0 };
    const feesSummary = fees?.totals || { paidAmount: 0, unpaidAmount: 0, paidCount: 0, unpaidCount: 0, collectionRate: 0 };

    const attendanceByMonth = useMemo(() => {
        if (!attendance?.monthly) return [];
        return attendance.monthly.map((item) => ({
            month: formatMonthLabel(item.month),
            present: item.present,
            absent: item.absent,
            rate: item.present + item.absent > 0 ? Math.round((item.present / (item.present + item.absent)) * 100) : 0,
        }));
    }, [attendance]);

    const feesByMonth = useMemo(() => {
        if (!fees?.monthly) return [];
        return fees.monthly.map((item) => ({
            month: formatMonthLabel(item.month),
            paidAmount: item.paidAmount,
            unpaidAmount: item.unpaidAmount,
            paidCount: item.paidCount,
            unpaidCount: item.unpaidCount,
            collectionRate: item.paidCount + item.unpaidCount > 0
                ? Math.round((item.paidCount / (item.paidCount + item.unpaidCount)) * 100)
                : 0,
        }));
    }, [fees]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Reports &amp; Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Visualize attendance trends and fees collection insights across your school.
                    </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="months-range-label">Reporting Range</InputLabel>
                    <Select
                        labelId="months-range-label"
                        value={monthsRange}
                        label="Reporting Range"
                        onChange={(event) => setMonthsRange(event.target.value)}
                    >
                        <MenuItem value={3}>Last 3 months</MenuItem>
                        <MenuItem value={6}>Last 6 months</MenuItem>
                        <MenuItem value={12}>Last 12 months</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2 }} elevation={3}>
                        <Typography variant="body2" color="text.secondary">
                            Attendance Rate
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {attendanceSummary.overallPercentage || 0}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {attendanceSummary.present || 0} Present / {attendanceSummary.absent || 0} Absent
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2 }} elevation={3}>
                        <Typography variant="body2" color="text.secondary">
                            Total Present Entries
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {attendanceSummary.present?.toLocaleString() || 0}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2 }} elevation={3}>
                        <Typography variant="body2" color="text.secondary">
                            Fees Collection Rate
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {feesSummary.collectionRate || 0}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {feesSummary.paidCount || 0} Paid / {feesSummary.unpaidCount || 0} Pending
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2 }} elevation={3}>
                        <Typography variant="body2" color="text.secondary">
                            Fees Collected
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {formatCurrency(feesSummary.paidAmount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Pending: {formatCurrency(feesSummary.unpaidAmount)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <AttendanceFeesCharts />

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }} elevation={3}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Attendance Breakdown
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {attendanceByMonth.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No attendance records found for the selected period.
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell align="right">Present</TableCell>
                                        <TableCell align="right">Absent</TableCell>
                                        <TableCell align="right">Attendance %</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceByMonth.map((row) => (
                                        <TableRow key={row.month}>
                                            <TableCell>{row.month}</TableCell>
                                            <TableCell align="right">{row.present.toLocaleString()}</TableCell>
                                            <TableCell align="right">{row.absent.toLocaleString()}</TableCell>
                                            <TableCell align="right">{row.rate}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }} elevation={3}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Fees Collection Breakdown
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {feesByMonth.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No fees records found for the selected period.
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell align="right">Paid Amount</TableCell>
                                        <TableCell align="right">Pending Amount</TableCell>
                                        <TableCell align="right">Collection %</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {feesByMonth.map((row) => (
                                        <TableRow key={row.month}>
                                            <TableCell>{row.month}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.paidAmount)}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.unpaidAmount)}</TableCell>
                                            <TableCell align="right">{row.collectionRate}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReportsDashboard;

