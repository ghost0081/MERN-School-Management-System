const TrackerData = require('../models/trackerSchema');
const Student = require('../models/studentSchema');

// Retrieve tracking data for a specific device (for Admin Panel)
const getDeviceData = async (req, res) => {
    try {
        const { device_id } = req.params;
        
        let imei = device_id;
        let studentGeofence = null;
        let studentGeofences = [];
        try {
            const student = await Student.findById(device_id);
            if (student) {
                if (student.imei) imei = student.imei;
                if (student.geofence) studentGeofence = student.geofence;
                if (student.geofences && student.geofences.length > 0) {
                    studentGeofences = student.geofences;
                } else if (student.geofence) {
                    studentGeofences = [student.geofence];
                }
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
                geofence: studentGeofence,
                geofences: studentGeofences
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
        data.geofences = studentGeofences;
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

// Update geofence safe zone(s) for a student
const updateGeofence = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { lat, lng, radius, name, enabled, geofences } = req.body;
        
        let updateData = {};
        if (geofences && Array.isArray(geofences)) {
            const cappedGeofences = geofences.slice(0, 4); // Enforce max 4 safe zones
            updateData.geofences = cappedGeofences;
            if (cappedGeofences.length > 0) {
                updateData.geofence = cappedGeofences[0];
            }
        } else {
            updateData.geofence = { lat, lng, radius, name, enabled };
            updateData.geofences = [{ lat, lng, radius, name, enabled }];
        }

        const student = await Student.findByIdAndUpdate(
            student_id,
            updateData,
            { new: true }
        );
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ 
            message: "Safe zones saved successfully", 
            geofence: student.geofence,
            geofences: student.geofences 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const processGeofenceCheck = async (imei, lat, lng) => {
    if (!lat || !lng) return null;
    try {
        const student = await Student.findOne({ imei: String(imei) }).lean();
        if (!student) return null;

        const zones = [];
        if (student.geofences && Array.isArray(student.geofences)) {
            for (const gf of student.geofences) {
                if (gf.enabled && gf.lat && gf.lng) {
                    zones.push(gf);
                }
            }
        }
        if (zones.length === 0 && student.geofence && student.geofence.enabled && student.geofence.lat && student.geofence.lng) {
            zones.push(student.geofence);
        }

        if (zones.length === 0) return null;

        const hits = [];
        let closestZone = null;
        let minDistance = Infinity;

        for (const zone of zones) {
            const dist = getDistanceMeters(lat, lng, zone.lat, zone.lng);
            const radius = zone.radius || 10;
            const isInside = dist <= radius;

            if (dist < minDistance) {
                minDistance = dist;
                closestZone = { zone, dist, isInside };
            }

            if (isInside) {
                hits.push({
                    name: zone.name || "Safe Zone",
                    distanceMeters: Math.round(dist),
                    radiusMeters: radius,
                    lat: zone.lat,
                    lng: zone.lng
                });
            }
        }

        const isInsideAny = hits.length > 0;

        const alert = {
            studentName: student.name,
            isInside: isInsideAny,
            hits: hits,
            hitCount: hits.length,
            closestDistanceMeters: Math.round(minDistance),
            geofenceName: isInsideAny ? hits.map(h => h.name).join(', ') : (closestZone ? closestZone.zone.name : "Safe Zone"),
            distanceMeters: isInsideAny ? hits[0].distanceMeters : Math.round(minDistance),
            message: isInsideAny 
                ? `🚨 SAFE POINT HIT ALERT: Student ${student.name} arrived at safe point "${hits.map(h => h.name).join(', ')}" (${hits[0].distanceMeters}m from center)!`
                : `OUTSIDE SAFE ZONES: Student ${student.name} is ${Math.round(minDistance)}m away from closest safe zone "${closestZone ? closestZone.zone.name : ''}"`
        };

        if (isInsideAny) {
            console.log(`🚨 [GEOFENCE ALERT] ${alert.message}`);
        }

        return alert;
    } catch (e) {
        console.error("Geofence check error:", e.message);
    }
    return null;
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

        // Check live Geofence Safe Point Alert
        const geofenceAlert = await processGeofenceCheck(imei, lat, lng);

        // Generate a 32-bit unsigned integer receipt ID (uint32)
        const receiptId = (Date.now() & 0xFFFFFFFF) >>> 0;

        console.log(`[BLE TELEMETRY RECEIVE] IMEI: ${imei} | Seq: ${sequence} | Bat: ${battery}% (${batteryMv}mV) | Lat: ${latitude || 0} | Lng: ${longitude || 0} | ReceiptId: ${receiptId} (0x${receiptId.toString(16).toUpperCase()})`);

        return res.status(200).json({
            status: 1,
            message: "Beacon telemetry recorded successfully",
            receiptId,
            imei: String(imei),
            sequence: Number(sequence) || 0,
            geofenceAlert
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


