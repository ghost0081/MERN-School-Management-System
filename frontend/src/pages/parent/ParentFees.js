import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getStudentFeeHistory } from '../../redux/feeRelated/feeHandle';
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

const ParentFees = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { studentFeesList, loading } = useSelector(state => state.fee);

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
        if (currentUser?.student) {
            dispatch(getStudentFeeHistory(currentUser.student));
        }
    }, [dispatch, currentUser]);

    // Filter fees by selected month
    const filteredFees = studentFeesList.filter(fee => fee.month === selectedMonth);
    const currentMonthFee = filteredFees.length > 0 ? filteredFees[0] : null;

    // Calculate summary
    const allFees = studentFeesList || [];
    const totalFees = allFees.length;
    const paidFees = allFees.filter(f => f.status === 'Paid').length;
    const unpaidFees = totalFees - paidFees;
    const totalAmount = allFees.reduce((sum, f) => sum + (f.amount || 0), 0);
    
    // Calculate total paid amount (sum of all paid fees - accounts for duration)
    const paidAmount = allFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (f.amount || 0), 0);

    // Calculate next payment date based on last paid fee and duration
    const calculateNextPaymentDate = (lastPaidMonth, duration) => {
        if (!lastPaidMonth || !duration) return null;
        
        const [year, month] = lastPaidMonth.split('-').map(Number);
        let nextDate = new Date(year, month - 1, 1);
        
        const durationMonths = { 'Monthly': 1, '3 months': 3, '6 months': 6, 'Annual': 12 };
        const monthsToAdd = durationMonths[duration] || 1;
        nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
        
        return nextDate;
    };

    // Find the most recent paid fee to determine next payment date
    const paidFeesList = allFees.filter(f => f.status === 'Paid');
    const mostRecentPaidFee = paidFeesList.length > 0 
        ? paidFeesList.sort((a, b) => {
            // Sort by month (descending), then by paidDate (descending)
            if (b.month !== a.month) {
                return b.month.localeCompare(a.month);
            }
            const dateA = a.paidDate ? new Date(a.paidDate) : new Date(0);
            const dateB = b.paidDate ? new Date(b.paidDate) : new Date(0);
            return dateB - dateA;
        })[0]
        : null;

    const nextPaymentDate = mostRecentPaidFee 
        ? calculateNextPaymentDate(mostRecentPaidFee.month, mostRecentPaidFee.duration || 'Monthly')
        : null;

    if (loading && !studentFeesList.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Fee Payment Status
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                View your child's fee payment status. Only admins can update payment status.
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
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Paid Amount
                            </Typography>
                            <Typography variant="h5" color="success.main">
                                ₹{paidAmount.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Total fees paid (includes duration-based payments)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Next Payment Date
                            </Typography>
                            {nextPaymentDate ? (
                                <>
                                    <Typography 
                                        variant="h5" 
                                        color={nextPaymentDate < new Date() ? 'error.main' : 'primary.main'}
                                    >
                                        {nextPaymentDate.toLocaleDateString()}
                                    </Typography>
                                    {nextPaymentDate < new Date() && (
                                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                            Payment overdue
                                        </Typography>
                                    )}
                                    {mostRecentPaidFee?.duration && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            Based on {mostRecentPaidFee.duration} payment plan
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5" color="text.secondary">
                                        Not Available
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        No payment records found
                                    </Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Payment Status
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Chip
                                    label={`Paid: ${paidFees}`}
                                    color="success"
                                    size="small"
                                />
                                <Chip
                                    label={`Unpaid: ${unpaidFees}`}
                                    color="error"
                                    size="small"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Current Month Fee Status */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {months.find(m => m.value === selectedMonth)?.label || selectedMonth} Fee Status
                </Typography>
                {currentMonthFee ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={currentMonthFee.status}
                            color={currentMonthFee.status === 'Paid' ? 'success' : 'error'}
                            sx={{ fontSize: '1rem', height: '40px', minWidth: '100px' }}
                        />
                        <Typography variant="body1">
                            <strong>Amount:</strong> ₹{currentMonthFee.amount?.toLocaleString() || 0}
                        </Typography>
                        {currentMonthFee.paidDate && (
                            <Typography variant="body2" color="text.secondary">
                                Paid on: {new Date(currentMonthFee.paidDate).toLocaleDateString()}
                            </Typography>
                        )}
                        {currentMonthFee.paymentMethod && (
                            <Typography variant="body2" color="text.secondary">
                                Method: {currentMonthFee.paymentMethod}
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

            {/* Fee History Table */}
            <Paper>
                <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
                    Fee Payment History
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
                            {allFees.length > 0 ? (
                                allFees
                                    .sort((a, b) => b.month.localeCompare(a.month))
                                    .map((fee, index) => {
                                        const monthLabel = months.find(m => m.value === fee.month)?.label || fee.month;
                                        return (
                                            <StyledTableRow key={fee._id || index}>
                                                <TableCell>{monthLabel}</TableCell>
                                                <TableCell>₹{fee.amount?.toLocaleString() || 0}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={fee.status}
                                                        color={fee.status === 'Paid' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {fee.paidDate 
                                                        ? new Date(fee.paidDate).toLocaleDateString() 
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>{fee.paymentMethod || '-'}</TableCell>
                                            </StyledTableRow>
                                        );
                                    })
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            No fee records found
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

export default ParentFees;

