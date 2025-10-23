import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { getAssignments, createAssignment, reviewAssignment } from '../../redux/assignmentRelated/assignmentHandle';
import { Button, CircularProgress, Typography, Card, CardContent, Stack, Grid, TextField } from '@mui/material';

const TeacherAssignments = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { assignments, loading, response } = useSelector(state => state.assignment);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '' });

    const subjectId = currentUser?.teachSubject?._id;
    const classId = currentUser?.teachSclass?._id;
    const schoolId = currentUser?.school?._id;
    const teacherId = currentUser?._id;

    useEffect(() => {
        if (subjectId) dispatch(getAssignments('subject', subjectId));
    }, [dispatch, subjectId]);

    const byAssignmentId = useMemo(() => {
        const map = new Map();
        assignments.forEach(a => map.set(a._id, a));
        return map;
    }, [assignments]);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!form.title || !form.dueDate) return;
        dispatch(createAssignment({
            title: form.title,
            description: form.description,
            dueDate: form.dueDate,
            subject: subjectId,
            sclassName: classId,
            school: schoolId,
            teacher: teacherId,
        }));
    };

    const handleReview = async (assignmentId, student) => {
        const marks = Number(prompt('Enter marks'));
        if (!Number.isFinite(marks)) return;
        const studentId = typeof student === 'object' ? (student?._id || '') : student;
        await dispatch(reviewAssignment(assignmentId, studentId, marks));
        if (subjectId) dispatch(getAssignments('subject', subjectId));
    };

    if (loading) return <CircularProgress />;
    if (response) return <Typography>{response}</Typography>;

    return (
        <Stack spacing={3}>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Create Assignment</Typography>
                    <Grid container spacing={2} component="form" onSubmit={handleCreate}>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
                        <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></Grid>
                        <Grid item xs={12}><Button type="submit" variant="contained">Create</Button></Grid>
                    </Grid>
                </CardContent>
            </Card>

            {assignments.map(a => (
                <Card key={a._id}>
                    <CardContent>
                        <Typography variant="h6">{a.title}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{a.description}</Typography>
                        <Typography variant="caption">Class: {a.sclassName?.sclassName} | Subject: {a.subject?.subName} | Due: {new Date(a.dueDate).toLocaleDateString()}</Typography>
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            {(byAssignmentId.get(a._id)?.studentStatus || []).map(ss => (
                                <Grid key={(ss.student && ss.student._id) || ss.student} container alignItems="center">
                                    <Grid item xs={4}><Typography variant="body2">Student: {ss.student?.name || ss.student}</Typography></Grid>
                                    <Grid item xs={4}><Typography variant="body2">Status: {ss.status}</Typography></Grid>
                                    <Grid item xs={2}><Typography variant="body2">Marks: {ss.marks ?? '-'}</Typography></Grid>
                                    <Grid item xs={2}><Button size="small" onClick={() => handleReview(a._id, ss.student)}>Review</Button></Grid>
                                </Grid>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};

export default TeacherAssignments;


