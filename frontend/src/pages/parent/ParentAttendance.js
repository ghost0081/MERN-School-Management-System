import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { Typography, Stack, Card, CardContent } from '@mui/material';

const ParentAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser, userDetails } = useSelector(state => state.user);

    useEffect(() => {
        // fetch child details for parent to read attendance
        if (currentUser?.student) dispatch(getUserDetails(currentUser.student, 'Student'));
    }, [dispatch, currentUser]);

    const attendance = (userDetails?.attendance) || [];

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Attendance</Typography>
            {attendance.map((a, idx) => (
                <Card key={idx}><CardContent>
                    <Typography>{new Date(a.date).toLocaleDateString()} - {a.status}</Typography>
                </CardContent></Card>
            ))}
            {!attendance.length && <Typography>No attendance records</Typography>}
        </Stack>
    );
};

export default ParentAttendance;






