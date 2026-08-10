import React from 'react';
import { Box, Skeleton } from '@mui/material';

/*
 * SkeletonLoaders — Collection of purpose-built loading skeletons
 *
 * WHY: Skeleton screens communicate that content is loading without blocking
 * the user's cognitive model of the page. Studies show they reduce perceived
 * wait time by 15–30% vs. a spinner. Each skeleton matches the exact layout
 * of its real counterpart so there's no layout shift when content arrives.
 *
 * Each skeleton uses 'wave' animation (set as default in theme.js MuiSkeleton).
 * The wave moves left-to-right, communicating "loading" directionally.
 */

// ── Stat Card Skeleton ─────────────────────────────────────────────────────
// Matches AdminHomePage's 4-column stat card layout
export const StatCardSkeleton = () => (
  <Box
    sx={{
      p: 3,
      bgcolor: '#fff',
      borderRadius: '14px',
      border: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      height: 140,
    }}
  >
    <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: '10px' }} />
    <Skeleton variant="text" width="55%" height={14} sx={{ mt: 0.5 }} />
    <Skeleton variant="text" width="40%" height={36} />
  </Box>
);

// ── List Row Skeleton ──────────────────────────────────────────────────────
// Matches the TableTemplate card layout (label–value pairs + action buttons)
export const ListRowSkeleton = ({ rows = 5 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          p: 3,
          bgcolor: '#fff',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Left side: data fields */}
        <Box sx={{ display: 'flex', gap: 4, flex: 1 }}>
          <Box>
            <Skeleton width={60} height={10} sx={{ mb: 0.5 }} />
            <Skeleton width={120} height={16} />
          </Box>
          <Box>
            <Skeleton width={60} height={10} sx={{ mb: 0.5 }} />
            <Skeleton width={80} height={16} />
          </Box>
          <Box>
            <Skeleton width={60} height={10} sx={{ mb: 0.5 }} />
            <Skeleton width={100} height={16} />
          </Box>
        </Box>
        {/* Right side: action buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: '8px' }} />
        </Box>
      </Box>
    ))}
  </Box>
);

// ── Table Skeleton ─────────────────────────────────────────────────────────
// Matches a traditional MUI Table layout
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <Box>
    {/* Header */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 2,
        px: 3,
        py: 1.5,
        borderBottom: '1px solid #E2E8F0',
        bgcolor: '#F7F8FA',
        borderRadius: '14px 14px 0 0',
      }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width="60%" height={12} />
      ))}
    </Box>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: i < rows - 1 ? '1px solid #E2E8F0' : 'none',
          bgcolor: i % 2 === 0 ? '#fff' : '#FAFBFC',
        }}
      >
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} width={`${60 + Math.random() * 30}%`} height={14} />
        ))}
      </Box>
    ))}
  </Box>
);

// ── Profile Skeleton ───────────────────────────────────────────────────────
export const ProfileSkeleton = () => (
  <Box sx={{ p: 4, maxWidth: 600 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
      <Skeleton variant="circular" width={80} height={80} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="50%" height={28} sx={{ mb: 1 }} />
        <Skeleton width="35%" height={16} />
      </Box>
    </Box>
    {[1, 2, 3, 4].map((i) => (
      <Box key={i} sx={{ mb: 3 }}>
        <Skeleton width="25%" height={12} sx={{ mb: 0.75 }} />
        <Skeleton width="70%" height={42} sx={{ borderRadius: '8px' }} />
      </Box>
    ))}
  </Box>
);

// ── Page Skeleton ──────────────────────────────────────────────────────────
// Full-page fallback for React.lazy Suspense boundaries
export const PageSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 4 } }}>
    <Box sx={{ mb: 4 }}>
      <Skeleton width={200} height={32} sx={{ mb: 1 }} />
      <Skeleton width={320} height={16} />
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2, mb: 4 }}>
      {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
    </Box>
    <ListRowSkeleton rows={4} />
  </Box>
);
