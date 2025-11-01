import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { getClassTimetable, upsertClassDay } from '../../../redux/timetableRelated/timetableHandle';
import { Card, CardContent, Typography, Grid, TextField, MenuItem, Button, Stack, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const AdminTimetable = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const classId = params.id;
    const { currentUser } = useSelector(state => state.user);
    const { subjectsList } = useSelector(state => state.sclass);
    const { teachersList } = useSelector(state => state.teacher);
    const { items } = useSelector(state => state.timetable);

    const [form, setForm] = useState({ day: 'Monday', start: '', end: '', subject: '', teacher: '' });

    useEffect(() => {
        if (classId) dispatch(getSubjectList(classId, 'ClassSubjects'));
        if (currentUser?._id) dispatch(getAllTeachers(currentUser._id));
        if (classId) dispatch(getClassTimetable(classId));
    }, [dispatch, classId, currentUser]);

    const submit = (e) => {
        e.preventDefault();
        if (!form.subject || !form.teacher || !form.start || !form.end) return;
        // merge with existing periods for selected day
        const existing = items.find(t => t.day === form.day);
        const periods = existing ? [...existing.periods] : [];
        periods.push({ start: form.start, end: form.end, subject: form.subject, teacher: form.teacher });
        dispatch(upsertClassDay({ sclassName: classId, school: currentUser._id, day: form.day, periods }))
            .then(() => dispatch(getClassTimetable(classId)));
    };

    return (
        <Stack spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Add Period</Typography>
                    <Grid container spacing={2} component="form" onSubmit={submit}>
                        <Grid item xs={12} md={2}>
                            <TextField select fullWidth label="Day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                                {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}><TextField fullWidth label="Start" placeholder="09:00" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} /></Grid>
                        <Grid item xs={12} md={2}><TextField fullWidth label="End" placeholder="09:45" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} /></Grid>
                        <Grid item xs={12} md={3}>
                            <TextField select fullWidth label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                {(subjectsList || []).map(s => <MenuItem key={s._id} value={s._id}>{s.subName}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField select fullWidth label="Teacher" value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}>
                                {(teachersList || []).map(t => <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}><Button type="submit" variant="contained">Add</Button></Grid>
                    </Grid>
                </CardContent>
            </Card>

            {days.map(d => {
                const dayData = items.find(i => i.day === d);
                return (
                    <Card key={d}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>{d}</Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                {(dayData?.periods || []).map((p, idx) => (
                                    <Chip key={idx} label={`${p.start}-${p.end} • ${(p.subject && p.subject.subName) || ''} • ${(p.teacher && p.teacher.name) || ''}`} />
                                ))}
                                {!(dayData?.periods || []).length && <Typography variant="body2">No periods</Typography>}
                            </Stack>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
};

export default AdminTimetable;






