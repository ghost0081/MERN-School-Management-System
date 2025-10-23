import { useEffect } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { setAssignmentStatus, createAssignment } from '../../redux/assignmentRelated/assignmentHandle';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id
    const schoolID = currentUser.school?._id
    const teacherID = currentUser._id

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks', 'Assignments'];

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            console.info(`You clicked ${options[selectedIndex]}`);
            if (selectedIndex === 0) handleAttendance();
            else if (selectedIndex === 1) handleMarks();
            else if (selectedIndex === 2) handleAssignments();
        };

        const handleAttendance = () => {
            navigate(`/Teacher/class/student/attendance/${row.id}/${subjectID}`)
        }
        const handleMarks = () => {
            navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`)
        };

        const handleAssignments = () => {
            setAssignOpen(true);
        };

        const [assignOpen, setAssignOpen] = React.useState(false);
        const [selectedAssignment, setSelectedAssignment] = React.useState('');
        const [selectedStatus, setSelectedStatus] = React.useState('Submitted');

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }

            setOpen(false);
        };
        return (
            <>
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Teacher/class/student/" + row.id)
                    }
                >
                    View
                </BlueButton>
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper
                        sx={{
                            zIndex: 1,
                        }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    disabled={index === 2}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>

                <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Mark Assignment</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField fullWidth label="Assignment ID" value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)} helperText="Enter assignment ID for this subject (or add selection UI later)" />
                            <TextField fullWidth label="Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
                        <Button onClick={() => { dispatch(setAssignmentStatus(selectedAssignment, row.id, selectedStatus)); setAssignOpen(false); }} id={`mark-assign-${row.id}`} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    const [createOpen, setCreateOpen] = React.useState(false);
    const [form, setForm] = React.useState({ title: '', description: '', dueDate: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!form.title || !form.dueDate) return;
        dispatch(createAssignment({
            title: form.title,
            description: form.description,
            dueDate: form.dueDate,
            subject: subjectID,
            sclassName: classID,
            school: schoolID,
            teacher: teacherID,
        }));
        setCreateOpen(false);
        setForm({ title: '', description: '', dueDate: '' });
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Details
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button variant="contained" onClick={() => setCreateOpen(true)}>New Assignment</Button>
                    </Box>
                    {getresponse ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                No Students Found
                            </Box>
                        </>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Typography variant="h5" gutterBottom>
                                Students List:
                            </Typography>

                            {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
                                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                            }
                        </Paper>
                    )}

                    <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                        <DialogTitle>New Assignment</DialogTitle>
                        <DialogContent>
                            <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                <TextField type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} variant="contained">Create</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;