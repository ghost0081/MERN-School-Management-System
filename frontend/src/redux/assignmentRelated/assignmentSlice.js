import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    assignments: [],
    loading: false,
    error: null,
    response: null,
};

const assignmentSlice = createSlice({
    name: 'assignment',
    initialState,
    reducers: {
        getRequest: (state) => { state.loading = true; },
        getSuccess: (state, action) => {
            state.assignments = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => { state.response = action.payload; state.loading = false; state.error = null; },
        getError: (state, action) => { state.loading = false; state.error = action.payload; },
        postDone: (state) => { state.loading = false; state.error = null; state.response = null; },
    },
});

export const { getRequest, getSuccess, getFailed, getError, postDone } = assignmentSlice.actions;
export const assignmentReducer = assignmentSlice.reducer;



