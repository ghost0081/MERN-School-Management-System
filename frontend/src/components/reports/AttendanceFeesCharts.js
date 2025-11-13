import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    AreaChart,
    Area,
} from 'recharts';

const formatMonthLabel = (value) => {
    if (!value) return value;
    const date = new Date(`${value}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
};

const numberFormatter = (value) => (typeof value === 'number' ? value.toLocaleString() : value);
const currencyFormatter = (value) => `₹${numberFormatter(value || 0)}`;

const AttendanceFeesCharts = ({ hideSummaries = false }) => {
    const { attendance, fees, loading, error } = useSelector((state) => state.report);

    const attendanceData = useMemo(() => {
        if (!attendance?.monthly) return [];
        return attendance.monthly.map((item) => ({
            ...item,
            label: formatMonthLabel(item.month),
        }));
    }, [attendance]);

    const feesData = useMemo(() => {
        if (!fees?.monthly) return [];
        return fees.monthly.map((item) => ({
            ...item,
            label: formatMonthLabel(item.month),
        }));
    }, [fees]);

    const attendanceSummary = attendance?.totals || { present: 0, absent: 0, overallPercentage: 0 };
    const feesSummary = fees?.totals || { paidAmount: 0, unpaidAmount: 0, collectionRate: 0 };

    const renderContent = (content) => (
        <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
            {content}
        </Paper>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography variant="body2">Unable to load reports. Please try again.</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                {renderContent(
                    <>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Attendance Trend
                        </Typography>
                        {!hideSummaries && (
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                Overall attendance rate:{' '}
                                <strong>{attendanceSummary.overallPercentage || 0}%</strong> (
                                {attendanceSummary.present || 0} present / {attendanceSummary.absent || 0} absent)
                            </Typography>
                        )}
                        {attendanceData.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No attendance data found for the selected period.
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip formatter={numberFormatter} />
                                    <Legend />
                                    <Bar dataKey="present" name="Present" fill="#4caf50" />
                                    <Bar dataKey="absent" name="Absent" fill="#ef5350" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                {renderContent(
                    <>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Fees Collection
                        </Typography>
                        {!hideSummaries && (
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                Collection rate:{' '}
                                <strong>{feesSummary.collectionRate || 0}%</strong> (Paid:{' '}
                                {currencyFormatter(feesSummary.paidAmount)} / Pending:{' '}
                                {currencyFormatter(feesSummary.unpaidAmount)})
                            </Typography>
                        )}
                        {feesData.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No fees data found for the selected period.
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={feesData}>
                                    <defs>
                                        <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorUnpaid" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) =>
                                            name.includes('Amount') ? currencyFormatter(value) : numberFormatter(value)
                                        }
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="paidAmount"
                                        name="Paid Amount"
                                        stroke="#1976d2"
                                        fillOpacity={1}
                                        fill="url(#colorPaid)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="unpaidAmount"
                                        name="Unpaid Amount"
                                        stroke="#ff9800"
                                        fillOpacity={1}
                                        fill="url(#colorUnpaid)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </Grid>
        </Grid>
    );
};

export default AttendanceFeesCharts;

