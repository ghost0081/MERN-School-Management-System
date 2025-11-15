import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import {
    previewImport,
    importBooks,
} from '../../../redux/libraryRelated/libraryHandle';
import {
    clearImportPreview,
    clearImportResult,
} from '../../../redux/libraryRelated/librarySlice';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PreviewIcon from '@mui/icons-material/Preview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AdminUploadBooks = () => {
    const dispatch = useDispatch();
    const { loading, importPreview, importResult, error, response } = useSelector(
        (state) => state.library
    );
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Clear previous results on mount
        dispatch(clearImportPreview());
        dispatch(clearImportResult());
    }, [dispatch]);

    useEffect(() => {
        if (response) {
            setMessage(response);
            setShowPopup(true);
        } else if (error) {
            setMessage(error);
            setShowPopup(true);
        }
    }, [response, error]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validExtensions = ['.xlsx', '.xls', '.csv'];
            const fileExtension = file.name
                .substring(file.name.lastIndexOf('.'))
                .toLowerCase();
            
            if (!validExtensions.includes(fileExtension)) {
                setMessage('Invalid file type. Please upload .xlsx, .xls, or .csv file.');
                setShowPopup(true);
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                setMessage('File size exceeds 10MB limit.');
                setShowPopup(true);
                return;
            }
            
            setSelectedFile(file);
            dispatch(clearImportPreview());
            dispatch(clearImportResult());
        }
    };

    const handlePreview = () => {
        if (!selectedFile) {
            setMessage('Please select a file first.');
            setShowPopup(true);
            return;
        }
        dispatch(previewImport(selectedFile));
    };

    const handleImport = () => {
        if (!selectedFile) {
            setMessage('Please select a file first.');
            setShowPopup(true);
            return;
        }
        dispatch(importBooks(selectedFile));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Import Books from Excel/CSV
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Upload a file with columns: BookCode (or Code), BookName (or Name/Title), and Rate (or Price).
                        Rate is optional.
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <input
                            accept=".xlsx,.xls,.csv"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<UploadFileIcon />}
                                sx={{ mr: 2 }}
                            >
                                Select File
                            </Button>
                        </label>
                        {selectedFile && (
                            <Chip
                                label={selectedFile.name}
                                onDelete={() => {
                                    setSelectedFile(null);
                                    dispatch(clearImportPreview());
                                    dispatch(clearImportResult());
                                }}
                                sx={{ mr: 2 }}
                            />
                        )}
                        <Button
                            variant="outlined"
                            onClick={handlePreview}
                            disabled={!selectedFile || loading}
                            startIcon={<PreviewIcon />}
                            sx={{ mr: 2 }}
                        >
                            Preview
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={!selectedFile || loading || !importPreview}
                            startIcon={<CheckCircleIcon />}
                            color="primary"
                        >
                            Import
                        </Button>
                    </Box>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {importPreview && (
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Preview: Showing first 10 rows of {importPreview.totalRows} total rows.
                                {importPreview.errorsCount > 0 && (
                                    <span> {importPreview.errorsCount} errors found.</span>
                                )}
                            </Alert>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Row</StyledTableCell>
                                            <StyledTableCell>BookCode</StyledTableCell>
                                            <StyledTableCell>BookName</StyledTableCell>
                                            <StyledTableCell>Rate</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {importPreview.preview.map((row, index) => (
                                            <StyledTableRow key={index}>
                                                <TableCell>{row.rowNum}</TableCell>
                                                <TableCell>{row.code}</TableCell>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>
                                                    {row.rate !== null && row.rate !== undefined
                                                        ? `₹${row.rate}`
                                                        : '-'}
                                                </TableCell>
                                            </StyledTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {importPreview.errors && importPreview.errors.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6" color="error" gutterBottom>
                                        Errors:
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <StyledTableCell>Row</StyledTableCell>
                                                    <StyledTableCell>Code</StyledTableCell>
                                                    <StyledTableCell>Error</StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {importPreview.errors.slice(0, 20).map((err, index) => (
                                                    <StyledTableRow key={index}>
                                                        <TableCell>{err.row}</TableCell>
                                                        <TableCell>{err.code || '-'}</TableCell>
                                                        <TableCell>{err.error}</TableCell>
                                                    </StyledTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </Box>
                    )}

                    {importResult && (
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Import completed!
                            </Alert>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Import Summary
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Inserted:</strong> {importResult.inserted} books
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Updated:</strong> {importResult.updated} books
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Skipped:</strong> {importResult.skipped} rows
                                </Typography>
                                {importResult.errorsCount > 0 && (
                                    <Typography variant="body1" color="error">
                                        <strong>Errors:</strong> {importResult.errorsCount} rows
                                    </Typography>
                                )}
                                {importResult.importId && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Import ID: {importResult.importId}
                                    </Typography>
                                )}
                            </Paper>
                            {importResult.errors && importResult.errors.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6" color="error" gutterBottom>
                                        Errors:
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <StyledTableCell>Row</StyledTableCell>
                                                    <StyledTableCell>Code</StyledTableCell>
                                                    <StyledTableCell>Error</StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {importResult.errors.map((err, index) => (
                                                    <StyledTableRow key={index}>
                                                        <TableCell>{err.row}</TableCell>
                                                        <TableCell>{err.code || '-'}</TableCell>
                                                        <TableCell>{err.error}</TableCell>
                                                    </StyledTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Popup
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                popupType="error"
                message={message}
            />
        </Container>
    );
};

export default AdminUploadBooks;

