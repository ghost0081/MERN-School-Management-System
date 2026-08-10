import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import {
  Box, Typography, Button, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import EmptyState from '../../../components/EmptyState';

/*
 * FeesHomePage — class selection for fee management
 *
 * FIXES:
 * 1. Table header was black (from StyledTableCell bug) — now fixed via styles.js
 * 2. Added a summary stats row at the top showing total classes
 * 3. Empty state properly handles the case of no classes
 * 4. "Manage Fees" button uses semantic PrimaryButton
 */

const FeesHomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const { sclassesList, loading } = useSelector(state => state.sclass);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllSclasses(currentUser._id, 'Sclass'));
    }
  }, [dispatch, currentUser]);

  return (
    <Box>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '10px',
            bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AccountBalanceIcon sx={{ color: '#F59E0B', fontSize: 22 }} />
          </Box>
          <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Fees Management
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select a class to view and manage student fee records
        </Typography>
      </Box>

      {/* ── Summary ────────────────────────────────────────────────── */}
      {!loading && sclassesList?.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={`${sclassesList.length} Classes`}
            sx={{ bgcolor: '#EDE9FE', color: '#6C63FF', fontWeight: 700, fontSize: '0.8125rem' }}
          />
        </Box>
      )}

      {/* ── Class Table ─────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sclassesList?.length > 0 ? (
        <Paper elevation={1} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Class</StyledTableCell>
                  <StyledTableCell align="center">Status</StyledTableCell>
                  <StyledTableCell align="right">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sclassesList.map((sclass, index) => (
                  <StyledTableRow key={sclass._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '8px',
                          bgcolor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.875rem', color: '#6C63FF',
                        }}>
                          {index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {sclass.sclassName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label="Active"
                        size="small"
                        sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/Admin/fees/class/${sclass._id}`)}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          boxShadow: 'none',
                          '&:hover': { boxShadow: '0 4px 12px rgba(108,99,255,0.25)' },
                        }}
                      >
                        Manage Fees
                      </Button>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <EmptyState
            type="empty"
            heading="No classes found"
            description="Add classes first, then you can manage fees for each class."
            action={{ label: '+ Add First Class', onClick: () => navigate('/Admin/addclass') }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default FeesHomePage;
