import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    parentsList: [],
    parentDetail: null,
    status: 'idle',
    loading: false,
    response: null,
    error: null,
};

const parentSlice = createSlice({
    name: 'parent',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.status = 'loading';
            state.response = null;
            state.error = null;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.status = 'success';
            state.parentsList = action.payload;
        },
        getDetailSuccess: (state, action) => {
            state.loading = false;
            state.status = 'success';
            state.parentDetail = action.payload;
        },
        postDone: (state) => {
            state.loading = false;
            state.status = 'added';
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.status = 'failed';
            state.response = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.status = 'error';
            state.error = action.payload;
        },
    },
});

export const { getRequest, getSuccess, getDetailSuccess, postDone, getFailed, getError } = parentSlice.actions;
export const parentReducer = parentSlice.reducer;



