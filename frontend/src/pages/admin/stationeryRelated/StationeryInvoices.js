import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getInvoices, createInvoice, deleteInvoice, getStationery } from '../../../redux/stationeryRelated/stationeryHandle';
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
    Divider,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';

const StationeryInvoices = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { invoiceList, stationeryList, loading, status, response, error } = useSelector(state => state.stationery);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);

    const [invoiceForm, setInvoiceForm] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        tax: '',
        discount: '',
        paymentMethod: 'Cash',
        paymentStatus: 'Paid',
        remarks: '',
        items: [],
    });

    const [currentItem, setCurrentItem] = useState({
        stationery: '',
        quantity: '',
    });

    const paymentMethods = ['Cash', 'Cheque', 'Online', 'Bank Transfer', 'Card', 'Other'];
    const paymentStatuses = ['Paid', 'Pending', 'Partial'];

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getInvoices(currentUser._id));
            dispatch(getStationery(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Refresh stationery list periodically to show real-time quantities
    useEffect(() => {
        if (currentUser?._id) {
            const interval = setInterval(() => {
                dispatch(getStationery(currentUser._id));
            }, 5000); // Refresh every 5 seconds

            return () => clearInterval(interval);
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === 'added') {
            setMessage('Invoice created successfully');
            setShowPopup(true);
            dispatch(underControl());
            setShowInvoiceForm(false);
            resetInvoiceForm();
            if (currentUser?._id) {
                dispatch(getInvoices(currentUser._id));
                dispatch(getStationery(currentUser._id));
            }
        } else if (status === 'failed') {
            setMessage(response || 'Failed to create invoice');
            setShowPopup(true);
            dispatch(underControl());
        } else if (status === 'error') {
            setMessage(error || 'Network error occurred');
            setShowPopup(true);
            dispatch(underControl());
        }
    }, [status, response, error, dispatch, currentUser]);

    const resetInvoiceForm = () => {
        setInvoiceForm({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            tax: '',
            discount: '',
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            remarks: '',
            items: [],
        });
        setCurrentItem({ stationery: '', quantity: '' });
    };

    const handleAddItem = () => {
        if (!currentItem.stationery || !currentItem.quantity) {
            setMessage('Please select a product and enter quantity');
            setShowPopup(true);
            return;
        }

        const product = stationeryList.find(p => p._id === currentItem.stationery);
        if (!product) {
            setMessage('Product not found');
            setShowPopup(true);
            return;
        }

        const requestedQuantity = Number(currentItem.quantity);
        const availableQuantity = product.quantity || 0;

        // Check if requested quantity is available
        if (availableQuantity < requestedQuantity) {
            setMessage(`Insufficient stock. Available: ${availableQuantity} ${product.unit}. Requested: ${requestedQuantity}`);
            setShowPopup(true);
            // Refresh to get latest quantities
            if (currentUser?._id) {
                dispatch(getStationery(currentUser._id));
            }
            return;
        }

        if (availableQuantity === 0) {
            setMessage(`Product is out of stock. Current quantity: ${availableQuantity} ${product.unit}`);
            setShowPopup(true);
            return;
        }

        // Check if item already exists
        const existingIndex = invoiceForm.items.findIndex(
            item => item.stationery === currentItem.stationery
        );

        if (existingIndex >= 0) {
            // Update existing item quantity
            const newItems = [...invoiceForm.items];
            const additionalQuantity = Number(currentItem.quantity);
            const newQuantity = newItems[existingIndex].quantity + additionalQuantity;
            const availableQuantity = product.quantity || 0;

            // Check available stock considering what's already in the invoice
            const totalInInvoice = invoiceForm.items.reduce((sum, item, idx) => {
                if (item.stationery === currentItem.stationery) {
                    return sum + (idx === existingIndex ? 0 : item.quantity);
                }
                return sum;
            }, 0);

            if (availableQuantity < totalInInvoice + additionalQuantity) {
                const availableForNew = availableQuantity - totalInInvoice;
                setMessage(
                    `Insufficient stock. Available: ${availableQuantity} ${product.unit}. ` +
                    `Already in invoice: ${totalInInvoice} ${product.unit}. ` +
                    `Available for new: ${availableForNew} ${product.unit}`
                );
                setShowPopup(true);
                // Refresh to get latest quantities
                if (currentUser?._id) {
                    dispatch(getStationery(currentUser._id));
                }
                return;
            }

            newItems[existingIndex].quantity = newQuantity;
            newItems[existingIndex].total = newQuantity * product.pricePerUnit;
            setInvoiceForm(prev => ({ ...prev, items: newItems }));
        } else {
            // Add new item
            const newItem = {
                stationery: currentItem.stationery,
                productName: product.name,
                quantity: Number(currentItem.quantity),
                unitPrice: product.pricePerUnit,
                total: Number(currentItem.quantity) * product.pricePerUnit,
            };
            setInvoiceForm(prev => ({
                ...prev,
                items: [...prev.items, newItem],
            }));
        }

        setCurrentItem({ stationery: '', quantity: '' });
    };

    const handleRemoveItem = (index) => {
        const newItems = invoiceForm.items.filter((_, i) => i !== index);
        setInvoiceForm(prev => ({ ...prev, items: newItems }));
    };

    const calculateTotal = () => {
        const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const taxAmount = invoiceForm.tax ? Number(invoiceForm.tax) : 0;
        const discountAmount = invoiceForm.discount ? Number(invoiceForm.discount) : 0;
        return {
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            total: subtotal + taxAmount - discountAmount,
        };
    };

    const handleInvoiceSubmit = (e) => {
        e.preventDefault();

        if (!invoiceForm.customerName) {
            setMessage('Customer name is required');
            setShowPopup(true);
            return;
        }

        if (invoiceForm.items.length === 0) {
            setMessage('Please add at least one item');
            setShowPopup(true);
            return;
        }

        const totals = calculateTotal();
        const fields = {
            items: invoiceForm.items.map(item => ({
                stationery: item.stationery,
                quantity: item.quantity,
            })),
            customerName: invoiceForm.customerName,
            customerEmail: invoiceForm.customerEmail || undefined,
            customerPhone: invoiceForm.customerPhone || undefined,
            tax: totals.tax,
            discount: totals.discount,
            paymentMethod: invoiceForm.paymentMethod,
            paymentStatus: invoiceForm.paymentStatus,
            schoolId: currentUser._id,
            remarks: invoiceForm.remarks || undefined,
        };

        dispatch(createInvoice(fields));
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceDetail(true);
    };

    const handleDeleteInvoice = (invoice) => {
        setInvoiceToDelete(invoice);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (invoiceToDelete) {
            dispatch(deleteInvoice(invoiceToDelete._id));
            setShowDeleteDialog(false);
            setInvoiceToDelete(null);
            // Refresh both lists after deletion (restores inventory)
            setTimeout(() => {
                if (currentUser?._id) {
                    dispatch(getInvoices(currentUser._id));
                    dispatch(getStationery(currentUser._id));
                }
            }, 500);
        }
    };

    const totals = calculateTotal();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Stationery Sales & Invoices
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Quantities update in real-time when invoices are created or deleted
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            if (currentUser?._id) {
                                dispatch(getStationery(currentUser._id));
                                dispatch(getInvoices(currentUser._id));
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
                        onClick={() => {
                            // Refresh stationery list before opening form to get latest quantities
                            if (currentUser?._id) {
                                dispatch(getStationery(currentUser._id));
                            }
                            setShowInvoiceForm(true);
                        }}
                        disabled={loading}
                    >
                        Create Invoice
                    </Button>
                </Box>
            </Box>

            {/* Create Invoice Dialog */}
            <Dialog open={showInvoiceForm} onClose={() => { setShowInvoiceForm(false); resetInvoiceForm(); }} maxWidth="md" fullWidth>
                <DialogTitle>Create New Invoice</DialogTitle>
                <form onSubmit={handleInvoiceSubmit}>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Customer Name *"
                                    value={invoiceForm.customerName}
                                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerName: e.target.value }))}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Customer Phone"
                                    value={invoiceForm.customerPhone}
                                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Customer Email"
                                    type="email"
                                    value={invoiceForm.customerEmail}
                                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }}>Add Items</Divider>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Product"
                                    value={currentItem.stationery}
                                    onChange={(e) => setCurrentItem(prev => ({ ...prev, stationery: e.target.value }))}
                                    variant="outlined"
                                    helperText={currentItem.stationery && (() => {
                                        const selected = stationeryList.find(p => p._id === currentItem.stationery);
                                        if (selected) {
                                            const isLowStock = selected.quantity <= (selected.reorderLevel || 0);
                                            return isLowStock 
                                                ? `⚠️ Low stock! Only ${selected.quantity} ${selected.unit} available`
                                                : `${selected.quantity} ${selected.unit} available`;
                                        }
                                        return '';
                                    })()}
                                >
                                    {(stationeryList || []).map((product) => {
                                        const isLowStock = product.quantity <= (product.reorderLevel || 0);
                                        const isOutOfStock = product.quantity === 0;
                                        return (
                                            <MenuItem 
                                                key={product._id} 
                                                value={product._id}
                                                disabled={isOutOfStock}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body1">
                                                        {product.name}
                                                        {isOutOfStock && ' (Out of Stock)'}
                                                        {isLowStock && !isOutOfStock && ' ⚠️ Low Stock'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product.quantity} {product.unit} available - ₹{product.pricePerUnit}/{product.unit}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: e.target.value }))}
                                    InputProps={{
                                        inputProps: { min: 1 }
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddItem}
                                    disabled={!currentItem.stationery || !currentItem.quantity}
                                >
                                    Add Item
                                </Button>
                            </Grid>
                            {invoiceForm.items.length > 0 && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                            Invoice Items
                                        </Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Product</TableCell>
                                                        <TableCell align="right">Qty</TableCell>
                                                        <TableCell align="right">Unit Price</TableCell>
                                                        <TableCell align="right">Total</TableCell>
                                                        <TableCell align="center">Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {invoiceForm.items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.productName}</TableCell>
                                                            <TableCell align="right">{item.quantity}</TableCell>
                                                            <TableCell align="right">₹{item.unitPrice?.toLocaleString()}</TableCell>
                                                            <TableCell align="right">₹{item.total?.toLocaleString()}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveItem(index)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Subtotal"
                                            value={`₹${totals.subtotal.toLocaleString()}`}
                                            InputProps={{ readOnly: true }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Tax"
                                            type="number"
                                            value={invoiceForm.tax}
                                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, tax: e.target.value }))}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                inputProps: { min: 0 }
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Discount"
                                            type="number"
                                            value={invoiceForm.discount}
                                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, discount: e.target.value }))}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                                inputProps: { min: 0 }
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" color="primary">
                                                    Total: ₹{totals.total.toLocaleString()}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Payment Method"
                                    value={invoiceForm.paymentMethod}
                                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                    variant="outlined"
                                >
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Payment Status"
                                    value={invoiceForm.paymentStatus}
                                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                                    variant="outlined"
                                >
                                    {paymentStatuses.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Remarks"
                                    value={invoiceForm.remarks}
                                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, remarks: e.target.value }))}
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setShowInvoiceForm(false); resetInvoiceForm(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading || invoiceForm.items.length === 0}>
                            Create Invoice
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Invoice Detail View Dialog */}
            <Dialog open={showInvoiceDetail} onClose={() => setShowInvoiceDetail(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Invoice #{selectedInvoice?.invoiceNumber}
                    <Button
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                        sx={{ ml: 2 }}
                    >
                        Print
                    </Button>
                </DialogTitle>
                <DialogContent>
                    {selectedInvoice && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                                    <Typography variant="body1">{selectedInvoice.customerName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Date</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                {selectedInvoice.customerEmail && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">Email</Typography>
                                        <Typography variant="body1">{selectedInvoice.customerEmail}</Typography>
                                    </Grid>
                                )}
                                {selectedInvoice.customerPhone && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                                        <Typography variant="body1">{selectedInvoice.customerPhone}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Unit Price</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedInvoice.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">₹{item.unitPrice?.toLocaleString()}</TableCell>
                                                <TableCell align="right">₹{item.total?.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Grid container spacing={2} sx={{ maxWidth: 300 }}>
                                    <Grid item xs={6}><Typography>Subtotal:</Typography></Grid>
                                    <Grid item xs={6}><Typography align="right">₹{selectedInvoice.subtotal?.toLocaleString()}</Typography></Grid>
                                    {selectedInvoice.tax > 0 && (
                                        <>
                                            <Grid item xs={6}><Typography>Tax:</Typography></Grid>
                                            <Grid item xs={6}><Typography align="right">₹{selectedInvoice.tax?.toLocaleString()}</Typography></Grid>
                                        </>
                                    )}
                                    {selectedInvoice.discount > 0 && (
                                        <>
                                            <Grid item xs={6}><Typography>Discount:</Typography></Grid>
                                            <Grid item xs={6}><Typography align="right">-₹{selectedInvoice.discount?.toLocaleString()}</Typography></Grid>
                                        </>
                                    )}
                                    <Grid item xs={6}><Typography variant="h6">Total:</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="h6" align="right">₹{selectedInvoice.totalAmount?.toLocaleString()}</Typography></Grid>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowInvoiceDetail(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this invoice? This will restore the inventory quantities.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" disabled={loading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invoices Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Invoice Number</StyledTableCell>
                                <StyledTableCell>Customer Name</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Items</StyledTableCell>
                                <StyledTableCell align="right">Total Amount</StyledTableCell>
                                <StyledTableCell>Payment Status</StyledTableCell>
                                <StyledTableCell>Payment Method</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {loading && invoiceList.length === 0 ? (
                                <StyledTableRow>
                                    <TableCell colSpan={8} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </StyledTableRow>
                            ) : invoiceList.length > 0 ? (
                                invoiceList.map((invoice) => (
                                    <StyledTableRow key={invoice._id}>
                                        <TableCell>
                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                {invoice.invoiceNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{invoice.customerName}</TableCell>
                                        <TableCell>
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{invoice.items.length} item(s)</TableCell>
                                        <TableCell align="right">₹{invoice.totalAmount?.toLocaleString() || 0}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={invoice.paymentStatus}
                                                color={invoice.paymentStatus === 'Paid' ? 'success' : invoice.paymentStatus === 'Pending' ? 'warning' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{invoice.paymentMethod}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleViewInvoice(invoice)}
                                                size="small"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteInvoice(invoice)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            No invoices found. Create your first invoice to get started.
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

export default StationeryInvoices;

