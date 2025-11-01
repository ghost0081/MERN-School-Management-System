import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    loading: false,
    error: null,
    response: null,
};

const timetableSlice = createSlice({
    name: 'timetable',
    initialState,
    reducers: {
        getRequest: (state) => { state.loading = true; },
        getSuccess: (state, action) => { state.items = action.payload; state.loading = false; state.error = null; state.response = null; },
        getFailed: (state, action) => { state.response = action.payload; state.loading = false; },
        getError: (state, action) => { state.loading = false; state.error = action.payload; },
        postDone: (state) => { state.loading = false; state.error = null; state.response = null; },
    }
});

export const { getRequest, getSuccess, getFailed, getError, postDone } = timetableSlice.actions;
export const timetableReducer = timetableSlice.reducer;







