const trackerCache = {};

// Device auth middleware that bypasses standard rate limiters and auth
const deviceAuthMiddleware = (req, res, next) => {
    const token = req.headers['x-device-token'];
    
    // Check if the device token is present and matches
    if (token && token === 'esp32c3_secret_token_123') {
        req.isWhitelistedDevice = true; // Flag request for downstream middleware if any
        return next();
    }
    
    return res.status(401).json({ error: "Unauthorized: Invalid or missing X-Device-Token" });
};

// Update coordinates from device
const updateGPS = async (req, res) => {
    try {
        const { device_id, latitude, longitude, timestamp, time } = req.body;
        
        if (!device_id) {
            return res.status(400).json({ error: "device_id is required" });
        }
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: "latitude and longitude are required" });
        }

        // Determine date format (seconds vs milliseconds)
        let lastUpdatedDate;
        const incomingTime = timestamp || time;
        if (incomingTime) {
            lastUpdatedDate = incomingTime > 9999999999 ? new Date(incomingTime) : new Date(incomingTime * 1000);
        } else {
            lastUpdatedDate = new Date();
        }

        trackerCache[device_id] = {
            device_id,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            last_updated: lastUpdatedDate.toISOString()
        };

        return res.status(200).json({ success: true, message: "Location updated in-memory" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Retrieve tracking data for a specific device (for Admin Panel)
const getDeviceData = async (req, res) => {
    try {
        const { device_id } = req.params;
        const data = trackerCache[device_id];

        if (!data) {
            // Return an empty template structure rather than 404 to avoid crashing UI components
            return res.status(200).json({
                device_id,
                latitude: 0,
                longitude: 0,
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
        const devices = Object.keys(trackerCache);
        return res.status(200).json(devices);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    deviceAuthMiddleware,
    updateGPS,
    getDeviceData,
    getActiveDevices
};
