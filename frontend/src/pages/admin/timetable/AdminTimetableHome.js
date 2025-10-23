import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminTimetableHome = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList } = useSelector(state => state.sclass);

    useEffect(() => {
        if (currentUser?._id) dispatch(getAllSclasses(currentUser._id, 'Sclass'));
    }, [dispatch, currentUser]);

    return (
        <Stack spacing={2}>
            <Typography variant="h6">Choose a class to manage its timetable</Typography>
            {(sclassesList || []).map(c => (
                <Card key={c._id}>
                    <CardContent>
                        <Typography variant="subtitle1">{c.sclassName}</Typography>
                        <Button sx={{ mt: 1 }} variant="contained" onClick={() => navigate(`/Admin/timetable/${c._id}`)}>Manage Timetable</Button>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};

export default AdminTimetableHome;



