import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllStaff } from '../../../redux/staffRelated/staffHandle';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton, Chip,
} from '@mui/material';
import { deleteStaffMember } from '../../../redux/staffRelated/staffHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowStaff = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { staffList, loading, error, response } = useSelector((state) => state.staff);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllStaff(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <GreenButton variant="contained" onClick={() => navigate("/Admin/addstaff")}>
                    Add Staff
                </GreenButton>
            </Box>
        );
    } else if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID) => {
        dispatch(deleteStaffMember(deleteID)).then(() => {
            dispatch(getAllStaff(currentUser._id));
        });
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 150 },
        { id: 'email', label: 'Email', minWidth: 150 },
        { id: 'mobile', label: 'Mobile', minWidth: 120 },
        { id: 'role', label: 'Role', minWidth: 100 },
        { id: 'salary', label: 'Salary', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
    ];

    const rows = staffList.map((staff) => {
        return {
            name: staff.name,
            email: staff.email,
            mobile: staff.mobile || 'N/A',
            role: staff.role,
            salary: staff.salary ? `₹${staff.salary.toLocaleString()}` : 'N/A',
            status: staff.status,
            id: staff._id,
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Staff',
            action: () => navigate("/Admin/addstaff")
        },
    ];

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
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            if (column.id === 'status') {
                                                return (
                                                    <StyledTableCell key={column.id} align={column.align}>
                                                        <Chip 
                                                            label={value} 
                                                            color={getStatusColor(value)}
                                                            size="small"
                                                        />
                                                    </StyledTableCell>
                                                );
                                            }
                                            return (
                                                <StyledTableCell key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                                </StyledTableCell>
                                            );
                                        })}
                                        <StyledTableCell align="center">
                                            <IconButton onClick={() => deleteHandler(row.id)}>
                                                <PersonRemoveIcon color="error" />
                                            </IconButton>
                                            <BlueButton variant="contained"
                                                onClick={() => navigate("/Admin/staff/" + row.id)}>
                                                View
                                            </BlueButton>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 5));
                    setPage(0);
                }}
            />

            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper >
    );
};

export default ShowStaff;


