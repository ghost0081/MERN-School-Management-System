import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAssignments } from '../../redux/assignmentRelated/assignmentHandle';
import { Card, CardContent, Stack, Typography } from '@mui/material';

const ParentAssignments = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { assignments } = useSelector(state => state.assignment);

    useEffect(() => {
        if (currentUser?.student) dispatch(getAssignments('student', currentUser.student));
    }, [dispatch, currentUser]);

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Assignments</Typography>
            {assignments.map(a => {
                const rec = (a.studentStatus || []).find(ss => (ss.student && ss.student._id ? ss.student._id : ss.student) === currentUser.student) || {};
                return (
                    <Card key={a._id}><CardContent>
                        <Typography variant="subtitle1">{a.title}</Typography>
                        <Typography variant="body2">Subject: {a.subject?.subName} | Due: {new Date(a.dueDate).toLocaleDateString()}</Typography>
                        <Typography sx={{ mt: 1 }}>Status: {rec.status || 'Pending'} | Marks: {rec.marks ?? '-'}</Typography>
                    </CardContent></Card>
                );
            })}
            {!assignments.length && <Typography>No assignments</Typography>}
        </Stack>
    );
};

export default ParentAssignments;






