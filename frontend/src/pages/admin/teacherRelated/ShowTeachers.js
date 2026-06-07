import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton,
} from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <GreenButton variant="contained" onClick={() => navigate("/Admin/teachers/chooseclass")}>
                    Add Teacher
                </GreenButton>
            </Box>
        );
    } else if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        setMessage("Sorry the delete function has been disabled for now.")
        setShowPopup(true)

        // dispatch(deleteUser(deleteID, address)).then(() => {
        //     dispatch(getAllTeachers(currentUser._id));
        // });
    };

    const rows = teachersList.map((teacher) => {
        return {
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass.sclassName,
            teachSclassID: teacher.teachSclass._id,
            id: teacher._id,
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Teacher',
            action: () => navigate("/Admin/teachers/chooseclass")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        },
    ];

    return (
        <Box sx={{ p: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E1E1E' }}>Teachers</div>
            </Box>
            
            {rows.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                    <div style={{ color: '#8B8B8B', marginBottom: '16px' }}>No teachers found.</div>
                    <Button variant="contained" sx={{ backgroundColor: '#7B61FF', '&:hover': { backgroundColor: '#624bff' } }} onClick={() => navigate("/Admin/teachers/chooseclass")}>
                        + Add Teacher
                    </Button>
                </Paper>
            ) : (
                <>
                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <Paper 
                            key={row.id} 
                            sx={{ 
                                p: 3, 
                                mb: 2, 
                                borderRadius: '16px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                border: '1px solid #EAEAEC'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <div style={{ 
                                        width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(123, 97, 255, 0.1)', 
                                        color: '#7B61FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', fontWeight: 700
                                    }}>
                                        {row.name.charAt(0)}
                                    </div>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E1E1E', lineHeight: '1.2' }}>{row.name}</div>
                                            <div style={{ 
                                                backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32', 
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                Active
                                            </div>
                                        </Box>
                                        <div style={{ fontSize: '0.85rem', color: '#8B8B8B', marginTop: '4px' }}>
                                            ID: #{row.id.substring(0,6).toUpperCase()} • Full Time • Faculty
                                        </div>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton onClick={() => deleteHandler(row.id, "Teacher")} sx={{ border: '1px solid #EAEAEC', borderRadius: '8px' }}>
                                        <PersonRemoveIcon color="error" />
                                    </IconButton>
                                    <Button 
                                        variant="outlined" 
                                        onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
                                        sx={{ borderColor: '#EAEAEC', color: '#1E1E1E', '&:hover': { borderColor: '#1E1E1E', backgroundColor: '#F8F9FA' } }}
                                    >
                                        Detail {'>'}
                                    </Button>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, backgroundColor: '#F8F9FA', p: 1.5, borderRadius: '8px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8B8B8B', fontWeight: 600, width: 60 }}>CLASS</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1E1E' }}>{row.teachSclass}</div>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#8B8B8B', fontWeight: 600, width: 60 }}>SUBJECT</div>
                                    {row.teachSubject ? (
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1E1E' }}>{row.teachSubject}</div>
                                    ) : (
                                        <div 
                                            style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7B61FF', cursor: 'pointer' }} 
                                            onClick={() => navigate(`/Admin/teachers/choosesubject/${row.teachSclassID}/${row.id}`)}
                                        >
                                            Add Subject
                                        </div>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                    
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
                </>
            )}

            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowTeachers