import * as React from 'react';
import { useDispatch } from 'react-redux';
import { underControl } from '../redux/userRelated/userSlice';
import { underStudentControl } from '../redux/studentRelated/studentSlice';
import MuiAlert from '@mui/material/Alert';
import { Snackbar, Slide } from '@mui/material';

/*
 * Popup — global notification component
 *
 * FIX: The old version detected success by comparing message === "Done Successfully"
 * (hardcoded string). Any other success message — including "BLE / Wearable allotted
 * successfully!" — incorrectly displayed as a red error.
 *
 * NEW: Accepts an explicit `severity` prop ('success' | 'error' | 'warning' | 'info').
 * Falls back to 'error' for backward compatibility with callers that don't pass severity.
 *
 * TRANSITION: All existing callers that pass only `message` will see 'error' as default.
 * Migrate callers to pass `severity="success"` when they dispatch a success message.
 */

const SlideTransition = (props) => <Slide {...props} direction="left" />;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={4} ref={ref} variant="filled" {...props} />;
});

const Popup = ({ message, setShowPopup, showPopup, severity }) => {
  const dispatch = useDispatch();

  // Determine severity: use explicit prop if provided, otherwise fall back to
  // detecting "Done Successfully" for backward compat, then default to 'error'.
  const resolvedSeverity = severity
    || (message === 'Done Successfully' ? 'success' : 'error');

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setShowPopup(false);
    dispatch(underControl());
    dispatch(underStudentControl());
  };

  return (
    <Snackbar
      open={showPopup}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{ mt: 1 }}
    >
      <Alert
        onClose={handleClose}
        severity={resolvedSeverity}
        sx={{
          width: '100%',
          minWidth: 300,
          maxWidth: 400,
          fontWeight: 500,
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Popup;
