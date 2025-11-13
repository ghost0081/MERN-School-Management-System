import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: false,
    attendance: null,
    fees: null,
    error: null,
    response: null,
};

const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        attendanceSuccess: (state, action) => {
            state.attendance = action.payload;
            state.loading = false;
            state.error = null;
        },
        feesSuccess: (state, action) => {
            state.fees = action.payload;
            state.loading = false;
            state.error = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearReports: (state) => {
            state.attendance = null;
            state.fees = null;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
    },
});

export const { getRequest, attendanceSuccess, feesSuccess, getFailed, getError, clearReports } = reportSlice.actions;
export const reportReducer = reportSlice.reducer;

