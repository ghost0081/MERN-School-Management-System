import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getPayrollByStaff, getPayrollByEmployee, updatePayrollStatus, getStaffPayrollHistory, getEmployeePayrollHistory } from '../../../redux/payrollRelated/payrollHandle';
import { underControl } from '../../../redux/payrollRelated/payrollSlice';
import { 
    Paper, 
    Typography, 
    Box, 
    CircularProgress,
    TextField,
    MenuItem,
    Chip,
    Grid,
    Card,
    CardContent,
    Button
} from '@mui/material';
import Popup from '../../../components/Popup';

const StaffPayrollPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id || params.teacherId || params.staffId; // Support multiple route formats
    const { currentUser } = useSelector(state => state.user);
    const { staffPayroll, staffPayrollHistory, loading, response, status } = useSelector(state => state.payroll);
    
    // Determine employee type from route path
    const path = window.location.pathname;
    const employeeType = path.includes('/teacher/') ? 'Teacher' : 'Staff';

    // Get current month in YYYY-MM format
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

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
        if (currentUser?._id && id && selectedMonth) {
            if (employeeType === 'Staff') {
                dispatch(getPayrollByStaff(id, selectedMonth, currentUser._id));
            } else {
                dispatch(getPayrollByEmployee(id, employeeType, selectedMonth, currentUser._id));
            }
        }
    }, [dispatch, currentUser, id, selectedMonth, employeeType]);

    // Fetch employee payroll history to calculate total paid amount
    useEffect(() => {
        if (id) {
            if (employeeType === 'Staff') {
                dispatch(getStaffPayrollHistory(id));
            } else {
                dispatch(getEmployeePayrollHistory(employeeType, id));
            }
        }
    }, [dispatch, id, employeeType]);

    useEffect(() => {
        if (status === 'added') {
            setMessage('Payroll status updated successfully');
            setShowPopup(true);
            dispatch(underControl());
            // Refresh payroll
            if (currentUser?._id && id && selectedMonth) {
                if (employeeType === 'Staff') {
                    dispatch(getPayrollByStaff(id, selectedMonth, currentUser._id));
                    dispatch(getStaffPayrollHistory(id));
                } else {
                    dispatch(getPayrollByEmployee(id, employeeType, selectedMonth, currentUser._id));
                    dispatch(getEmployeePayrollHistory(employeeType, id));
                }
            }
        } else if (status === 'failed') {
            setMessage(response || 'Failed to update payroll status');
            setShowPopup(true);
            dispatch(underControl());
        } else if (status === 'error') {
            setMessage('Network error occurred');
            setShowPopup(true);
            dispatch(underControl());
        }
    }, [status, response, dispatch, currentUser, id, selectedMonth]);

    const handleStatusChange = async (currentStatus) => {
        const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
        
        const payload = {
            month: selectedMonth,
            status: newStatus,
            employeeType: employeeType,
            schoolId: currentUser._id,
        };

        if (employeeType === 'Staff') {
            payload.staffId = id;
            payload.amount = staffPayroll?.employee?.salary || 0;
        } else {
            payload.teacherId = id;
            payload.amount = staffPayroll?.employee?.salary || staffPayroll?.payroll?.amount || 0;
        }
        
        await dispatch(updatePayrollStatus(payload));
    };

    if (loading && !staffPayroll) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    const currentStatus = staffPayroll?.status || 'Unpaid';
    const amount = staffPayroll?.amount || staffPayroll?.employee?.salary || staffPayroll?.payroll?.amount || 0;

    // Calculate total amount paid to this staff across all months
    const totalPaidAmount = (staffPayrollHistory || [])
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Payroll Management
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/Admin/payroll')}>
                    Back to Staff List
                </Button>
            </Box>

            {/* Employee Information */}
            {staffPayroll?.employee && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                        {employeeType} Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Name:</strong> {staffPayroll.employee.name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Email:</strong> {staffPayroll.employee.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Role:</strong> {staffPayroll.employee.role}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Monthly Salary:</strong> ₹{staffPayroll.employee.salary?.toLocaleString() || (employeeType === 'Teacher' ? 'Set in payroll' : 'N/A')}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

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

            {/* Total Amount Paid to Employee */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Total Amount Paid to {employeeType}
                            </Typography>
                            <Typography variant="h5" color="primary.main">
                                ₹{totalPaidAmount.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Sum of all paid payroll records
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Current Month Payroll Status */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                    {months.find(m => m.value === selectedMonth)?.label || selectedMonth} Payroll Status
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body1"><strong>Status:</strong></Typography>
                        <Chip
                            label={currentStatus}
                            color={currentStatus === 'Paid' ? 'success' : 'error'}
                            sx={{ fontSize: '1rem', height: '40px', minWidth: '100px' }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body1"><strong>Amount:</strong> ₹{amount.toLocaleString()}</Typography>
                    </Box>

                    {staffPayroll?.payroll?.paidDate && (
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Paid on: {new Date(staffPayroll.payroll.paidDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}

                    {staffPayroll?.payroll?.paymentMethod && (
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Payment Method: {staffPayroll.payroll.paymentMethod}
                            </Typography>
                        </Box>
                    )}

                    {staffPayroll?.payroll?.deductions && staffPayroll.payroll.deductions > 0 && (
                        <Box>
                            <Typography variant="body2" color="error">
                                Deductions: ₹{staffPayroll.payroll.deductions.toLocaleString()}
                            </Typography>
                        </Box>
                    )}

                    {staffPayroll?.payroll?.bonus && staffPayroll.payroll.bonus > 0 && (
                        <Box>
                            <Typography variant="body2" color="success.main">
                                Bonus: ₹{staffPayroll.payroll.bonus.toLocaleString()}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant={currentStatus === 'Paid' ? 'outlined' : 'contained'}
                            color={currentStatus === 'Paid' ? 'success' : 'error'}
                            onClick={() => handleStatusChange(currentStatus)}
                            disabled={loading}
                            size="large"
                            sx={{ minWidth: 200 }}
                        >
                            {currentStatus === 'Paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default StaffPayrollPage;

