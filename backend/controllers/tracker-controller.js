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

        data.geofence = studentGeofence;
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Retrieve all active devices stored in memory
const getActiveDevices = async (req, res) => {
    try {
        const devices = await TrackerData.find({}, 'imei status latitude longitude last_updated').lean();
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

module.exports = {
    getDeviceData,
    getActiveDevices,
    updateGeofence
};

