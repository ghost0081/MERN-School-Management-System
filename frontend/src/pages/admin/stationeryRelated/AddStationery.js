import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getStationery, addStationery, updateStationery, deleteStationery } from '../../../redux/stationeryRelated/stationeryHandle';
import { underControl } from '../../../redux/stationeryRelated/stationerySlice';
import Popup from '../../../components/Popup';
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
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';

const AddStationery = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { stationeryList, loading, status, response, error } = useSelector(state => state.stationery);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: '',
        unit: 'Piece',
        pricePerUnit: '',
        category: 'Other',
        supplier: '',
        reorderLevel: '',
    });

    const units = ['Piece', 'Box', 'Pack', 'Set', 'Dozen', 'Ream', 'Other'];
    const categories = ['Books', 'Writing Materials', 'Art Supplies', 'Office Supplies', 'Other'];

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getStationery(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Refresh stationery list periodically to show real-time quantities (updated from invoices)
    useEffect(() => {
        if (currentUser?._id) {
            const interval = setInterval(() => {
                dispatch(getStationery(currentUser._id));
            }, 3000); // Refresh every 3 seconds to show real-time quantity changes

            return () => clearInterval(interval);
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === 'added') {
            setMessage('Product saved successfully');
            setShowPopup(true);
            dispatch(underControl());
            setShowForm(false);
            resetForm();
            if (currentUser?._id) {
                dispatch(getStationery(currentUser._id));
            }
        } else if (status === 'failed') {
            setMessage(response || 'Failed to save product');
            setShowPopup(true);
            dispatch(underControl());
        } else if (status === 'error') {
            setMessage(error || 'Network error occurred');
            setShowPopup(true);
            dispatch(underControl());
        }
    }, [status, response, error, dispatch, currentUser]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            quantity: '',
            unit: 'Piece',
            pricePerUnit: '',
            category: 'Other',
            supplier: '',
            reorderLevel: '',
        });
        setEditingProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.pricePerUnit) {
            setMessage('Name and price per unit are required');
            setShowPopup(true);
            return;
        }

        const fields = {
            ...formData,
            quantity: formData.quantity ? Number(formData.quantity) : 0,
            pricePerUnit: Number(formData.pricePerUnit),
            reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : 0,
            schoolId: currentUser._id,
        };

        if (editingProduct) {
            dispatch(updateStationery(editingProduct._id, fields));
        } else {
            dispatch(addStationery(fields));
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            quantity: product.quantity?.toString() || '',
            unit: product.unit || 'Piece',
            pricePerUnit: product.pricePerUnit?.toString() || '',
            category: product.category || 'Other',
            supplier: product.supplier || '',
            reorderLevel: product.reorderLevel?.toString() || '',
        });
        setShowForm(true);
    };

    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            dispatch(deleteStationery(productToDelete._id));
            setShowDeleteDialog(false);
            setProductToDelete(null);
            if (currentUser?._id) {
                dispatch(getStationery(currentUser._id));
            }
        }
    };

    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
    };

    const filteredProducts = stationeryList || [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Stationery Management
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Quantities update automatically when products are sold)
                        </Typography>
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            if (currentUser?._id) {
                                dispatch(getStationery(currentUser._id));
                            }
                        }}
                        disabled={loading}
                        size="small"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddNew}
                        disabled={loading}
                    >
                        Add Product
                    </Button>
                </Box>
            </Box>

            {/* Add/Edit Form Dialog */}
            <Dialog open={showForm} onClose={() => { setShowForm(false); resetForm(); }} maxWidth="md" fullWidth>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        inputProps: { min: 0 }
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Unit"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                >
                                    {units.map((unit) => (
                                        <MenuItem key={unit} value={unit}>
                                            {unit}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Price Per Unit *"
                                    name="pricePerUnit"
                                    type="number"
                                    value={formData.pricePerUnit}
                                    onChange={handleInputChange}
                                    required
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        inputProps: { min: 0, step: 0.01 }
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Supplier"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Reorder Level"
                                    name="reorderLevel"
                                    type="number"
                                    value={formData.reorderLevel}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        inputProps: { min: 0 }
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setShowForm(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {editingProduct ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WarningIcon color="error" />
                        <Typography>
                            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" disabled={loading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Products Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Product Name</StyledTableCell>
                                <StyledTableCell>Category</StyledTableCell>
                                <StyledTableCell>Quantity</StyledTableCell>
                                <StyledTableCell>Unit</StyledTableCell>
                                <StyledTableCell>Price Per Unit</StyledTableCell>
                                <StyledTableCell>Total Value</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {loading && filteredProducts.length === 0 ? (
                                <StyledTableRow>
                                    <TableCell colSpan={8} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </StyledTableRow>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => {
                                    const totalValue = (product.quantity || 0) * (product.pricePerUnit || 0);
                                    const isLowStock = product.quantity <= (product.reorderLevel || 0);
                                    return (
                                        <StyledTableRow key={product._id}>
                                            <TableCell>
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                    {product.name}
                                                </Typography>
                                                {product.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body1" 
                                                    sx={{ 
                                                        fontWeight: 'medium',
                                                        color: product.quantity === 0 ? 'error.main' : 'inherit'
                                                    }}
                                                >
                                                    {product.quantity || 0}
                                                </Typography>
                                                {product.reorderLevel > 0 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Reorder at: {product.reorderLevel}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{product.unit}</TableCell>
                                            <TableCell>₹{product.pricePerUnit?.toLocaleString() || 0}</TableCell>
                                            <TableCell>₹{totalValue.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={product.quantity === 0 ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                                                    color={product.quantity === 0 ? 'error' : isLowStock ? 'warning' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(product)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(product)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            No products found. Click "Add Product" to get started.
                                        </Typography>
                                    </TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddStationery;

