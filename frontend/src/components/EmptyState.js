import React from 'react';
import { Box, Typography, Button } from '@mui/material';

/*
 * EmptyState — standardised empty state component
 *
 * WHY: Empty states are the most neglected screen in dashboards. When a user
 * arrives at a blank list, their first thought is "did something break?" A good
 * empty state answers: "No data yet — here's exactly what to do next."
 *
 * Using Gestalt's "figure-ground" principle: the illustration + heading are the
 * figure; the description and CTA are the ground. Eyes land on the icon first,
 * then read downward naturally.
 */

// Inline SVG illustrations — no external image requests, no CLS
const Illustrations = {
  empty: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#EDE9FE" />
      <rect x="30" y="44" width="60" height="6" rx="3" fill="#C4B5FD" />
      <rect x="30" y="56" width="45" height="6" rx="3" fill="#DDD6FE" />
      <rect x="30" y="68" width="52" height="6" rx="3" fill="#DDD6FE" />
      <circle cx="85" cy="38" r="14" fill="#6C63FF" />
      <path d="M79 38l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#F1F5F9" />
      <circle cx="52" cy="50" r="18" stroke="#94A3B8" strokeWidth="4" fill="none" />
      <path d="M64 62l14 14" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 50h12M52 44v12" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#FEF2F2" />
      <circle cx="60" cy="60" r="24" fill="#FCA5A5" />
      <path d="M60 48v16M60 70v4" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  noData: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#F0FDF4" />
      <rect x="36" y="40" width="48" height="40" rx="6" fill="#BBF7D0" />
      <rect x="44" y="52" width="32" height="4" rx="2" fill="#4ADE80" />
      <rect x="44" y="60" width="24" height="4" rx="2" fill="#86EFAC" />
      <rect x="44" y="68" width="28" height="4" rx="2" fill="#86EFAC" />
    </svg>
  ),
};

const EmptyState = ({
  type = 'empty',        // 'empty' | 'search' | 'error' | 'noData'
  heading,
  description,
  action,                // { label: string, onClick: fn } — optional CTA button
  compact = false,       // Compact mode for inline empty states
}) => {
  const defaultCopy = {
    empty:  { heading: 'Nothing here yet',     description: 'Get started by adding your first item.' },
    search: { heading: 'No results found',     description: 'Try adjusting your search or filters.' },
    error:  { heading: 'Something went wrong', description: 'We couldn\'t load this data. Please try again.' },
    noData: { heading: 'No records',           description: 'There\'s no data to display right now.' },
  };

  const copy = defaultCopy[type] || defaultCopy.empty;
  const resolvedHeading     = heading     || copy.heading;
  const resolvedDescription = description || copy.description;

  return (
    <Box
      role="status"
      aria-label={resolvedHeading}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: compact ? 4 : 8,
        px: 3,
        gap: compact ? 1.5 : 2,
      }}
    >
      {/* Illustration — sized down in compact mode */}
      <Box sx={{ opacity: 0.9, transform: compact ? 'scale(0.7)' : 'scale(1)', mb: compact ? -2 : 0 }}>
        {Illustrations[type]}
      </Box>

      <Typography
        variant={compact ? 'h6' : 'h5'}
        sx={{ fontWeight: 700, color: 'text.primary', mt: 1 }}
      >
        {resolvedHeading}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', maxWidth: 320, lineHeight: 1.6 }}
      >
        {resolvedDescription}
      </Typography>

      {/* CTA — always use the primary action button style */}
      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={action.onClick}
          sx={{
            mt: 1,
            borderRadius: '8px',
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: '0 4px 12px rgba(108,99,255,0.25)',
            '&:hover': { boxShadow: '0 6px 16px rgba(108,99,255,0.35)' },
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
