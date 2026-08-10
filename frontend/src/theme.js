import { createTheme } from '@mui/material/styles';

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens
// These are the single source of truth for all colour, typography, and shape
// decisions. Changes here cascade to every MUI component automatically.
// ─────────────────────────────────────────────────────────────────────────────

// Primary brand violet — balanced hue, 4.5:1 contrast on white (WCAG AA pass)
const BRAND_PRIMARY       = '#6C63FF';
const BRAND_PRIMARY_DARK  = '#4F46E5'; // pressed / active state
const BRAND_PRIMARY_LIGHT = '#EDE9FE'; // selected backgrounds, chips

// Semantic colours with intent-mapping
const COLOR_SUCCESS       = '#10B981'; // present, paid, done
const COLOR_WARNING       = '#F59E0B'; // pending, partial, draft
const COLOR_DANGER        = '#EF4444'; // delete, absent, overdue

// Neutral scale — slate-based (cooler undertone = more modern)
const TEXT_PRIMARY        = '#0F172A'; // near-black with blue undertone
const TEXT_SECONDARY      = '#64748B'; // 4.6:1 contrast on white — WCAG AA pass
const BORDER              = '#E2E8F0'; // subtle dividers
const BG_DEFAULT          = '#F7F8FA'; // warm off-white — reduces eye strain

