const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema({
    imei: {
        type: String,
        required: true,
        index: true
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    speed: {
        type: Number,
        default: 0
    },
    course: {
        type: Number,
        default: 0
    },
    battery: {
        type: Number,
        default: 0
    },
    batteryMv: {
        type: Number,
        default: 0
    },
    sequence: {
        type: Number,
        default: 0
    },
    deviceType: {
        type: String,
        default: "GT06" // "GT06" or "BLE_BEACON"
    },
    status: {
        type: String,
        default: "Offline"
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    path_history: [{
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("tracker", trackerSchema);
