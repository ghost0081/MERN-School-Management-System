import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFinancialAccounting } from '../../../redux/financialRelated/financialHandle';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    TextField,
    MenuItem,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const FinancialAccounting = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { financialData, loading } = useSelector(state => state.financial);

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState('');

    // Generate years (current year and previous 5 years)
    const generateYears = () => {
        const years = [];
        for (let i = 0; i < 6; i++) {
            years.push(currentYear - i);
        }
        return years;
    };

    // Generate months
    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const years = generateYears();

    useEffect(() => {
        if (currentUser?._id && selectedYear) {
            dispatch(getFinancialAccounting(currentUser._id, selectedYear, selectedMonth || null));
        }
    }, [dispatch, currentUser, selectedYear, selectedMonth]);

    if (loading && !financialData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    const data = financialData || {
        totalRevenue: 0,
        totalPayrollExpenses: 0,
        netProfit: 0,
        monthlyBreakdown: null,
    };

    return (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Financial Accounting
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                View revenue from fees and payroll expenses for selected period
            </Typography>

            {/* Year and Month Selectors */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Select Year"
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth(''); // Reset month when year changes
                        }}
                        variant="outlined"
                    >
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Select Month (Optional)"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        variant="outlined"
                        disabled={!selectedYear}
                    >
                        <MenuItem value="">
                            <em>All Months</em>
                        </MenuItem>
                        {months.map((month) => (
                            <MenuItem key={month.value} value={month.value}>
                                {month.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Revenue (Fees)
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                ₹{data.totalRevenue?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                From {data.totalFeeRecords || 0} paid fee records
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Payroll Expenses
                            </Typography>
                            <Typography variant="h4" color="error.main">
                                ₹{data.totalPayrollExpenses?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                From {data.totalPayrollRecords || 0} payroll records
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Net Profit / Loss
                            </Typography>
                            <Typography 
                                variant="h4" 
                                color={data.netProfit >= 0 ? 'success.main' : 'error.main'}
                            >
                                ₹{data.netProfit?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {data.netProfit >= 0 ? 'Profit' : 'Loss'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Monthly Breakdown Table (only show when year is selected, not specific month) */}
            {!selectedMonth && data.monthlyBreakdown && data.monthlyBreakdown.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Monthly Breakdown - {selectedYear}
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>Month</StyledTableCell>
                                    <StyledTableCell align="right">Revenue</StyledTableCell>
                                    <StyledTableCell align="right">Payroll</StyledTableCell>
                                    <StyledTableCell align="right">Net Profit/Loss</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {data.monthlyBreakdown.map((monthData, index) => (
                                    <StyledTableRow key={index}>
                                        <TableCell>{monthData.monthName}</TableCell>
                                        <TableCell align="right">₹{monthData.revenue?.toLocaleString() || 0}</TableCell>
                                        <TableCell align="right">₹{monthData.payroll?.toLocaleString() || 0}</TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                color={monthData.netProfit >= 0 ? 'success.main' : 'error.main'}
                                            >
                                                ₹{monthData.netProfit?.toLocaleString() || 0}
                                            </Typography>
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Paper>
    );
};

export default FinancialAccounting;


