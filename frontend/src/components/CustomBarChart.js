import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

/*
 * CustomBarChart — cleaned and made responsive
 *
 * CHANGES:
 * 1. Removed ~150 lines of commented-out dead code (3 old implementations).
 * 2. Wrapped in Recharts `ResponsiveContainer` — chart now fills its parent
 *    rather than having a fixed width={500} that overflows on small screens.
 * 3. Tooltip styling updated to match the design system.
 * 4. Colour generation via golden ratio — produces perceptually distinct,
 *    aesthetically harmonious colours for any number of subjects.
 *
 * Props unchanged — existing callers pass { chartData, dataKey }.
 */

const CustomTooltipContent = ({ active, payload, dataKey }) => {
  if (!active || !payload?.length) return null;

  const { subject, attendancePercentage, totalClasses, attendedClasses, marksObtained, subName } = payload[0].payload;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        p: 1.5,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
        minWidth: 140,
      }}
    >
      {dataKey === 'attendancePercentage' ? (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {subject}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Attended: {attendedClasses}/{totalClasses}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.25 }}>
            {attendancePercentage}%
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {subName?.subName || subName}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Marks: {marksObtained}
          </Typography>
        </>
      )}
    </Box>
  );
};

const CustomBarChart = ({ chartData, dataKey }) => {
  const colours = generateDistinctColours(chartData.length);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
      >
        <XAxis
          dataKey={dataKey === 'marksObtained' ? 'subName.subName' : 'subject'}
          tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          content={<CustomTooltipContent dataKey={dataKey} />}
          cursor={{ fill: '#F7F8FA', radius: 4 }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colours[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Golden-ratio colour generation — produces perceptually distinct, harmonious colours
const generateDistinctColours = (count) => {
  const PHI = 0.618033988749895;
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * PHI) % 1;
    return hslToHex(hue, 0.60, 0.58);
  });
};

const hslToHex = (h, s, l) => {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

export default CustomBarChart;
