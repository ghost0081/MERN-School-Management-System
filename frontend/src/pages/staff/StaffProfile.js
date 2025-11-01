import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Grid, Box, Avatar, Container, Paper, Chip } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';

const StaffProfile = () => {
  const dispatch = useDispatch();
  const { currentUser, userDetails } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, 'Staff'));
    }
  }, [dispatch, currentUser]);

  const staffData = userDetails || currentUser || {};

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
      <Container maxWidth="md">
        <StyledPaper elevation={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Avatar alt="Staff Avatar" sx={{ width: 150, height: 150, fontSize: '3rem' }}>
                  {String(staffData.name || 'Staff').charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Typography variant="h5" component="h2" textAlign="center">
                  {staffData.name || 'Loading...'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Chip 
                  label={staffData.role || 'Staff Member'} 
                  color="primary"
                  sx={{ fontSize: '1rem', height: '32px' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Chip 
                  label={staffData.status || 'Active'} 
                  color={getStatusColor(staffData.status)}
                  sx={{ fontSize: '1rem', height: '32px' }}
                />
              </Box>
            </Grid>
          </Grid>
        </StyledPaper>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" component="p">
                  <strong>Email:</strong> {staffData.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" component="p">
                  <strong>Mobile:</strong> {staffData.mobile || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" component="p">
                  <strong>Role:</strong> {staffData.role || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" component="p">
                  <strong>Status:</strong> {staffData.status || 'Active'}
                </Typography>
              </Grid>
              {staffData.salary && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" component="p">
                    <strong>Salary:</strong> ₹{staffData.salary.toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {staffData.joiningDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" component="p">
                    <strong>Joining Date:</strong> {new Date(staffData.joiningDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {staffData.address && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" component="p">
                    <strong>Address:</strong> {staffData.address}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-top: 20px;
`;

export default StaffProfile;

