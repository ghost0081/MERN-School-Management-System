import React, { useState } from 'react'
import { Box, Paper, Typography, TablePagination } from '@mui/material';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    
    return (
        <Box sx={{ width: '100%' }}>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <Paper
                    key={row.id}
                    sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        border: '1px solid #EAEAEC',
                        gap: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.06)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, width: '100%' }}>
                        {columns.map((column) => {
                            const value = row[column.id];
                            return (
                                <Box key={column.id} sx={{ minWidth: column.minWidth ? column.minWidth / 1.5 : 120 }}>
                                    <Typography variant="caption" sx={{ color: '#8B8B8B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                                        {column.label}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E1E1E', wordBreak: 'break-word' }}>
                                        {column.format && typeof value === 'number'
                                            ? column.format(value)
                                            : (value || '-')}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                    {ButtonHaver && (
                        <Box sx={{ 
                            display: 'flex', 
                            flexShrink: 0, 
                            gap: 1, 
                            alignItems: 'center',
                            mt: { xs: 2, md: 0 },
                            width: { xs: '100%', md: 'auto' },
                            justifyContent: { xs: 'flex-end', md: 'center' },
                            paddingLeft: { xs: 0, md: 3 },
                            borderLeft: { xs: 'none', md: '1px solid #EAEAEC' }
                        }}>
                            <ButtonHaver row={row} />
                        </Box>
                    )}
                </Paper>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    sx={{
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            fontWeight: 600,
                            color: '#8B8B8B'
                        },
                        border: 'none'
                    }}
                />
            </Box>
        </Box>
    )
}

export default TableTemplate