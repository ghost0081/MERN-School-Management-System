import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllStaff } from '../../../redux/staffRelated/staffHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { getPayrollBySchool, updatePayrollStatus } from '../../../redux/payrollRelated/payrollHandle';
import { underControl } from '../../../redux/payrollRelated/payrollSlice';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Box, CircularProgress, TextField, MenuItem, InputAdornment, Grid, FormControl, InputLabel, Select, Chip } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import Popup from '../../../components/Popup';

const PayrollHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { staffList, loading: staffLoading } = useSelector(state => state.staff);
    const { teachersList, loading: teacherLoading } = useSelector(state => state.teacher);
    const { payrollList, loading: payrollLoading, status, response } = useSelector(state => state.payroll);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    // Get current month in YYYY-MM format
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

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
    const staffRoles = ['Janitor', 'Security Guard', 'Office Staff', 'Accountant', 'Librarian', 'Cafeteria Staff', 'Maintenance', 'Bus Driver', 'Other', 'Teacher'];

    // Initialize selected month
    useEffect(() => {
        if (!selectedMonth) {
            setSelectedMonth(getCurrentMonth());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch staff and teachers list
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllStaff(currentUser._id));
            dispatch(getAllTeachers(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Fetch payroll data for selected month
    useEffect(() => {
        if (currentUser?._id && selectedMonth) {
            dispatch(getPayrollBySchool(currentUser._id, selectedMonth));
        }
    }, [dispatch, currentUser, selectedMonth]);

    // Handle status updates
    useEffect(() => {
        if (status === 'added') {
            setMessage('Payroll status updated successfully');
            setShowPopup(true);
            dispatch(underControl());
            // Refresh payroll
            if (currentUser?._id && selectedMonth) {
                dispatch(getPayrollBySchool(currentUser._id, selectedMonth));
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
    }, [status, response, dispatch, currentUser, selectedMonth]);

    // Create a map of payroll status by employee ID (staff or teacher)
    const payrollMap = new Map();
    (payrollList || []).forEach(payroll => {
        if (payroll.employee?._id) {
            const key = `${payroll.employeeType || 'Staff'}_${payroll.employee._id.toString()}`;
            payrollMap.set(key, payroll);
        }
        // Legacy support for old payroll structure
        if (payroll.staff?._id) {
            payrollMap.set(`Staff_${payroll.staff._id.toString()}`, payroll);
        }
        if (payroll.teacher?._id) {
            payrollMap.set(`Teacher_${payroll.teacher._id.toString()}`, payroll);
        }
    });

    // Combine staff and teachers into a single list
    const allEmployees = [
        ...(staffList || []).map(staff => ({
            ...staff,
            employeeType: 'Staff',
            employeeId: staff._id,
        })),
        ...(teachersList || []).map(teacher => ({
            ...teacher,
            employeeType: 'Teacher',
            employeeId: teacher._id,
            role: teacher.role || 'Teacher',
        })),
    ];

    // Filter employees by search term and role
    const filteredEmployees = allEmployees.filter(employee => {
        const matchesSearch = 
            employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.role?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || employee.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    // Handle payroll status change
    const handleStatusChange = async (employeeId, employeeType, currentStatus) => {
        const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
        const employee = allEmployees.find(e => e._id === employeeId && e.employeeType === employeeType);
        
        const payload = {
            month: selectedMonth,
            status: newStatus,
            employeeType: employeeType,
            schoolId: currentUser._id,
        };

        if (employeeType === 'Staff') {
            payload.staffId = employeeId;
            payload.amount = employee?.salary || 0;
        } else if (employeeType === 'Teacher') {
            payload.teacherId = employeeId;
            payload.amount = 0; // Teachers don't have salary field, will be set by admin
        }
        
        await dispatch(updatePayrollStatus(payload));
    };

    const loading = staffLoading || teacherLoading || payrollLoading;

    if (loading && !staffList.length && !teachersList.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Payroll Management
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Select a staff member to manage their payroll
            </Typography>

            {/* Filters: Role and Month */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="role-select-label">Filter by Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={selectedRole}
                                label="Filter by Role"
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <MenuItem value="All">All Roles</MenuItem>
                                {staffRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="month-select-label">Select Month</InputLabel>
                            <Select
                                labelId="month-select-label"
                                id="month-select"
                                value={selectedMonth}
                                label="Select Month"
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                {months.map((month) => (
                                    <MenuItem key={month.value} value={month.value}>
                                        {month.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                        <TextField
                            fullWidth
                            label="Search Staff"
                            placeholder="Search by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        🔍
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
            
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell>Email</StyledTableCell>
                                <StyledTableCell>Role</StyledTableCell>
                                <StyledTableCell>Salary</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell align="right">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee) => {
                                    const key = `${employee.employeeType}_${employee._id.toString()}`;
                                    const payroll = payrollMap.get(key);
                                    const currentStatus = payroll?.status || 'Unpaid';
                                    const salary = employee.employeeType === 'Staff' 
                                        ? (employee.salary || 0) 
                                        : (payroll?.amount || 0);
                                    return (
                                        <StyledTableRow key={`${employee.employeeType}_${employee._id}`}>
                                            <TableCell>{employee.name}</TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.role}</TableCell>
                                            <TableCell>
                                                {salary > 0 ? `₹${salary.toLocaleString()}` : employee.employeeType === 'Teacher' ? 'Set in payroll' : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={currentStatus}
                                                    color={currentStatus === 'Paid' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    <Button
                                                        variant={currentStatus === 'Paid' ? 'outlined' : 'contained'}
                                                        color={currentStatus === 'Paid' ? 'success' : 'error'}
                                                        size="small"
                                                        onClick={() => handleStatusChange(employee._id, employee.employeeType, currentStatus)}
                                                        disabled={loading || !selectedMonth}
                                                    >
                                                        {currentStatus === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => navigate(`/Admin/payroll/${employee.employeeType.toLowerCase()}/${employee._id}`)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            {searchTerm || selectedRole !== 'All' ? 'No employees found matching your filters.' : 'No employees found. Please add staff or teachers first.'}
                                        </Typography>
                                    </TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default PayrollHomePage;

