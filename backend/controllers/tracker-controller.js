const TrackerData = require('../models/trackerSchema');
const Student = require('../models/studentSchema');

// Retrieve tracking data for a specific device (for Admin Panel)
const getDeviceData = async (req, res) => {
    try {
        const { device_id } = req.params;
        
        let imei = device_id;
        let studentGeofence = null;
        try {
            const student = await Student.findById(device_id);
            if (student) {
                if (student.imei) imei = student.imei;
                if (student.geofence) studentGeofence = student.geofence;
            }
        } catch(e) {
            // Not a valid object ID, treat as IMEI directly
        }

        const data = await TrackerData.findOne({ imei }).sort({ last_updated: -1 }).lean();

        if (!data) {
            return res.status(200).json({
                device_id: imei,
                imei: imei,
                latitude: 0,
                longitude: 0,
                speed: 0,
                course: 0,
                battery: 0,
                status: 'Offline',
                last_updated: null,
                geofence: studentGeofence
            });
        }

        // Check if tracker is actually online by checking last_updated timestamp.
        // If last_updated is older than 2 minutes (120 seconds) or is null, mark status as Offline.
        const now = new Date();
        const lastUpdated = data.last_updated ? new Date(data.last_updated) : null;
        if (!lastUpdated || (now.getTime() - lastUpdated.getTime() > 2 * 60 * 1000)) {
            data.status = 'Offline';
            TrackerData.updateOne({ _id: data._id }, { $set: { status: 'Offline' } }).catch(() => {});
        } else {
            data.status = 'Online';
        }

        data.geofence = studentGeofence;
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Retrieve all active devices stored in memory
const getActiveDevices = async (req, res) => {
    try {
        const now = new Date();
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
        const devices = await TrackerData.find({
            last_updated: { $gte: twoMinutesAgo }
        }, 'imei status latitude longitude last_updated').lean();
        const deviceIds = devices.map(d => d.imei);
        return res.status(200).json(deviceIds);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update geofence safe zone for a student
const updateGeofence = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { lat, lng, radius, name, enabled } = req.body;
        const student = await Student.findByIdAndUpdate(
            student_id,
            { geofence: { lat, lng, radius, name, enabled } },
            { new: true }
        );
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ message: "Geofence safe zone saved successfully", geofence: student.geofence });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Upload BLE Telemetry from Mobile Android Gateway (BeaconACK Protocol)
const uploadBleTelemetry = async (req, res) => {
    try {
        const { imei, sequence, battery, batteryMv, latitude, longitude, speed } = req.body;

        if (!imei) {
            return res.status(400).json({ error: "IMEI is required" });
        }

        const now = new Date();
        const updatePayload = {
            imei: String(imei),
            battery: Number(battery) || 0,
            batteryMv: Number(batteryMv) || 0,
            sequence: Number(sequence) || 0,
            deviceType: 'BLE_BEACON',
            status: 'Online',
            last_updated: now
        };

        const lat = Number(latitude) || 0;
        const lng = Number(longitude) || 0;

        if (lat !== 0 && lng !== 0) {
            updatePayload.latitude = lat;
            updatePayload.longitude = lng;
            if (speed !== undefined) updatePayload.speed = Number(speed);
        }

        const mongoUpdate = { $set: updatePayload };

        if (lat !== 0 && lng !== 0) {
            mongoUpdate.$push = {
                path_history: {
                    $each: [{ lat, lng, timestamp: now }],
                    $slice: -500 // Keep last 500 coordinates
                }
            };
        }

        await TrackerData.findOneAndUpdate(
            { imei: String(imei) },
            mongoUpdate,
            { upsert: true, new: true }
        );

        // Generate a 32-bit unsigned integer receipt ID (uint32)
        const receiptId = (Date.now() & 0xFFFFFFFF) >>> 0;

        console.log(`[BLE TELEMETRY RECEIVE] IMEI: ${imei} | Seq: ${sequence} | Bat: ${battery}% (${batteryMv}mV) | Lat: ${latitude || 0} | Lng: ${longitude || 0} | ReceiptId: ${receiptId} (0x${receiptId.toString(16).toUpperCase()})`);

        return res.status(200).json({
            status: 1,
            message: "Beacon telemetry recorded successfully",
            receiptId,
            imei: String(imei),
            sequence: Number(sequence) || 0
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getDeviceData,
    getActiveDevices,
    updateGeofence,
    uploadBleTelemetry
};


