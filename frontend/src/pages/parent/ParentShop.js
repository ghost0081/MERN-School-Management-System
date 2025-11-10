import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStationery, createInvoice } from '../../redux/stationeryRelated/stationeryHandle';
import { underControl } from '../../redux/stationeryRelated/stationerySlice';
import Popup from '../../components/Popup';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
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
    Badge,
    Divider,
    CircularProgress,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';

const ParentShop = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { stationeryList, loading, status, response, error } = useSelector(state => state.stationery);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
    });

    // Get parent name from currentUser if available
    useEffect(() => {
        if (currentUser?.name) {
            setCheckoutForm(prev => ({
                ...prev,
                customerName: currentUser.name,
            }));
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser?.school) {
            dispatch(getStationery(currentUser.school));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === 'added') {
            setMessage('Order placed successfully! Invoice created.');
            setShowPopup(true);
            dispatch(underControl());
            setCart([]);
            setShowCart(false);
            setShowCheckoutDialog(false);
            // Refresh stationery list to show updated quantities
            if (currentUser?.school) {
                setTimeout(() => {
                    dispatch(getStationery(currentUser.school));
                }, 1000);
            }
        } else if (status === 'failed') {
            const errorMsg = typeof response === 'string' ? response : (response?.message || 'Failed to place order');
            setMessage(errorMsg);
            setShowPopup(true);
            dispatch(underControl());
        } else if (status === 'error') {
            let errorMsg = 'Network error occurred';
            if (error) {
                if (typeof error === 'string') {
                    errorMsg = error;
                } else if (error.message) {
                    errorMsg = error.message;
                } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                } else if (error.response?.data) {
                    errorMsg = typeof error.response.data === 'string' ? error.response.data : 'Network error occurred';
                }
            }
            setMessage(errorMsg);
            setShowPopup(true);
            dispatch(underControl());
        }
    }, [status, response, error, dispatch, currentUser]);

    // Filter products - only show available products (quantity > 0)
    const availableProducts = (stationeryList || []).filter(product => {
        return product.quantity > 0;
    });

    // Check if product can be added to cart
    const canAddToCart = (product, quantityToAdd = 1) => {
        if (!product || product.quantity === 0) return false;
        
        // Check if product is already in cart
        const cartItem = cart.find(item => item.stationery === product._id);
        const currentCartQuantity = cartItem ? cartItem.quantity : 0;
        const newTotalQuantity = currentCartQuantity + quantityToAdd;

        // Don't allow adding if quantity would go below reorder level
        // Minimum quantity to maintain = reorderLevel
        const availableForSale = product.quantity - (product.reorderLevel || 0);
        
        return newTotalQuantity <= availableForSale && availableForSale > 0;
    };

    // Get available quantity for display (hide if at or below reorder level)
    const getDisplayQuantity = (product) => {
        const reorderLevel = product.reorderLevel || 0;
        const availableForSale = product.quantity - reorderLevel;
        
        // Hide quantity if product is at minimum (reorder level) or below
        if (product.quantity <= reorderLevel) {
            return null; // Don't show quantity
        }
        
        return availableForSale > 0 ? `${availableForSale}` : null;
    };

    const handleAddToCart = (product) => {
        if (!canAddToCart(product, 1)) {
            const reorderLevel = product.reorderLevel || 0;
            if (product.quantity <= reorderLevel) {
                setMessage('This product has reached minimum stock level and cannot be added to cart.');
            } else {
                setMessage('Cannot add more of this product. Maximum available quantity has been reached.');
            }
            setShowPopup(true);
            return;
        }

        const existingItem = cart.find(item => item.stationery === product._id);
        if (existingItem) {
            // Update quantity if already in cart
            if (canAddToCart(product, 1)) {
                setCart(cart.map(item =>
                    item.stationery === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                setMessage('Cannot add more. Maximum available quantity reached.');
                setShowPopup(true);
            }
        } else {
            // Add new item to cart
            setCart([...cart, {
                stationery: product._id,
                productName: product.name,
                quantity: 1,
                unitPrice: product.pricePerUnit,
                total: product.pricePerUnit,
                unit: product.unit,
            }]);
        }
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.stationery !== productId));
    };

    const handleUpdateCartQuantity = (productId, change) => {
        const cartItem = cart.find(item => item.stationery === productId);
        if (!cartItem) return;

        const product = stationeryList.find(p => p._id === productId);
        if (!product) return;

        const newQuantity = cartItem.quantity + change;

        if (newQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }

        if (!canAddToCart(product, change)) {
            setMessage('Cannot update quantity. Maximum available quantity reached.');
            setShowPopup(true);
            return;
        }

        setCart(cart.map(item =>
            item.stationery === productId
                ? {
                    ...item,
                    quantity: newQuantity,
                    total: newQuantity * item.unitPrice,
                }
                : item
        ));
    };

    const calculateCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.total || 0), 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            setMessage('Cart is empty');
            setShowPopup(true);
            return;
        }

        if (!checkoutForm.customerName) {
            setMessage('Customer name is required');
            setShowPopup(true);
            return;
        }

        setShowCheckoutDialog(true);
    };

    const handlePlaceOrder = () => {
        if (!checkoutForm.customerName) {
            setMessage('Customer name is required');
            setShowPopup(true);
            return;
        }

        const schoolId = currentUser?.school;
        if (!schoolId) {
            setMessage('School information not found');
            setShowPopup(true);
            return;
        }

        const fields = {
            items: cart.map(item => ({
                stationery: item.stationery,
                quantity: item.quantity,
            })),
            customerName: checkoutForm.customerName,
            customerEmail: checkoutForm.customerEmail || undefined,
            customerPhone: checkoutForm.customerPhone || undefined,
            tax: 0,
            discount: 0,
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            schoolId: schoolId,
            remarks: 'Order placed by parent',
        };

        dispatch(createInvoice(fields));
    };

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Stationery Shop
                </Typography>
                <Badge badgeContent={cartItemCount} color="error">
                    <Button
                        variant="outlined"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => setShowCart(true)}
                        disabled={cart.length === 0}
                    >
                        Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </Button>
                </Badge>
            </Box>

            {/* Products Grid */}
            {loading && availableProducts.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            ) : availableProducts.length > 0 ? (
                <Grid container spacing={3}>
                    {availableProducts.map((product) => {
                        const displayQuantity = getDisplayQuantity(product);
                        const isAtMinimum = product.quantity <= (product.reorderLevel || 0);
                        const canAdd = canAddToCart(product, 1);
                        const cartItem = cart.find(item => item.stationery === product._id);
                        const cartQuantity = cartItem ? cartItem.quantity : 0;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={product._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" component="h2" gutterBottom>
                                            {product.name}
                                        </Typography>
                                        {product.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {product.description}
                                            </Typography>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Category: {product.category}
                                            </Typography>
                                        </Box>
                                        {displayQuantity !== null && (
                                            <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                                                Available: {displayQuantity} {product.unit}
                                            </Typography>
                                        )}
                                        {isAtMinimum && (
                                            <Chip
                                                label="Limited Stock"
                                                color="warning"
                                                size="small"
                                                sx={{ mb: 1 }}
                                            />
                                        )}
                                        <Typography variant="h5" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>
                                            ₹{product.pricePerUnit?.toLocaleString()}/{product.unit}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        {cartItem ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleUpdateCartQuantity(product._id, -1)}
                                                    disabled={cartItem.quantity <= 1}
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                                <Typography variant="body1" sx={{ minWidth: '40px', textAlign: 'center' }}>
                                                    {cartItem.quantity}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleUpdateCartQuantity(product._id, 1)}
                                                    disabled={!canAddToCart(product, 1)}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveFromCart(product._id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                startIcon={<AddShoppingCartIcon />}
                                                onClick={() => handleAddToCart(product)}
                                                disabled={!canAdd}
                                                fullWidth
                                            >
                                                Add to Cart
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No products available at the moment.
                    </Typography>
                </Paper>
            )}

            {/* Cart Dialog */}
            <Dialog open={showCart} onClose={() => setShowCart(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </DialogTitle>
                <DialogContent>
                    {cart.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            Your cart is empty
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell>Product</StyledTableCell>
                                        <StyledTableCell align="center">Quantity</StyledTableCell>
                                        <StyledTableCell align="right">Unit Price</StyledTableCell>
                                        <StyledTableCell align="right">Total</StyledTableCell>
                                        <StyledTableCell align="center">Action</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {cart.map((item) => {
                                        const product = stationeryList.find(p => p._id === item.stationery);
                                        return (
                                            <StyledTableRow key={item.stationery}>
                                                <TableCell>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.unit}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUpdateCartQuantity(item.stationery, -1)}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography variant="body1">
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUpdateCartQuantity(item.stationery, 1)}
                                                            disabled={product ? !canAddToCart(product, 1) : true}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">₹{item.unitPrice?.toLocaleString()}</TableCell>
                                                <TableCell align="right">₹{item.total?.toLocaleString()}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveFromCart(item.stationery)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </StyledTableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {cart.length > 0 && (
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Paper sx={{ p: 2, minWidth: 250 }}>
                                <Typography variant="h6" align="right">
                                    Total: ₹{calculateCartTotal().toLocaleString()}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCart(false)}>Close</Button>
                    {cart.length > 0 && (
                        <Button
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={handleCheckout}
                        >
                            Checkout
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Checkout Dialog */}
            <Dialog open={showCheckoutDialog} onClose={() => setShowCheckoutDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Checkout</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Customer Name *"
                                value={checkoutForm.customerName}
                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, customerName: e.target.value }))}
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={checkoutForm.customerPhone}
                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={checkoutForm.customerEmail}
                                onChange={(e) => setCheckoutForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Order Summary
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                Total: ₹{calculateCartTotal().toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCheckoutDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handlePlaceOrder}
                        disabled={loading || !checkoutForm.customerName}
                        startIcon={<PaymentIcon />}
                    >
                        {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ParentShop;

