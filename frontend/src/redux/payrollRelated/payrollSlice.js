import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    payrollList: [], // For school payroll list
    staffPayroll: null, // For single staff payroll
    staffPayrollHistory: [], // For staff payroll history
    payrollSummary: null,
    loading: false,
    error: null,
    response: null,
    status: 'idle',
};

const payrollSlice = createSlice({
    name: 'payroll',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.status = 'loading';
        },
        getSuccess: (state, action) => {
            state.payrollList = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
            state.response = null;
        },
        getStaffPayrollSuccess: (state, action) => {
            state.staffPayroll = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
            state.response = null;
        },
        getStaffPayrollHistorySuccess: (state, action) => {
            state.staffPayrollHistory = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
        },
        getSummarySuccess: (state, action) => {
            state.payrollSummary = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.status = 'failed';
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.status = 'error';
        },
        postDone: (state) => {
            state.loading = false;
            state.status = 'added';
            state.error = null;
            state.response = null;
        },
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
            state.error = null;
        },
    },
});

export const { getRequest, getSuccess, getStaffPayrollSuccess, getStaffPayrollHistorySuccess, getSummarySuccess, getFailed, getError, postDone, underControl } = payrollSlice.actions;
export const payrollReducer = payrollSlice.reducer;

