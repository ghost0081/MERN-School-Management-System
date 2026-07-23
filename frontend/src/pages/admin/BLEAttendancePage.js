import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container, Box, Typography, Paper, Grid, FormControl, InputLabel,
    Select, MenuItem, Button, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody, Checkbox, FormControlLabel, Switch, CircularProgress,
    Card, CardContent, Chip, Alert, TextField
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import CellTowerIcon from '@mui/icons-material/CellTower';
import axios from 'axios';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import Popup from '../../components/Popup';

const BLEAttendancePage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList, subjectsList } = useSelector(state => state.sclass);

    // Form inputs
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Data states
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [attendanceState, setAttendanceState] = useState({}); // { studentId: { status, manual } }

    // BLE Scanning states
    const [scannerActive, setScannerActive] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [bleSightings, setBleSightings] = useState({});
    const [scannerStatus, setScannerStatus] = useState({ ok: false, running: false, error: 'Scanner not started' });

    // UI feedback
    const [submitting, setSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [currentUser, dispatch]);

    // Handle Class Selection
    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectedSubject('');
        setStudents([]);
        setAttendanceState({});
        if (classId) {
            dispatch(getSubjectList(classId, "ClassSubjects"));
            fetchStudents(classId);
        }
    };

    // Fetch Students of Selected Class
    const fetchStudents = async (classId) => {
        setLoadingStudents(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${classId}`);
            if (res.data && !res.data.message) {
                setStudents(res.data);
                // Initialize attendance as Absent
                const initial = {};
                res.data.forEach(std => {
                    initial[std._id] = { status: 'Absent', manual: false };
                });
                setAttendanceState(initial);
            } else {
                setStudents([]);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    // Connect & Poll BLE Python Scanner (Flask API at port 8765)
    useEffect(() => {
        let timer = null;
        if (scannerActive) {
            const pollScanner = async () => {
                try {
                    const res = await axios.get('http://localhost:8765/api/sightings');
                    setBleSightings(res.data.sightings || {});
                    setScannerStatus({
                        ok: res.data.bluetoothOk,
                        running: res.data.scannerRunning,
                        error: res.data.error,
                        stats: res.data.stats
                    });
                } catch (err) {
                    setBleSightings({});
                    setScannerStatus({
                        ok: false,
                        running: false,
                        error: 'Flask scan server offline. Run: python scan_server.py'
                    });
                }
            };
            pollScanner();
            timer = setInterval(pollScanner, 500);
        } else {
            setBleSightings({});
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [scannerActive]);

    // Auto-mark present students if seen in BLE advertisements
    useEffect(() => {
        if (!scannerActive || !autoMode || students.length === 0) return;

        setAttendanceState(prev => {
            const next = { ...prev };
            students.forEach(student => {
                const isDetected = checkBleSighting(student);
                const current = prev[student._id];

                // If detected and not manually overridden, mark present
                if (isDetected && (!current || !current.manual)) {
                    next[student._id] = { status: 'Present', manual: false };
                }
                // If out of range, not manually overridden, and previously auto-marked Present, revert to Absent
                else if (!isDetected && current && !current.manual && current.status === 'Present') {
                    next[student._id] = { status: 'Absent', manual: false };
                }
            });
            return next;
        });
    }, [bleSightings, scannerActive, autoMode, students]);

    // Check if student BLE badge is advertising
    const checkBleSighting = (student) => {
        const nameTag = `SDE-${student.name.trim().replace(/\s+/g, '')}`.toLowerCase();
        const rollTag = `SDE-${student.rollNum}`.toLowerCase();

        return Object.keys(bleSightings).some(key => {
            const sightingKey = key.toLowerCase();
            return sightingKey === nameTag || sightingKey === rollTag;
        });
    };

    // Manual Attendance checkbox overrides
    const handleCheckboxChange = (studentId, checked) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentId]: {
                status: checked ? 'Present' : 'Absent',
                manual: true // Protect from auto-override
            }
        }));
    };

    const handleResetManualOverride = (studentId) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                manual: false
            }
        }));
    };

    // Submit Attendance to Backend
    const handleSaveAttendance = async () => {
        if (!selectedClass || !selectedSubject) {
            setPopupMessage("Please select Class and Subject.");
            setShowPopup(true);
            return;
        }

        setSubmitting(true);
        const payload = {
            attendanceRecords: Object.keys(attendanceState).map(id => ({
                studentId: id,
                status: attendanceState[id].status
            })),
            subName: selectedSubject,
            date: date
        };

        try {
            // Attempt Bulk update first
            await axios.put(`${process.env.REACT_APP_BASE_URL}/StudentsAttendanceBulk`, payload);
            setPopupMessage("Attendance recorded successfully!");
            setShowPopup(true);
        } catch (err) {
            // Fallback: If bulk route isn't available, update individual records in parallel
            try {
                const promises = payload.attendanceRecords.map(rec => 
                    axios.put(`${process.env.REACT_APP_BASE_URL}/StudentAttendance/${rec.studentId}`, {
                        subName: selectedSubject,
                        status: rec.status,
                        date: date
                    })
                );
                await Promise.all(promises);
                setPopupMessage("Attendance saved (Individual Fallback)!");
                setShowPopup(true);
            } catch (fallbackErr) {
                setPopupMessage("Failed to save attendance.");
                setShowPopup(true);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CellTowerIcon color="primary" /> BLE Attendance Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Real-time attendance tracking via ESP32 BLE beacons starting with <b>SDE-*</b>.
                </Typography>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Class</InputLabel>
                            <Select value={selectedClass} label="Select Class" onChange={handleClassChange}>
                                {sclassesList?.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small" disabled={!selectedClass}>
                            <InputLabel>Select Subject</InputLabel>
                            <Select value={selectedSubject} label="Select Subject" onChange={(e) => setSelectedSubject(e.target.value)}>
                                {subjectsList?.map((s) => (
                                    <MenuItem key={s._id} value={s._id}>{s.subName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Attendance Date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Connection and Control Panel */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                BLE Scanner Engine Status
                            </Typography>
                            {scannerActive ? (
                                <Alert severity={scannerStatus.ok ? "success" : "error"} sx={{ mb: 2 }}>
                                    {scannerStatus.ok ? (
                                        `Connected to Scan Server · ${Object.keys(bleSightings).length} beacons detected`
                                    ) : (
                                        scannerStatus.error
                                    )}
                                </Alert>
                            ) : (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Scanner interface is idle. Click "Start BLE Scan" to begin.
                                </Alert>
                            )}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<PlayArrowIcon />}
                                    disabled={scannerActive}
                                    onClick={() => setScannerActive(true)}
                                >
                                    Start BLE Scan
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<StopIcon />}
                                    disabled={!scannerActive}
                                    onClick={() => setScannerActive(false)}
                                >
                                    Stop Scan
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                Scan Settings
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoMode}
                                        onChange={(e) => setAutoMode(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Auto Attendance (Tick rows automatically when beacon is seen)"
                            />
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                Match pattern: <code>SDE-&#123;StudentName&#125;</code> or <code>SDE-&#123;RollNumber&#125;</code> (e.g. SDE-Niranjan or SDE-101)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Students Table */}
            {selectedClass && (
                <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                    {loadingStudents ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : students.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No students registered in this class.</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell><b>Roll No</b></TableCell>
                                            <TableCell><b>Student Name</b></TableCell>
                                            <TableCell><b>BLE Identifier</b></TableCell>
                                            <TableCell><b>BLE Sighting</b></TableCell>
                                            <TableCell align="center"><b>Attendance Status</b></TableCell>
                                            <TableCell align="center"><b>Manual Lock</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student) => {
                                            const isDetected = checkBleSighting(student);
                                            const currentRecord = attendanceState[student._id] || { status: 'Absent', manual: false };
                                            
                                            return (
                                                <TableRow key={student._id} hover>
                                                    <TableCell>{student.rollNum}</TableCell>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>
                                                        <code>SDE-{student.name.trim().replace(/\s+/g, '')}</code>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isDetected ? (
                                                            <Chip size="small" label="IN RANGE" color="success" sx={{ fontWeight: 'bold' }} />
                                                        ) : (
                                                            <Chip size="small" label="OUT OF RANGE" variant="outlined" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={currentRecord.status === 'Present'}
                                                                    onChange={(e) => handleCheckboxChange(student._id, e.target.checked)}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={currentRecord.status}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {currentRecord.manual ? (
                                                            <Chip 
                                                                size="small" 
                                                                label="MANUAL LOCK" 
                                                                color="warning" 
                                                                onDelete={() => handleResetManualOverride(student._id)}
                                                            />
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">Auto</Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={submitting || !selectedSubject}
                                    onClick={handleSaveAttendance}
                                    size="large"
                                >
                                    Submit Attendance
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            )}

            <Popup message={popupMessage} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default BLEAttendancePage;
