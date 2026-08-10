import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

/*
 * PageHeader — consistent page title, breadcrumb, and primary action slot
 *
 * WHY: Every page in the current app is a blank content area with no title or
 * context. Users who navigate via the URL or open a link don't know where they
 * are. This component fixes "Recognition over Recall" (Nielsen Heuristic #6) —
 * users see exactly where they are without having to remember.
 *
 * Layout:
 *   [Breadcrumb trail]
 *   [Page Title]        [Optional: Primary Action Button]
 *   [Optional: subtitle text]
 *   ─────────────────────────────────────────────────────
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,  // Array of { label, href? } — last item is current page (no link)
  action,       // React node — typically a Button or ButtonGroup
  sx = {},
}) => {
  return (
    <Box
      component="header"
      sx={{
        mb: 4,
        pb: 3,
        borderBottom: '1px solid #E2E8F0',
        ...sx,
      }}
    >
      {/* Breadcrumb navigation — helps users orient themselves in deep hierarchies */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
          aria-label="breadcrumb"
          sx={{ mb: 1.5 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography
                key={crumb.label}
                variant="caption"
                sx={{ color: 'text.primary', fontWeight: 600 }}
                aria-current="page"
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.label}
                component={RouterLink}
                to={crumb.href}
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 150ms ease',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title row — title on left, primary action on right */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Primary action — e.g. "Add Student" button */}
        {action && (
          <Box sx={{ flexShrink: 0 }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
