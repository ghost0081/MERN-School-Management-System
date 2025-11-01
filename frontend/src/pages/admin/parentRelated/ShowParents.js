import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getParents } from '../../../redux/parentRelated/parentHandle';
import TableTemplate from '../../../components/TableTemplate';
import { Paper, Box, Typography } from '@mui/material';

const ShowParents = () => {
    const dispatch = useDispatch();
    const { parentsList, loading } = useSelector((state) => state.parent);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser) {
            dispatch(getParents(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const columns = [
        { id: 'name', label: 'Parent Name', minWidth: 150 },
        { id: 'studentName', label: 'Student Name', minWidth: 150 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 120 },
        { id: 'mobile', label: 'Mobile Number', minWidth: 150 },
        { id: 'className', label: 'Class', minWidth: 100 },
    ];

    const rows = parentsList.map((parent) => ({
        name: parent.name,
        studentName: parent.student?.name || 'N/A',
        rollNum: parent.student?.rollNum || 'N/A',
        mobile: parent.mobile,
        className: parent.student?.sclassName?.sclassName || 'N/A',
    }));

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography variant="h4" sx={{ padding: 2, textAlign: 'center', fontWeight: 'bold' }}>
                    Parents List
                </Typography>
                {parentsList.length === 0 && !loading ? (
                    <Typography variant="h6" sx={{ padding: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No parents found. Add students with parent details to see them here.
                    </Typography>
                ) : (
                    <TableTemplate
                        columns={columns}
                        rows={rows}
                        loading={loading}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default ShowParents;
