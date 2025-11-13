import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: false,
    visitors: [],
    recentVisitor: null,
    error: null,
    response: null,
};

const visitorSlice = createSlice({
    name: 'visitor',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.visitors = action.payload;
            state.loading = false;
            state.error = null;
        },
        createSuccess: (state, action) => {
            state.recentVisitor = action.payload;
            state.visitors = [action.payload, ...state.visitors];
            state.loading = false;
        },
        updateSuccess: (state, action) => {
            const updated = action.payload;
            state.visitors = state.visitors.map((item) =>
                item._id === updated._id ? updated : item
            );
            state.loading = false;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearRecentVisitor: (state) => {
            state.recentVisitor = null;
        },
    },
});

export const {
    getRequest,
    getSuccess,
    createSuccess,
    updateSuccess,
    getFailed,
    getError,
    clearRecentVisitor,
} = visitorSlice.actions;

export const visitorReducer = visitorSlice.reducer;

