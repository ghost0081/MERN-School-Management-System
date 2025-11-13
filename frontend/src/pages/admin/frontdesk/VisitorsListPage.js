import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Button,
    Chip,
} from '@mui/material';
import { fetchVisitors, updateVisitor } from '../../../redux/visitorRelated/visitorHandle';

const VisitorsListPage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { visitors, loading } = useSelector((state) => state.visitor);

    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        if (currentUser?._id) {
            const params = {};
            if (statusFilter !== 'All') {
                params.status = statusFilter;
            }
            dispatch(fetchVisitors(currentUser._id, params));
        }
    }, [dispatch, currentUser, statusFilter]);

    const tableData = useMemo(
        () =>
            (Array.isArray(visitors) ? visitors : []).map((visitor) => ({
                ...visitor,
                checkInLabel: visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : '-',
                checkOutLabel: visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : '-',
            })),
        [visitors]
    );

    const handleCheckout = (visitor) => {
        dispatch(
            updateVisitor(visitor._id, {
                status: 'Checked Out',
                checkOutTime: new Date(),
            })
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Visitor Log
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Access the complete visitor history, filter by status, and manage check-outs.
                    </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="visitor-status-filter-label">Filter by Status</InputLabel>
                    <Select
                        labelId="visitor-status-filter-label"
                        value={statusFilter}
                        label="Filter by Status"
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <MenuItem value="All">All Visitors</MenuItem>
                        <MenuItem value="Checked In">Checked In</MenuItem>
                        <MenuItem value="Checked Out">Checked Out</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Visitor ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Purpose</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell>Check-in</TableCell>
                                <TableCell>Check-out</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No visitors found for the selected filters.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {tableData.map((visitor) => (
                                <TableRow key={visitor._id}>
                                    <TableCell>
                                        <Chip label={`#${visitor.visitorCode}`} color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{visitor.name}</TableCell>
                                    <TableCell>{visitor.contactNumber || '-'}</TableCell>
                                    <TableCell>{visitor.purpose || '-'}</TableCell>
                                    <TableCell>{visitor.hostName || '-'}</TableCell>
                                    <TableCell>{visitor.checkInLabel}</TableCell>
                                    <TableCell>{visitor.checkOutLabel}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={visitor.status}
                                            color={visitor.status === 'Checked In' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {visitor.status === 'Checked In' && (
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleCheckout(visitor)}
                                                disabled={loading}
                                            >
                                                Mark Checked Out
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default VisitorsListPage;

