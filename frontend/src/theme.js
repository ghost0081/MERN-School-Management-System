import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7B61FF',
    },
    secondary: {
      main: '#1E1E1E',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#8B8B8B',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
        },
        elevation4: {
          boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1E1E1E',
          boxShadow: 'none',
          borderBottom: '1px solid #EAEAEC',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #EAEAEC',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          margin: "4px 12px",
          '&.Mui-selected': {
            backgroundColor: 'rgba(123, 97, 255, 0.08)',
            color: '#7B61FF',
            borderLeft: '4px solid #7B61FF',
            '&:hover': {
              backgroundColor: 'rgba(123, 97, 255, 0.12)',
            },
            '& .MuiListItemIcon-root': {
              color: '#7B61FF',
            }
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '40px',
        },
      },
    },
  },
});

export default theme;
