import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    staffList: [],
    staffDetails: null,
    loading: false,
    error: null,
    response: null,
    status: 'idle',
};

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.status = 'loading';
        },
        doneSuccess: (state, action) => {
            state.staffDetails = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.staffList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'failed';
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.status = 'error';
        },
        postDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.status = 'added';
        },
        underStaffControl: (state) => {
            state.loading = false;
            state.response = null;
            state.error = null;
            state.status = 'idle';
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    doneSuccess,
    postDone,
    underStaffControl
} = staffSlice.actions;

export const staffReducer = staffSlice.reducer;

