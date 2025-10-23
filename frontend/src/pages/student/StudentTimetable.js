import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getClassTimetable } from '../../redux/timetableRelated/timetableHandle';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const StudentTimetable = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { items } = useSelector(state => state.timetable);

    const classId = currentUser?.sclassName?._id;

    useEffect(() => {
        if (classId) dispatch(getClassTimetable(classId));
    }, [dispatch, classId]);

    return (
        <Stack spacing={2}>
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

export default StudentTimetable;