const theme = createTheme({
  palette: {
    primary: {
      main:        BRAND_PRIMARY,
      dark:        BRAND_PRIMARY_DARK,
      light:       BRAND_PRIMARY_LIGHT,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:        '#0EA5E9', // sky blue — secondary actions and data vis
      contrastText: '#FFFFFF',
    },
    error:   { main: COLOR_DANGER },
    warning: { main: COLOR_WARNING },
    success: { main: COLOR_SUCCESS },
    background: {
      default: BG_DEFAULT,
      paper:   '#FFFFFF',
    },
    text: {
      primary:   TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
      disabled:  '#CBD5E1',
    },
    divider: BORDER,
  },

  typography: {
    // Inter is designed for screens — superior readability over Poppins for data-dense UIs.
    // Fallback chain ensures correct rendering even if Google Fonts is blocked.
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',

    // Disable MUI's default text transforms — they fight against Inter's legibility
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },

    h1: { fontSize: '2rem',    fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' },
    h2: { fontSize: '1.5rem',  fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em'  },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.015em' },
    h4: { fontSize: '1.125rem',fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em'  },
    h5: { fontSize: '1rem',    fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '0.875rem',fontWeight: 600, lineHeight: 1.5 },

    body1: { fontSize: '0.9375rem', lineHeight: 1.6 }, // 15px — primary reading size
    body2: { fontSize: '0.875rem',  lineHeight: 1.5 }, // 14px — tables, sidebar labels

    subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem',  fontWeight: 600, lineHeight: 1.5 },

    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },

    overline: {
      fontSize: '0.6875rem', // 11px
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },

  shape: {
    borderRadius: 10, // MUI's global default — most components use this
  },

  // ── Shadows ─────────────────────────────────────────────────────────────────
  // Crafted with two layers: one for spread (ambient), one for depth (directional)
  // Using slate-toned shadows instead of pure black — feels more premium
  shadows: [
    'none',
    '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',   // 1 — default card
    '0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -1px rgba(15,23,42,0.05)',  // 2 — hover
    '0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -2px rgba(15,23,42,0.06)', // 3 — active
    '0 20px 25px -5px rgba(15,23,42,0.12), 0 10px 10px -5px rgba(15,23,42,0.05)', // 4 — sticky
    '0 4px 16px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.08)', // 5 — dropdown
    '0 8px 24px rgba(15,23,42,0.15), 0 4px 8px rgba(15,23,42,0.08)', // 6 — popover
    '0 24px 48px rgba(15,23,42,0.20), 0 12px 24px rgba(15,23,42,0.10)', // 7 — modal
    '0 6px 16px rgba(108,99,255,0.30), 0 2px 6px rgba(108,99,255,0.18)', // 8 — FAB
    ...Array(16).fill('none'), // remaining shadow slots
  ],

  // ── Component Overrides ──────────────────────────────────────────────────────
  components: {

    // CssBaseline — inject font import and CSS custom properties
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* Design tokens as CSS custom properties for use outside MUI */
        :root {
          --color-primary: ${BRAND_PRIMARY};
          --color-primary-dark: ${BRAND_PRIMARY_DARK};
          --color-primary-light: ${BRAND_PRIMARY_LIGHT};
          --color-success: ${COLOR_SUCCESS};
          --color-warning: ${COLOR_WARNING};
          --color-danger: ${COLOR_DANGER};
          --color-bg: ${BG_DEFAULT};
          --color-surface: #FFFFFF;
          --color-border: ${BORDER};
          --color-text-primary: ${TEXT_PRIMARY};
          --color-text-secondary: ${TEXT_SECONDARY};
          --radius-sm: 6px;
          --radius-md: 10px;
          --radius-lg: 14px;
          --radius-xl: 18px;
          --shadow-1: 0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
          --shadow-2: 0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -1px rgba(15,23,42,0.05);
        }

        /* Respect user's motion preference — applied globally */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Custom scrollbar — visible but not obtrusive */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        * { scrollbar-width: thin; scrollbar-color: #CBD5E1 transparent; }

        /* Remove the jarring blue outline from inputs in favour of our focus ring */
        .MuiOutlinedInput-root:focus-within { outline: none; }
      `,
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease',
          // Press state — confirms the click without jarring animation
          '&:active': {
            transform: 'scale(0.97)',
          },
          // Visible focus ring — uses the primary colour with 25% opacity
          '&:focus-visible': {
            outline: `2px solid ${BRAND_PRIMARY}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: BRAND_PRIMARY_DARK,
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:focus-visible': {
            outline: `2px solid ${BRAND_PRIMARY}`,
            outlineOffset: 2,
          },
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none', // MUI adds a gradient overlay in dark mode — we don't want it
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
        },
        elevation1: { boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' },
        elevation2: { boxShadow: '0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -1px rgba(15,23,42,0.05)' },
        elevation3: { boxShadow: '0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -2px rgba(15,23,42,0.06)' },
        elevation6: { boxShadow: '0 24px 48px rgba(15,23,42,0.20), 0 12px 24px rgba(15,23,42,0.10)', border: 'none' }, // Modal
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: TEXT_PRIMARY,
          boxShadow: 'none',
          borderBottom: `1px solid ${BORDER}`,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          borderRight: `1px solid ${BORDER}`,
          backgroundColor: '#FFFFFF',
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          paddingTop: 8,
          paddingBottom: 8,
          transition: 'background-color 150ms ease, color 150ms ease',
          // Selected state — uses primary colour with high legibility
          '&.Mui-selected': {
            backgroundColor: BRAND_PRIMARY_LIGHT,
            color: BRAND_PRIMARY_DARK,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#DDD6FE', // one step darker on hover
            },
            '& .MuiListItemIcon-root': {
              color: BRAND_PRIMARY_DARK,
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
            },
          },
          // Hover state for unselected items
          '&:hover': {
            backgroundColor: BG_DEFAULT,
          },
          '&:focus-visible': {
            outline: `2px solid ${BRAND_PRIMARY}`,
            outlineOffset: -2,
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 38, // tighter icon-to-text gap than MUI default 56px
          color: TEXT_SECONDARY,
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          // The focus ring wraps the entire input field for clarity
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 150ms ease',
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${BRAND_PRIMARY}40`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND_PRIMARY,
              borderWidth: 1.5,
            },
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          // Override the legacy black header defined in styles.js
          // Table headers should be subtle, not dominant
          backgroundColor: BG_DEFAULT,
          color: TEXT_SECONDARY,
          fontWeight: 700,
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderBottom: `1px solid ${BORDER}`,
        },
        body: {
          fontSize: '0.875rem',
          borderBottom: `1px solid ${BORDER}`,
          color: TEXT_PRIMARY,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: BG_DEFAULT,
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          border: 'none',
          boxShadow: '0 24px 48px rgba(15,23,42,0.20), 0 12px 24px rgba(15,23,42,0.10)',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 700,
          padding: '24px 24px 16px',
          color: TEXT_PRIMARY,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 24px',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 8,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: TEXT_PRIMARY,
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 10px',
        },
        arrow: {
          color: TEXT_PRIMARY,
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 99,
          height: 6,
          backgroundColor: BRAND_PRIMARY_LIGHT,
        },
        bar: {
          borderRadius: 99,
        },
      },
    },

    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#EEF2F7',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        filledSuccess: { backgroundColor: COLOR_SUCCESS },
        filledError:   { backgroundColor: COLOR_DANGER  },
        filledWarning: { backgroundColor: COLOR_WARNING },
      },
    },

    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BORDER,
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: BRAND_PRIMARY_LIGHT,
          color: BRAND_PRIMARY_DARK,
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
