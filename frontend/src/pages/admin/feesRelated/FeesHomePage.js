import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Box, CircularProgress } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const FeesHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList, loading } = useSelector(state => state.sclass);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, 'Sclass'));
        }
    }, [dispatch, currentUser]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Fees Management
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Select a class to view and manage student fees
            </Typography>
            
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Class Name</StyledTableCell>
                                <StyledTableCell align="right">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {sclassesList.length > 0 ? (
                                sclassesList.map((sclass) => (
                                    <StyledTableRow key={sclass._id}>
                                        <TableCell>{sclass.sclassName}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/Admin/fees/class/${sclass._id}`)}
                                            >
                                                Manage Fees
                                            </Button>
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={2} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No classes found. Please add classes first.
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

export default FeesHomePage;


