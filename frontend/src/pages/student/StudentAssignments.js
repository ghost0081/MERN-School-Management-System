import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAssignments } from '../../redux/assignmentRelated/assignmentHandle';
import { CircularProgress, Typography, Card, CardContent, Stack } from '@mui/material';

const StudentAssignments = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { assignments, loading, response } = useSelector(state => state.assignment);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAssignments('student', currentUser._id));
        }
    }, [dispatch, currentUser]);

    const getMyRecord = (a) => {
        const me = (a.studentStatus || []).find(ss => (ss.student && ss.student._id ? ss.student._id : ss.student) === currentUser._id);
        return me || {};
    };

    if (loading) return <CircularProgress />;
    if (response) return <Typography>{response}</Typography>;

    return (
        <Stack spacing={2}>
            {assignments.map(a => (
                <Card key={a._id}>
                    <CardContent>
                        <Typography variant="h6">{a.title}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{a.description}</Typography>
                        <Typography variant="caption">Subject: {a.subject?.subName} | Due: {new Date(a.dueDate).toLocaleDateString()}</Typography>
                        <br />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Status: {getMyRecord(a).status || 'Pending'} | Marks: {getMyRecord(a).marks ?? '-'}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};

export default StudentAssignments;


