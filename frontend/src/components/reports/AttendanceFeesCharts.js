import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import styled from 'styled-components';

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

const ChartHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled(Typography)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1E1E1E;
`;

const SubText = styled(Typography)`
  font-size: 0.85rem;
  font-weight: 500;
  color: #8B8B8B;
`;

// Keep formatting simple
const formatMonthLabel = (value) => {
    if (!value) return value;
    const date = new Date(`${value}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('default', { month: 'short' });
};

const numberFormatter = (value) => (typeof value === 'number' ? value.toLocaleString() : value);
const currencyFormatter = (value) => `₹${numberFormatter(value || 0)}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{ bgcolor: 'white', p: 1.5, border: '1px solid #EAEAEC', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Typography variant="body2" sx={{ color: '#8B8B8B', mb: 0.5 }}>{label}</Typography>
                <Typography variant="body1" sx={{ color: '#7B61FF', fontWeight: 600 }}>
                    {payload[0].name}: {numberFormatter(payload[0].value)}
                </Typography>
            </Box>
        );
    }
    return null;
};

const AttendanceFeesCharts = ({ hideSummaries = false }) => {
    const { attendance, fees, loading, error } = useSelector((state) => state.report);

    const attendanceData = useMemo(() => {
        if (!attendance?.monthly) return [];
        return attendance.monthly.map((item) => ({
            ...item,
            label: formatMonthLabel(item.month),
        }));
    }, [attendance]);

    const feesSummary = fees?.totals || { paidAmount: 0, unpaidAmount: 0, collectionRate: 0 };
    
    // PieChart Data
    const pieData = [
        { name: 'Paid', value: feesSummary.paidAmount, color: '#7B61FF' },
        { name: 'Unpaid', value: feesSummary.unpaidAmount, color: '#EAEAEC' }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography variant="body2">Unable to load reports. Please try again.</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {/* Attendance Bar Chart */}
            <Grid item xs={12} md={6}>
                <StyledPaper>
                    <ChartHeader>
                        <Title>Attendance</Title>
                    </ChartHeader>
                    {attendanceData.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No attendance data found for the selected period.
                        </Typography>
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEC" />
                                    <XAxis 
                                        dataKey="label" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#8B8B8B', fontSize: 12, fontWeight: 500 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#8B8B8B', fontSize: 12, fontWeight: 500 }} 
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F6F8' }} />
                                    <Bar 
                                        dataKey="present" 
                                        name="Attendance" 
                                        fill="#7B61FF" 
                                        radius={[8, 8, 8, 8]} 
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </StyledPaper>
            </Grid>
            
            {/* Fees Doughnut Chart */}
            <Grid item xs={12} md={6}>
                <StyledPaper>
                    <ChartHeader>
                        <Title>Payments overview</Title>
                        <SubText>Collection: {feesSummary.collectionRate || 0}%</SubText>
                    </ChartHeader>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 280, mt: 2 }}>
                        {feesSummary.paidAmount === 0 && feesSummary.unpaidAmount === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No fees data found.
                            </Typography>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => currencyFormatter(value)}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #EAEAEC', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                            itemStyle={{ fontWeight: 600 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                
                                {/* Center Text for Doughnut */}
                                <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                                    <Typography variant="body2" sx={{ color: '#8B8B8B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Total
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: '#1E1E1E', fontWeight: 700 }}>
                                        {currencyFormatter(feesSummary.paidAmount + feesSummary.unpaidAmount)}
                                    </Typography>
                                </Box>
                                
                                {/* Paid Tag */}
                                <Box sx={{ position: 'absolute', bottom: 20, right: 30, bgcolor: 'white', p: 1.5, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <Typography variant="caption" sx={{ color: '#8B8B8B', fontWeight: 600 }}>Paid</Typography>
                                    <Typography variant="body2" sx={{ color: '#7B61FF', fontWeight: 700 }}>{currencyFormatter(feesSummary.paidAmount)}</Typography>
                                </Box>
                                
                                {/* Unpaid Tag */}
                                <Box sx={{ position: 'absolute', top: 20, left: 30, bgcolor: 'white', p: 1.5, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <Typography variant="caption" sx={{ color: '#8B8B8B', fontWeight: 600 }}>Unpaid</Typography>
                                    <Typography variant="body2" sx={{ color: '#EAEAEC', fontWeight: 700, WebkitTextStroke: '0.5px #8B8B8B' }}>{currencyFormatter(feesSummary.unpaidAmount)}</Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </StyledPaper>
            </Grid>
        </Grid>
    );
};

export default AttendanceFeesCharts;

