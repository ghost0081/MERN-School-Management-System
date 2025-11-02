const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    stationery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stationery',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    items: [invoiceItemSchema],
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
    },
    customerPhone: {
        type: String,
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    tax: {
        type: Number,
        default: 0,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Cheque', 'Online', 'Bank Transfer', 'Card', 'Other'],
        default: 'Cash',
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Partial'],
        default: 'Paid',
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    remarks: {
        type: String,
    },
}, { 
    timestamps: true,
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
    if (!this.invoiceNumber) {
        try {
            const InvoiceModel = mongoose.model('invoice');
            const count = await InvoiceModel.countDocuments({ school: this.school });
            const schoolCode = this.school.toString().slice(-4).toUpperCase();
            const invoiceNum = count + 1;
            this.invoiceNumber = `INV-${schoolCode}-${String(invoiceNum).padStart(6, '0')}`;
        } catch (error) {
            // If model doesn't exist yet or error occurs, generate a simple number
            const schoolCode = this.school.toString().slice(-4).toUpperCase();
            const timestamp = Date.now().toString().slice(-6);
            this.invoiceNumber = `INV-${schoolCode}-${timestamp}`;
        }
    }
    next();
});

module.exports = mongoose.model('invoice', invoiceSchema);

