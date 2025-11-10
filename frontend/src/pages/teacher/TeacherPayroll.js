import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getEmployeePayrollHistory } from '../../redux/payrollRelated/payrollHandle';
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    TextField,
    MenuItem,
    Chip,
    Card,
    CardContent,
    Grid,
    CircularProgress
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const TeacherPayroll = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { staffPayrollHistory, loading } = useSelector(state => state.payroll);

    // Get current month in YYYY-MM format
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

    // Generate list of months (current month and previous 11 months)
    const generateMonths = () => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            months.push({ value: monthStr, label: monthName });
        }
        return months;
    };

    const months = generateMonths();

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getEmployeePayrollHistory('Teacher', currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Filter payroll by selected month
    const filteredPayroll = (staffPayrollHistory || []).filter(payroll => payroll.month === selectedMonth);
    const currentMonthPayroll = filteredPayroll.length > 0 ? filteredPayroll[0] : null;

    // Calculate summary
    const allPayroll = staffPayrollHistory || [];
    const totalPayroll = allPayroll.length;
    const paidPayroll = allPayroll.filter(p => p.status === 'Paid').length;
    const unpaidPayroll = totalPayroll - paidPayroll;
    const totalAmount = allPayroll.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidAmount = allPayroll.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);

    if (loading && !staffPayrollHistory.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Payroll Status
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                View your payroll payment status. Only admins can update payment status.
            </Typography>

            {/* Month Selector */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            select
                            label="Select Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            variant="outlined"
                        >
                            {months.map((month) => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Payroll Records
                            </Typography>
                            <Typography variant="h5">
                                {totalPayroll}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Paid
                            </Typography>
                            <Typography variant="h5" color="success.main">
                                {paidPayroll}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Unpaid
                            </Typography>
                            <Typography variant="h5" color="error.main">
                                {unpaidPayroll}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Paid Amount
                            </Typography>
                            <Typography variant="h5" color="primary.main">
                                ₹{paidAmount.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Current Month Payroll Status */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {months.find(m => m.value === selectedMonth)?.label || selectedMonth} Payroll Status
                </Typography>
                {currentMonthPayroll ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={currentMonthPayroll.status}
                            color={currentMonthPayroll.status === 'Paid' ? 'success' : 'error'}
                            sx={{ fontSize: '1rem', height: '40px', minWidth: '100px' }}
                        />
                        <Typography variant="body1">
                            <strong>Amount:</strong> ₹{currentMonthPayroll.amount?.toLocaleString() || 0}
                        </Typography>
                        {currentMonthPayroll.paidDate && (
                            <Typography variant="body2" color="text.secondary">
                                Paid on: {new Date(currentMonthPayroll.paidDate).toLocaleDateString()}
                            </Typography>
                        )}
                        {currentMonthPayroll.paymentMethod && (
                            <Typography variant="body2" color="text.secondary">
                                Method: {currentMonthPayroll.paymentMethod}
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label="Unpaid"
                            color="error"
                            sx={{ fontSize: '1rem', height: '40px', minWidth: '100px' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            No payment record found for this month
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Payroll History Table */}
            <Paper>
                <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
                    Payroll Payment History
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Month</StyledTableCell>
                                <StyledTableCell>Amount</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Paid Date</StyledTableCell>
                                <StyledTableCell>Payment Method</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {allPayroll.length > 0 ? (
                                allPayroll
                                    .sort((a, b) => b.month.localeCompare(a.month))
                                    .map((payroll, index) => {
                                        const monthLabel = months.find(m => m.value === payroll.month)?.label || payroll.month;
                                        return (
                                            <StyledTableRow key={payroll._id || index}>
                                                <TableCell>{monthLabel}</TableCell>
                                                <TableCell>₹{payroll.amount?.toLocaleString() || 0}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={payroll.status}
                                                        color={payroll.status === 'Paid' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {payroll.paidDate 
                                                        ? new Date(payroll.paidDate).toLocaleDateString() 
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>{payroll.paymentMethod || '-'}</TableCell>
                                            </StyledTableRow>
                                        );
                                    })
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            No payroll records found
                                        </Typography>
                                    </TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default TeacherPayroll;


