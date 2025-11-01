import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    feesList: [], // For class fees list
    studentFeesList: [], // For student fee history
    feeSummary: null,
    loading: false,
    error: null,
    response: null,
    status: 'idle',
};

const feeSlice = createSlice({
    name: 'fee',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.status = 'loading';
        },
        getSuccess: (state, action) => {
            state.feesList = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
            state.response = null;
        },
        getStudentFeesSuccess: (state, action) => {
            state.studentFeesList = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
            state.response = null;
        },
        getSummarySuccess: (state, action) => {
            state.feeSummary = action.payload;
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

export const { getRequest, getSuccess, getStudentFeesSuccess, getSummarySuccess, getFailed, getError, postDone, underControl } = feeSlice.actions;
export const feeReducer = feeSlice.reducer;

