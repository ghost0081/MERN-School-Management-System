import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getParents } from '../../../redux/parentRelated/parentHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import TableTemplate from '../../../components/TableTemplate';
import { Paper, Box, Typography, Chip, Button } from '@mui/material';
import axios from 'axios';

const ShowParents = () => {
    const dispatch = useDispatch();
    const { parentsList, loading, status, error } = useSelector((state) => state.parent);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser) {
            console.log('Current user:', currentUser);
            console.log('Fetching parents for school:', currentUser._id);
            console.log('API URL:', `${process.env.REACT_APP_BASE_URL}/Parents/${currentUser._id}`);
            dispatch(getParents(currentUser._id));
        } else {
            console.log('No current user found');
        }
    }, [dispatch, currentUser]);

    const testAPI = async () => {
        try {
            console.log('Testing API directly...');
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parents/${currentUser._id}`);
            console.log('Direct API response:', response.data);
        } catch (error) {
            console.error('Direct API error:', error);
        }
    };

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
                <Box sx={{ padding: 2, textAlign: 'center' }}>
                    <Button variant="contained" onClick={testAPI} sx={{ marginBottom: 2 }}>
                        Test API Directly
                    </Button>
                </Box>
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
