import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, CircularProgress, Chip, Divider } from '@mui/material';
import styled from 'styled-components';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreIcon from '@mui/icons-material/Explore';
import TimelineIcon from '@mui/icons-material/Timeline';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import CellTowerIcon from '@mui/icons-material/CellTower';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const StyledPaper = styled(Paper)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px;
  border: 1px solid #EAEAEC;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
      box-shadow: 0 8px 25px rgba(0,0,0,0.06);
  }
`;

const SectionTitle = styled(Typography)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1E1E1E;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DataItem = ({ label, value, unit = '' }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" sx={{ color: '#8B8B8B', fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body1" sx={{ color: '#1E1E1E', fontWeight: 600 }}>{value} {unit}</Typography>
    </Box>
);

const ParentTracking = () => {
    const [trackerData, setTrackerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Query the test001 collection for the device telemetry
        const q = query(collection(db, "test001"), limit(5));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // Find our specific device if multiple exist, or just take the first
                const doc = snapshot.docs.find(d => d.data().deviceId === "MyFirstDevice") || snapshot.docs[0];
                const rawData = doc.data();
                
                // FireStore Timestamps crash React if rendered directly. Sanitize all keys.
                for (const key in rawData) {
                   if (rawData[key] && typeof rawData[key] === 'object' && ('seconds' in rawData[key] || rawData[key].toDate)) {
                       rawData[key] = rawData[key].toDate ? rawData[key].toDate().toLocaleString() : new Date(rawData[key].seconds * 1000).toLocaleString();
                   } else if (rawData[key] && typeof rawData[key] === 'object') {
                       // Deep sanitize just in case
                       rawData[key] = JSON.stringify(rawData[key]);
                   }
                }
                
                setTrackerData(rawData);
                setLoading(false);
            } else {
                setLoading(false);
            }
        }, (error) => {
            console.error("Firestore Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#7B61FF' }} />
            </Box>
        );
    }

    if (!trackerData) {
        return (
            <Container sx={{ mt: 4 }}>
                <StyledPaper>
                    <Typography variant="h6" color="error">No tracking data available for this device.</Typography>
                </StyledPaper>
            </Container>
        );
    }

    const formatDate = (dateObj) => {
        if (!dateObj) return 'Unknown';
        if (typeof dateObj === 'string') return dateObj;
        if (dateObj.toDate) return dateObj.toDate().toLocaleString();
        if (dateObj.seconds) return new Date(dateObj.seconds * 1000).toLocaleString();
        return String(dateObj);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E1E1E' }}>
                    Live GPS Tracker
                </Typography>
                <Chip 
                    icon={trackerData.online ? <LocationOnIcon /> : <WarningAmberIcon />} 
                    label={trackerData.online ? 'Device Online' : 'Device Offline'} 
                    sx={{ 
                        bgcolor: trackerData.online ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 83, 80, 0.1)', 
                        color: trackerData.online ? '#4caf50' : '#ef5350',
                        fontWeight: 600,
                        px: 1
                    }} 
                />
            </Box>

            <Grid container spacing={3}>
                {/* Location & GPS */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <SectionTitle><ExploreIcon sx={{ color: '#7B61FF' }}/> Location Intel</SectionTitle>
                        <DataItem label="Latitude" value={trackerData.latitude?.toFixed(6) || 0} />
                        <DataItem label="Longitude" value={trackerData.longitude?.toFixed(6) || 0} />
                        <DataItem label="Movement Speed" value={trackerData.speed || 0} unit="km/h" />
                        <DataItem label="Satellites Locked" value={trackerData.satellites || 0} />
                        <Divider sx={{ my: 2 }} />
                        <DataItem label="GPS Status" value={trackerData.gps_lock ? "Locked" : "Searching..."} />
                        <DataItem label="Zone Active" value={trackerData.zone_active ? "Yes" : "No"} />
                        <DataItem label="Inside Safe Zone" value={trackerData.inside_zone ? "Yes" : "No"} />
                    </StyledPaper>
                </Grid>

                {/* Telemetry & Accelerometer */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <SectionTitle><TimelineIcon sx={{ color: '#7B61FF' }}/> Accelerometer telemetry</SectionTitle>
                        <DataItem label="X Axis" value={trackerData.accel_x || 0} />
                        <DataItem label="Y Axis" value={trackerData.accel_y || 0} />
                        <DataItem label="Z Axis" value={trackerData.accel_z || 0} />
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                            <Chip label={`Motion: ${trackerData.motion ? 'Detected' : 'Idle'}`} variant="outlined" color={trackerData.motion ? 'warning' : 'default'} />
                            <Chip label={`Anomaly: ${trackerData.anomaly ? 'Yes' : 'None'}`} variant="outlined" color={trackerData.anomaly ? 'error' : 'default'} />
                            <Chip label={`Danger: ${trackerData.danger ? 'Yes' : 'No'}`} variant="outlined" color={trackerData.danger ? 'error' : 'default'} />
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Network & Power */}
                <Grid item xs={12} md={4}>
                    <StyledPaper>
                        <SectionTitle><CellTowerIcon sx={{ color: '#7B61FF' }}/> Network</SectionTitle>
                        <DataItem label="Cell ID" value={trackerData.cell_id || 'N/A'} />
                        <DataItem label="LAC" value={trackerData.lac || 'N/A'} />
                        <DataItem label="Provider (MCC/MNC)" value={`${trackerData.mcc || ''} / ${trackerData.mnc || ''}`} />
                        <DataItem label="GPRS Connected" value={trackerData.sim_gprs_connected ? 'Yes' : 'No'} />
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <StyledPaper>
                        <SectionTitle><BatteryChargingFullIcon sx={{ color: '#7B61FF' }}/> Power Lifecycle</SectionTitle>
                        {/* Currently battery is 0 in dump, but keeping it flexible */}
                        <DataItem label="Battery Level" value={trackerData.battery || 0} unit="mV" />
                        <DataItem label="Sleep Mode" value={trackerData.inactivity_sleep_active ? "Active" : "Awake"} />
                        <DataItem label="Mode" value={trackerData.mode || 'Normal'} />
                        <DataItem label="Transport" value={trackerData.transport || 'N/A'} />
                    </StyledPaper>
                </Grid>

                {/* Last Update Time */}
                <Grid item xs={12} md={4}>
                    <StyledPaper sx={{ bgcolor: '#7B61FF', color: 'white' }}>
                        <SectionTitle sx={{ color: 'white' }}><AccessTimeIcon sx={{ color: 'white' }}/> Last Seen Sync</SectionTitle>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>The tracker last reported its state at:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>{formatDate(trackerData.lastSeen || trackerData.timestamp)}</Typography>
                        
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Last Command Executed:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{trackerData.command_status || 'N/A'} ({trackerData.command_result || 'None'})</Typography>
                    </StyledPaper>
                </Grid>
                
            </Grid>
        </Container>
    );
};

export default ParentTracking;
