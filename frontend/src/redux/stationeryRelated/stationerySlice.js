import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    stationeryList: [],
    invoiceList: [],
    stationeryDetail: null,
    invoiceDetail: null,
    loading: false,
    error: null,
    response: null,
    status: 'idle',
};

const stationerySlice = createSlice({
    name: 'stationery',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.status = 'loading';
        },
        getSuccess: (state, action) => {
            state.stationeryList = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
        },
        getDetailSuccess: (state, action) => {
            state.stationeryDetail = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
        },
        getInvoicesSuccess: (state, action) => {
            state.invoiceList = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
        },
        getInvoiceDetailSuccess: (state, action) => {
            state.invoiceDetail = action.payload;
            state.loading = false;
            state.status = 'success';
            state.error = null;
        },
        postDone: (state) => {
            state.loading = false;
            state.status = 'added';
            state.error = null;
            state.response = null;
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
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
            state.error = null;
        },
    },
});

export const { getRequest, getSuccess, getDetailSuccess, getInvoicesSuccess, getInvoiceDetailSuccess, postDone, getFailed, getError, underControl } = stationerySlice.actions;
export default stationerySlice.reducer;


