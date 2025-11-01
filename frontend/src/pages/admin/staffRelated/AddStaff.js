import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Popup from '../../../components/Popup';
import { registerStaff } from '../../../redux/staffRelated/staffHandle';
import { underStaffControl } from '../../../redux/staffRelated/staffSlice';
import { 
  CircularProgress, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  MenuItem, 
  Box, 
  Grid,
  InputAdornment
} from '@mui/material';

const AddStaff = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { status, response, error } = useSelector(state => state.staff);
  const { currentUser } = useSelector(state => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Other');
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [staffStatus, setStaffStatus] = useState('Active');

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  const school = currentUser._id;

  const roles = ['Janitor', 'Security Guard', 'Office Staff', 'Accountant', 'Librarian', 'Cafeteria Staff', 'Maintenance', 'Bus Driver', 'Other'];

  const fields = { 
    name: name ? name.trim() : '', 
    email: email ? email.trim() : '', 
    password: password ? password.trim() : '', 
    mobile: mobile ? mobile.trim() : '', 
    address: address ? address.trim() : '', 
    role: role.trim(), 
    school, 
    salary: salary ? Number(salary) : undefined, 
    joiningDate: joiningDate || undefined, 
    status: staffStatus 
  }

  const submitHandler = (event) => {
    event.preventDefault()
    
    // Validate name is filled
    if (!name || !name.trim()) {
      setMessage("Staff name is required")
      setShowPopup(true)
      return
    }
    
    if (!email || !email.trim()) {
      setMessage("Email is required")
      setShowPopup(true)
      return
    }
    
    if (!password || !password.trim()) {
      setMessage("Password is required")
      setShowPopup(true)
      return
    }
    
    console.log('Submitting staff with fields:', fields)
    setLoader(true)
    dispatch(registerStaff(fields))
  }

  useEffect(() => {
    if (status === 'added') {
      dispatch(underStaffControl())
      setLoader(false)
      navigate("/Admin/staff")
    }
    else if (status === 'failed') {
      setMessage(response || "Failed to add staff")
      setShowPopup(true)
      setLoader(false)
    }
    else if (status === 'error') {
      setMessage("Network Error")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, sm: 3 }, pb: 0, px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, pb: { xs: 2, sm: 3 }, borderRadius: 2, mb: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Add Staff Member
        </Typography>
        
        <Box component="form" onSubmit={submitHandler} sx={{ pb: 0, mb: 0 }}>
          <Grid container spacing={3} sx={{ mb: 0, pb: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Staff Name"
                required
                placeholder="Enter staff full name..."
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                variant="outlined"
                error={!name && name !== ''}
                helperText={!name && name !== '' ? 'Staff name is required' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                placeholder="Enter staff email..."
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                variant="outlined"
                error={!email && email !== ''}
                helperText={!email && email !== '' ? 'Email is required' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                variant="outlined"
                error={!password && password !== ''}
                helperText={!password && password !== '' ? 'Password is required' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                type="tel"
                placeholder="Enter mobile number (optional)..."
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                placeholder="Enter address (optional)..."
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Role"
                required
                value={role}
                onChange={(event) => setRole(event.target.value)}
                variant="outlined"
              >
                {roles.map((r, index) => (
                  <MenuItem key={index} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary (Optional)"
                type="number"
                placeholder="Enter salary..."
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Joining Date"
                type="date"
                value={joiningDate}
                onChange={(event) => setJoiningDate(event.target.value)}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                required
                value={staffStatus}
                onChange={(event) => setStaffStatus(event.target.value)}
                variant="outlined"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ mb: 0, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 0, pb: 0 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/Admin/staff")}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loader}
                  sx={{ minWidth: 120, bgcolor: '#000', '&:hover': { bgcolor: '#313131' } }}
                >
                  {loader ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Add Staff'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  )
}

export default AddStaff

