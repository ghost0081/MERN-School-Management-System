import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Grid,
    Paper,
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Button,
    Slider,
    Alert,
    Chip,
    Snackbar
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import MapIcon from '@mui/icons-material/Map';
import CellTowerIcon from '@mui/icons-material/CellTower';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SaveIcon from '@mui/icons-material/Save';

const ParentTracking = () => {
    const { currentUser } = useSelector(state => state.user);
    const [trackerData, setTrackerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Geofence State
    const [geofence, setGeofence] = useState({
        lat: 0,
        lng: 0,
        radius: 500,
        name: "Safe Zone",
        enabled: false
    });
    const [isEditingGeofence, setIsEditingGeofence] = useState(false);
    const [savingGeofence, setSavingGeofence] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const polylineRef = useRef(null);
    const geofenceCircleRef = useRef(null);
    const mapContainerRef = useRef(null);
    const pathHistoryRef = useRef([]);

    // Format ISO string to readable date
    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown';
        try {
            return new Date(isoString).toLocaleString();
        } catch (e) {
            return isoString;
        }
    };

    // Haversine distance in meters between two coordinates
    const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
        const R = 6371e3; // Earth radius in meters
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchTrackerData = async () => {
        if (!currentUser?.student) {
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/${currentUser.student}`);
            setTrackerData(response.data);
            if (response.data?.geofence && !isEditingGeofence) {
                setGeofence(response.data.geofence);
            }
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error("Tracker API Error:", err);
            setError("Failed to fetch live wearable coordinates.");
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        fetchTrackerData();
        const intervalId = setInterval(() => {
            if (!isEditingGeofence) {
                fetchTrackerData();
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, isEditingGeofence]);

    // Initialize Leaflet Map - runs when container is mounted
    useEffect(() => {
        if (!window.L || !mapContainerRef.current) return;

        if (!mapRef.current) {
            mapRef.current = window.L.map(mapContainerRef.current, {
                center: [28.6139, 77.2090],
                zoom: 13,
                zoomControl: true,
                attributionControl: true
            });
            
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);

            polylineRef.current = window.L.polyline([], {
                color: '#7B61FF',
                weight: 4,
                opacity: 0.85
            }).addTo(mapRef.current);

            // Handle map clicks when in Geofence edit mode
            mapRef.current.on('click', (e) => {
                setGeofence(prev => {
                    return {
                        ...prev,
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        enabled: true
                    };
                });
            });

            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize(true);
                }
            }, 300);
        }
    }, [loading]);

    // Re-invalidate size whenever layout changes (banners appearing/disappearing)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize(true);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [isEditingGeofence, geofence, trackerData]);

    // Update map marker, polyline trail, and geofence circle when trackerData or geofence changes
    useEffect(() => {
        if (!window.L || !mapRef.current || !trackerData?.latitude) return;

        const lat = parseFloat(trackerData.latitude);
        const lng = parseFloat(trackerData.longitude);

        if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

        const latlng = [lat, lng];
        if (!isEditingGeofence) {
            mapRef.current.setView(latlng, mapRef.current.getZoom() || 15);
        }

        // Draw Child Marker
        if (!markerRef.current) {
            const studentIcon = window.L.divIcon({
                html: `<div style="background-color: #7B61FF; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(0,0,0,0.5);"></div>`,
                className: 'custom-student-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            markerRef.current = window.L.marker(latlng, { icon: studentIcon }).addTo(mapRef.current)
                .bindPopup(`<b>Child Wearable Tracker</b><br/>IMEI: ${trackerData.imei || 'Assigned Device'}<br/>Time: ${formatDate(trackerData.last_updated)}`)
                .openPopup();
        } else {
            markerRef.current.setLatLng(latlng);
            markerRef.current.getPopup().setContent(`<b>Child Wearable Tracker</b><br/>IMEI: ${trackerData.imei || 'Assigned Device'}<br/>Time: ${formatDate(trackerData.last_updated)}`);
        }

        // Polyline history
        if (trackerData.path_history && trackerData.path_history.length > 0) {
            const fullTrail = trackerData.path_history.map(pt => [pt.lat, pt.lng]);
            pathHistoryRef.current = fullTrail;
            if (polylineRef.current) {
                polylineRef.current.setLatLngs(fullTrail);
            }
        } else {
            const history = pathHistoryRef.current;
            const lastCoord = history[history.length - 1];
            if (!lastCoord || lastCoord[0] !== lat || lastCoord[1] !== lng) {
                history.push(latlng);
                if (polylineRef.current) {
                    polylineRef.current.setLatLngs(history);
                }
            }
        }

        // Draw or update Geo-Fence Circle
        if (geofence && geofence.enabled && geofence.lat !== 0 && geofence.lng !== 0) {
            if (!geofenceCircleRef.current) {
                geofenceCircleRef.current = window.L.circle([geofence.lat, geofence.lng], {
                    radius: geofence.radius || 500,
                    color: '#4CAF50',
                    fillColor: '#81C784',
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: '5, 5'
                }).addTo(mapRef.current);
            } else {
                geofenceCircleRef.current.setLatLng([geofence.lat, geofence.lng]);
                geofenceCircleRef.current.setRadius(geofence.radius || 500);
            }
        } else if (geofenceCircleRef.current) {
            geofenceCircleRef.current.remove();
            geofenceCircleRef.current = null;
        }
    }, [trackerData, geofence, isEditingGeofence, loading]);

    // Save Geofence to DB
    const handleSaveGeofence = async () => {
        if (!currentUser?.student) return;
        setSavingGeofence(true);
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/student/${currentUser.student}/geofence`, geofence);
            setIsEditingGeofence(false);
            setToastMsg("Safe Zone Geo-Fence saved successfully!");
        } catch (err) {
            console.error("Save Geofence Error:", err);
            setToastMsg("Failed to save safe zone.");
        } finally {
            setSavingGeofence(false);
        }
    };

    // Calculate distance and inside/outside status
    const isGeofenceActive = geofence?.enabled && geofence?.lat !== 0 && geofence?.lng !== 0;
    const currentDistance = isGeofenceActive && trackerData?.latitude
        ? calculateDistanceMeters(trackerData.latitude, trackerData.longitude, geofence.lat, geofence.lng)
        : null;
    const isInsideSafeZone = currentDistance !== null && currentDistance <= (geofence.radius || 500);

    if (!loading && (!trackerData || !trackerData.imei)) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #EAEAEC' }}>
                    <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        No Hardware Wearable (BLE/GPS) Allotted Yet
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                        The school administrator has not yet allotted a physical hardware wearable tracker to your child. Once an IMEI / BLE wearable is assigned in the Admin panel, live GPS tracking and route history will appear here immediately.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6, overflowX: 'hidden' }}>
            {/* Header Banner */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #EAEAEC' }}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" fontWeight="700" color="#1E1E1E">
                            Student Hardware Wearable Tracker (BLE/GPS)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Live GPS telemetry and movement trail from your child's assigned wearable ID: <b>{trackerData?.imei || 'Loading...'}</b>
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end', xs: 'flex-start' }, alignItems: 'center', flexWrap: 'wrap' }}>
                            {loading && <CircularProgress size={24} />}
                            
                            <Button 
                                variant={isEditingGeofence ? "outlined" : "contained"}
                                color={isEditingGeofence ? "warning" : "secondary"}
                                size="small"
                                startIcon={<SecurityIcon />}
                                onClick={() => {
                                    if (!isEditingGeofence && (!geofence.lat || geofence.lat === 0)) {
                                        setGeofence({
                                            lat: trackerData?.latitude || 28.6139,
                                            lng: trackerData?.longitude || 77.2090,
                                            radius: 500,
                                            name: "Safe Zone",
                                            enabled: true
                                        });
                                    }
                                    setIsEditingGeofence(!isEditingGeofence);
                                }}
                            >
                                {isEditingGeofence ? "Cancel Editing" : "📍 Set Safe Zone (Geo-Fence)"}
                            </Button>

                            <Button 
                                variant="contained"
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={fetchTrackerData}
                            >
                                Refresh Live Data
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* GEO-FENCE EDITING BANNER AND CONTROLS */}
            {isEditingGeofence && (
                <Paper sx={{ p: 2.5, mb: 3, borderRadius: '16px', bgcolor: '#E8F5E9', border: '1px solid #81C784', overflow: 'hidden' }}>
                    <Typography variant="subtitle1" fontWeight="700" color="#2E7D32" sx={{ mb: 1 }}>
                        📍 Creating / Editing Child Safe Zone Geo-Fence
                    </Typography>
                    <Typography variant="body2" color="#1B5E20" sx={{ mb: 2 }}>
                        Click anywhere directly on the map below to move the Safe Zone center (e.g. School Campus or Home). Adjust the radius slider to resize the protected green circle.
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ px: 1 }}>
                                <Typography variant="caption" fontWeight="600" color="#2E7D32">
                                    Safe Zone Radius: <b>{geofence.radius} meters</b>
                                </Typography>
                                <Slider
                                    value={geofence.radius || 500}
                                    min={100}
                                    max={3000}
                                    step={100}
                                    onChange={(e, val) => setGeofence({ ...geofence, radius: val, enabled: true })}
                                    valueLabelDisplay="auto"
                                    sx={{ color: '#2E7D32' }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { md: 'flex-end', xs: 'flex-start' } }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => setGeofence({ ...geofence, enabled: false, lat: 0, lng: 0 })}
                                >
                                    Disable Geo-Fence
                                </Button>

                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<SaveIcon />}
                                    disabled={savingGeofence}
                                    onClick={handleSaveGeofence}
                                >
                                    {savingGeofence ? "Saving..." : "Save Safe Zone to DB"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* LIVE GEOFENCE ALERT STATUS BANNER */}
            {isGeofenceActive && (
                <Alert 
                    icon={isInsideSafeZone ? <VerifiedUserIcon fontSize="inherit" /> : <WarningAmberIcon fontSize="inherit" />}
                    severity={isInsideSafeZone ? "success" : "error"}
                    sx={{ mb: 3, borderRadius: '12px', fontWeight: 'bold' }}
                >
                    {isInsideSafeZone 
                        ? `🟢 CHILD IS SAFE: Currently inside the designated Safe Zone (${Math.round(currentDistance)}m from zone center).`
                        : `🚨 SAFETY ALERT: Child is OUTSIDE the designated Safe Zone! (${Math.round(currentDistance)}m away from safe zone center).`
                    }
                </Alert>
            )}

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            )}

            {/* Main Content Layout: 8 cols Map + 4 cols Telemetry */}
            <Grid container spacing={3} sx={{ position: 'relative', overflow: 'hidden' }}>
                {/* Map Panel */}
                <Grid item xs={12} lg={8} sx={{ width: '100%', maxWidth: '100%' }}>
                    <Paper sx={{ 
                        p: 2, 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid #EAEAEC'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MapIcon color="action" /> Live Location Map & Route Line
                            </Typography>
                            {isGeofenceActive && (
                                <Chip 
                                    size="small" 
                                    label="Geo-Fence Active" 
                                    color="success" 
                                    variant="outlined" 
                                    sx={{ fontWeight: 'bold' }} 
                                />
                            )}
                        </Box>
                        
                        {/* Map Canvas with strict clipping and relative positioning */}
                        <Box 
                            ref={mapContainerRef} 
                            id="parent-tracking-map" 
                            sx={{ 
                                height: '500px', 
                                width: '100%', 
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                border: '1px solid #EEEEEE',
                                zIndex: 1,
                                cursor: isEditingGeofence ? 'crosshair' : 'default',
                                '& .leaflet-container': {
                                    height: '100%',
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '12px'
                                }
                            }} 
                        />
                    </Paper>
                </Grid>

                {/* Telemetry Metrics Panel */}
                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        {/* Safe Zone summary card if active */}
                        <Grid item xs={12}>
                            <Card sx={{ 
                                borderRadius: '16px', 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                borderLeft: isGeofenceActive ? '5px solid #4CAF50' : '5px solid #EAEAEC'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SecurityIcon color={isGeofenceActive ? "success" : "disabled"} /> Safe Zone Status
                                        </Typography>
                                    </Box>

                                    {isGeofenceActive ? (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">Safe Zone Radius:</Typography>
                                                <Typography variant="body2" fontWeight="600">{geofence.radius} meters</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">Current Distance:</Typography>
                                                <Typography variant="body2" fontWeight="600">
                                                    {currentDistance !== null ? `${Math.round(currentDistance)} meters` : "Calculating..."}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                <Typography variant="body2" color="text.secondary">Safety State:</Typography>
                                                <Typography variant="body2" fontWeight="700" sx={{ color: isInsideSafeZone ? '#2E7D32' : '#C62828' }}>
                                                    {isInsideSafeZone ? "INSIDE ZONE" : "OUTSIDE ZONE"}
                                                </Typography>
                                            </Box>
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No Safe Zone set. Click "📍 Set Safe Zone (Geo-Fence)" above to protect an area around Home or School.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* GPS details card */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon color="primary" /> Location Telemetry
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Latitude:</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {trackerData?.latitude ? parseFloat(trackerData.latitude).toFixed(6) : "0.000000"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Longitude:</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {trackerData?.longitude ? parseFloat(trackerData.longitude).toFixed(6) : "0.000000"}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">Last Updated:</Typography>
                                        <Typography variant="caption" fontWeight="500">
                                            {formatDate(trackerData?.last_updated)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Wearable Info card */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CellTowerIcon color="primary" /> Hardware State
                                        </Typography>
                                        <Box sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '12px',
                                            backgroundColor: trackerData?.status === 'Online' ? '#E8F5E9' : '#FFEBEE',
                                            color: trackerData?.status === 'Online' ? '#2E7D32' : '#C62828',
                                            fontWeight: '700',
                                            fontSize: '0.75rem'
                                        }}>
                                            {trackerData?.status || 'Offline'}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Battery Level:</Typography>
                                        <Typography variant="body2" fontWeight="600" sx={{
                                            color: (trackerData?.battery ?? 0) > 25 ? '#2E7D32' : '#C62828'
                                        }}>
                                            {trackerData?.battery !== undefined ? `${trackerData.battery}%` : '100%'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Speed:</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {trackerData?.speed !== undefined ? `${trackerData.speed} km/h` : '0 km/h'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Course / Heading:</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {trackerData?.course !== undefined ? `${trackerData.course}°` : '0°'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Snackbar
                open={Boolean(toastMsg)}
                autoHideDuration={4000}
                onClose={() => setToastMsg("")}
                message={toastMsg}
            />
        </Container>
    );
};

export default ParentTracking;
