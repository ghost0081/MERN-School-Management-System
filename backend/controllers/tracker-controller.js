const TrackerData = require('../models/trackerSchema');
const Student = require('../models/studentSchema');

// Retrieve tracking data for a specific device (for Admin Panel)
const getDeviceData = async (req, res) => {
    try {
        const { device_id } = req.params;
        
        let imei = device_id;
        try {
            const student = await Student.findById(device_id);
            if (student && student.imei) {
                imei = student.imei;
            }
        } catch(e) {
            // Not a valid object ID, treat as IMEI directly
        }

        const data = await TrackerData.findOne({ imei }).sort({ last_updated: -1 });

        if (!data) {
            return res.status(200).json({
                device_id: imei,
                latitude: 0,
                longitude: 0,
                speed: 0,
                course: 0,
                battery: 0,
                status: 'Offline',
                last_updated: null
            });
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Retrieve all active devices stored in memory
const getActiveDevices = async (req, res) => {
    try {
        const devices = await TrackerData.find({}, 'imei status latitude longitude last_updated').lean();
        // The frontend currently expects an array of strings (device IDs) for the dropdown.
        // Let's format it for backward compatibility or return objects.
        // The old cache returned Object.keys(trackerCache) which is an array of strings.
        const deviceIds = devices.map(d => d.imei);
        return res.status(200).json(deviceIds);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getDeviceData,
    getActiveDevices
};
