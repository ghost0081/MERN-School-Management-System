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

// Update GPS coordinates from device
const updateGPS = async (req, res) => {
    try {
        const { device_id, latitude, longitude, speed, timestamp } = req.body;
        
        if (!device_id) {
            return res.status(400).json({ error: "device_id is required" });
        }

        // Initialize cache entry if not exists
        if (!trackerCache[device_id]) {
            trackerCache[device_id] = {
                device_id,
                gps: { latitude: 0, longitude: 0, speed: 0, last_updated: null },
                network: { mcc: 0, mnc: 0, lac: "", cell_id: "", signal: 0, last_updated: null }
            };
        }

        // Determine date format (seconds vs milliseconds)
        let lastUpdatedDate;
        if (timestamp) {
            lastUpdatedDate = timestamp > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
        } else {
            lastUpdatedDate = new Date();
        }

        trackerCache[device_id].gps = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            speed: parseFloat(speed) || 0,
            last_updated: lastUpdatedDate.toISOString()
        };

        return res.status(200).json({ success: true, message: "GPS telemetry updated in-memory" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update Cell network metrics from device
const updateCell = async (req, res) => {
    try {
        const { device_id, mcc, mnc, lac, cell_id, signal } = req.body;

        if (!device_id) {
            return res.status(400).json({ error: "device_id is required" });
        }

        // Initialize cache entry if not exists
        if (!trackerCache[device_id]) {
            trackerCache[device_id] = {
                device_id,
                gps: { latitude: 0, longitude: 0, speed: 0, last_updated: null },
                network: { mcc: 0, mnc: 0, lac: "", cell_id: "", signal: 0, last_updated: null }
            };
        }

        trackerCache[device_id].network = {
            mcc: parseInt(mcc) || 0,
            mnc: parseInt(mnc) || 0,
            lac: String(lac || ""),
            cell_id: String(cell_id || ""),
            signal: parseInt(signal) || 0,
            last_updated: new Date().toISOString()
        };

        return res.status(200).json({ success: true, message: "Cell telemetry updated in-memory" });
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
                gps: { latitude: 0, longitude: 0, speed: 0, last_updated: null },
                network: { mcc: 0, mnc: 0, lac: "", cell_id: "", signal: 0, last_updated: null }
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
    updateCell,
    getDeviceData,
    getActiveDevices
};
