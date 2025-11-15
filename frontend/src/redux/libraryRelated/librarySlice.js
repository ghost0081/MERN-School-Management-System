import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: false,
    books: [],
    copies: [],
    searchResults: {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
    },
    importPreview: null,
    importResult: null,
    error: null,
    response: null,
};

const librarySlice = createSlice({
    name: 'library',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        searchSuccess: (state, action) => {
            state.searchResults = action.payload;
            state.books = action.payload.data;
            state.loading = false;
            state.error = null;
        },
        importPreviewSuccess: (state, action) => {
            state.importPreview = action.payload;
            state.loading = false;
            state.error = null;
        },
        importSuccess: (state, action) => {
            state.importResult = action.payload;
            state.loading = false;
            state.error = null;
        },
        copiesSuccess: (state, action) => {
            state.copies = action.payload;
            state.loading = false;
            state.error = null;
        },
        createCopySuccess: (state, action) => {
            state.copies = [action.payload, ...state.copies];
            state.loading = false;
            state.error = null;
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
        clearImportPreview: (state) => {
            state.importPreview = null;
        },
        clearImportResult: (state) => {
            state.importResult = null;
        },
    },
});

export const {
    getRequest,
    searchSuccess,
    importPreviewSuccess,
    importSuccess,
    copiesSuccess,
    createCopySuccess,
    getFailed,
    getError,
    clearImportPreview,
    clearImportResult,
} = librarySlice.actions;

export const libraryReducer = librarySlice.reducer;

