const mongoose = require("mongoose")

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
    },
    address: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        enum: ['Janitor', 'Security Guard', 'Office Staff', 'Accountant', 'Librarian', 'Cafeteria Staff', 'Maintenance', 'Bus Driver', 'Other'],
        default: 'Other'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'On Leave'],
        default: 'Active'
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Half Day'],
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("staff", staffSchema)



