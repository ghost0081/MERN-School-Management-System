import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Pagination,
    Chip,
    Alert,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import {
    searchBooks,
    fetchCopies,
    createCopy,
} from '../../../redux/libraryRelated/libraryHandle';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

const LibraryBooks = () => {
    const dispatch = useDispatch();
    const { loading, books, searchResults, copies, error, response } = useSelector(
        (state) => state.library
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showCopyDialog, setShowCopyDialog] = useState(false);
    const [showCopiesDialog, setShowCopiesDialog] = useState(false);
    const [copyForm, setCopyForm] = useState({ copyCode: '', shelf: '', status: 'available' });
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim() || currentPage > 1) {
                dispatch(searchBooks(searchQuery, currentPage, 20));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, currentPage, dispatch]);

    useEffect(() => {
        if (response) {
            setMessage(response);
            setShowPopup(true);
        } else if (error) {
            setMessage(error);
            setShowPopup(true);
        }
    }, [response, error]);

    const handleSearch = () => {
        setCurrentPage(1);
        dispatch(searchBooks(searchQuery, 1, 20));
    };

    const handleRegisterCopy = (book) => {
        setSelectedBook(book);
        setCopyForm({ copyCode: '', shelf: '', status: 'available' });
        setShowCopyDialog(true);
    };

    const handleViewCopies = async (book) => {
        setSelectedBook(book);
        setShowCopiesDialog(true);
        dispatch(fetchCopies(book._id));
    };

    const handleCreateCopy = () => {
        if (!selectedBook) return;
        
        const payload = {
            bookId: selectedBook._id,
            copyCode: copyForm.copyCode || undefined,
            shelf: copyForm.shelf || undefined,
            status: copyForm.status,
        };

        dispatch(createCopy(payload));
        setShowCopyDialog(false);
        setCopyForm({ copyCode: '', shelf: '', status: 'available' });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const totalPages = Math.ceil((searchResults?.total || 0) / 20);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Library Books
                    </Typography>

                    <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            placeholder="Search by book code or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={loading}
                            startIcon={<SearchIcon />}
                        >
                            Search
                        </Button>
                    </Box>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {!loading && books && books.length > 0 && (
                        <>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Book Code</StyledTableCell>
                                            <StyledTableCell>Book Name</StyledTableCell>
                                            <StyledTableCell>Rate</StyledTableCell>
                                            <StyledTableCell align="center">Actions</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {books.map((book) => (
                                            <StyledTableRow key={book._id}>
                                                <TableCell>{book.code}</TableCell>
                                                <TableCell>{book.name}</TableCell>
                                                <TableCell>
                                                    {book.rate !== null && book.rate !== undefined
                                                        ? `₹${book.rate}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleViewCopies(book)}
                                                        title="View Copies"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => handleRegisterCopy(book)}
                                                        title="Register Copy"
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </StyledTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                    />
                                </Box>
                            )}

                            {searchResults?.total !== undefined && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Total: {searchResults.total} books
                                </Typography>
                            )}
                        </>
                    )}

                    {!loading && (!books || books.length === 0) && searchQuery && (
                        <Alert severity="info">No books found matching your search.</Alert>
                    )}

                    {!loading && (!books || books.length === 0) && !searchQuery && (
                        <Alert severity="info">
                            Enter a search query to find books.
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Register Copy Dialog */}
            <Dialog open={showCopyDialog} onClose={() => setShowCopyDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Register Copy for: {selectedBook?.name}
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowCopyDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Copy Code (Optional)"
                            value={copyForm.copyCode}
                            onChange={(e) =>
                                setCopyForm({ ...copyForm, copyCode: e.target.value })
                            }
                            helperText="Leave empty to auto-generate"
                            fullWidth
                        />
                        <TextField
                            label="Shelf (Optional)"
                            value={copyForm.shelf}
                            onChange={(e) =>
                                setCopyForm({ ...copyForm, shelf: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            select
                            label="Status"
                            value={copyForm.status}
                            onChange={(e) =>
                                setCopyForm({ ...copyForm, status: e.target.value })
                            }
                            fullWidth
                            SelectProps={{ native: true }}
                        >
                            <option value="available">Available</option>
                            <option value="issued">Issued</option>
                            <option value="lost">Lost</option>
                            <option value="damaged">Damaged</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCopyDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateCopy} variant="contained" color="primary">
                        Register
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Copies Dialog */}
            <Dialog
                open={showCopiesDialog}
                onClose={() => setShowCopiesDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Copies for: {selectedBook?.name}
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowCopiesDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : copies && copies.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Copy Code</StyledTableCell>
                                        <StyledTableCell>Shelf</StyledTableCell>
                                        <StyledTableCell>Status</StyledTableCell>
                                        <StyledTableCell>Acquired On</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {copies.map((copy) => (
                                        <TableRow key={copy._id}>
                                            <TableCell>{copy.copyCode}</TableCell>
                                            <TableCell>{copy.shelf || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={copy.status}
                                                    color={
                                                        copy.status === 'available'
                                                            ? 'success'
                                                            : copy.status === 'issued'
                                                            ? 'info'
                                                            : 'error'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(copy.acquiredOn).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">No copies registered for this book.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCopiesDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Popup
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                popupType="error"
                message={message}
            />
        </Container>
    );
};

export default LibraryBooks;

