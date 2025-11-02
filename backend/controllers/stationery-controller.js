const Stationery = require('../models/stationerySchema.js');
const Invoice = require('../models/invoiceSchema.js');

// Get all stationery products for a school
const getStationery = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        const stationery = await Stationery.find({ school: schoolId })
            .sort({ createdAt: -1 });

        res.send(stationery);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get single stationery product
const getStationeryDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Stationery.findById(id);
        
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.send(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Add new stationery product
const addStationery = async (req, res) => {
    try {
        const { name, description, quantity, unit, pricePerUnit, category, supplier, reorderLevel, schoolId } = req.body;

        if (!name || !schoolId || pricePerUnit === undefined) {
            return res.status(400).send({ message: 'Name, school ID, and price per unit are required' });
        }

        // Check if product with same name already exists for this school
        const existing = await Stationery.findOne({ name: name, school: schoolId });
        if (existing) {
            return res.status(400).send({ message: 'Product with this name already exists' });
        }

        const product = new Stationery({
            name,
            description,
            quantity: quantity || 0,
            unit: unit || 'Piece',
            pricePerUnit,
            category: category || 'Other',
            supplier,
            reorderLevel: reorderLevel || 0,
            school: schoolId,
        });

        const result = await product.save();
        res.send(result);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({ message: 'Product with this name already exists' });
        }
        res.status(500).json(error);
    }
};

// Update stationery product
const updateStationery = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove schoolId from update data (shouldn't be changed)
        delete updateData.school;
        delete updateData.schoolId;

        const product = await Stationery.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.send(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Delete stationery product
const deleteStationery = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Stationery.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.send({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Create invoice (sale)
const createInvoice = async (req, res) => {
    try {
        const { items, customerName, customerEmail, customerPhone, tax, discount, paymentMethod, paymentStatus, schoolId, remarks } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0 || !customerName || !schoolId) {
            return res.status(400).send({ message: 'Items array, customer name, and school ID are required' });
        }

        // Validate and update inventory
        for (const item of items) {
            const product = await Stationery.findById(item.stationery);
            if (!product) {
                return res.status(404).send({ message: `Product ${item.productName} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).send({ message: `Insufficient quantity for ${item.productName}. Available: ${product.quantity}` });
            }
        }

        // Calculate totals
        let subtotal = 0;
        const invoiceItems = [];
        
        for (const item of items) {
            const product = await Stationery.findById(item.stationery);
            const itemTotal = item.quantity * product.pricePerUnit;
            subtotal += itemTotal;

            invoiceItems.push({
                stationery: product._id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.pricePerUnit,
                total: itemTotal,
            });

            // Update inventory (reduce quantity)
            product.quantity -= item.quantity;
            await product.save();
        }

        const taxAmount = tax || 0;
        const discountAmount = discount || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;

        const invoice = new Invoice({
            items: invoiceItems,
            customerName,
            customerEmail,
            customerPhone,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            totalAmount,
            paymentMethod: paymentMethod || 'Cash',
            paymentStatus: paymentStatus || 'Paid',
            school: schoolId,
            remarks,
        });

        const result = await invoice.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get all invoices for a school
const getInvoices = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        const invoices = await Invoice.find({ school: schoolId })
            .populate('items.stationery', 'name')
            .sort({ createdAt: -1 });

        res.send(invoices);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get single invoice
const getInvoiceDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const invoice = await Invoice.findById(id)
            .populate('items.stationery', 'name description');

        if (!invoice) {
            return res.status(404).send({ message: 'Invoice not found' });
        }

        res.send(invoice);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).send({ message: 'Invoice not found' });
        }

        // Restore inventory quantities
        for (const item of invoice.items) {
            const product = await Stationery.findById(item.stationery);
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        await Invoice.findByIdAndDelete(id);
        res.send({ message: 'Invoice deleted and inventory restored' });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    getStationery,
    getStationeryDetail,
    addStationery,
    updateStationery,
    deleteStationery,
    createInvoice,
    getInvoices,
    getInvoiceDetail,
    deleteInvoice,
};

