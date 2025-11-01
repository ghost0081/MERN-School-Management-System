import React, { useEffect } from 'react';
import { getStaffDetails } from '../../../redux/staffRelated/staffHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Typography, Paper, Grid, Chip, Box } from '@mui/material';

const StaffDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, staffDetails, error } = useSelector((state) => state.staff);

    const staffID = params.id;

    useEffect(() => {
        dispatch(getStaffDetails(staffID));
    }, [dispatch, staffID]);

    if (error) {
        console.log(error);
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Inactive':
                return 'default';
            case 'On Leave':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Container>
                    <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
                        Staff Details
                    </Typography>
                    <Paper sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Name:</strong> {staffDetails?.name}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Email:</strong> {staffDetails?.email}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Mobile:</strong> {staffDetails?.mobile || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Address:</strong> {staffDetails?.address || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Role:</strong> {staffDetails?.role}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Salary:</strong> {staffDetails?.salary ? `₹${staffDetails.salary.toLocaleString()}` : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    <strong>Joining Date:</strong> {staffDetails?.joiningDate ? new Date(staffDetails.joiningDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        <strong>Status:</strong>
                                    </Typography>
                                    <Chip 
                                        label={staffDetails?.status || 'Active'} 
                                        color={getStatusColor(staffDetails?.status)}
                                        size="medium"
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" onClick={() => navigate("/Admin/staff")}>
                                Back to Staff List
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default StaffDetails;


