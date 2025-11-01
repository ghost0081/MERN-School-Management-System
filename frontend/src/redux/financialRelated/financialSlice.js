import { createSlice } from '@reduxjs/toolkit';

const financialSlice = createSlice({
    name: 'financial',
    initialState: {
        financialData: null,
        loading: false,
        error: null,
    },
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.financialData = action.payload;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload?.response?.data?.message || 'Network error';
        },
    },
});

export const { getRequest, getSuccess, getFailed, getError } = financialSlice.actions;
export default financialSlice.reducer;

