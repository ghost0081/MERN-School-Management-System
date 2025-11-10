import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getTeacherTimetable } from '../../redux/timetableRelated/timetableHandle';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const TeacherTimetable = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { items } = useSelector(state => state.timetable);

    useEffect(() => {
        if (currentUser?._id) dispatch(getTeacherTimetable(currentUser._id));
    }, [dispatch, currentUser]);

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
                                    <Chip key={idx} label={`${p.start}-${p.end} • ${(p.subject && p.subject.subName) || ''} • Class ${(dayData?.sclassName && dayData.sclassName.sclassName) || ''}`} />
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

export default TeacherTimetable;








