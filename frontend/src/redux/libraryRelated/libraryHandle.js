import axios from 'axios';
import {
    getRequest,
    searchSuccess,
    importPreviewSuccess,
    importSuccess,
    copiesSuccess,
    createCopySuccess,
    getFailed,
    getError,
} from './librarySlice';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

// Search books
export const searchBooks = (query, page = 1, limit = 20) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const params = { q: query, page, limit };
        const result = await axios.get(`${BASE_URL}/Books`, { params });
        if (result.data?.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(searchSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// Preview import (dry run)
export const previewImport = (file) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await axios.post(`${BASE_URL}/Books/Import?dryRun=true`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (result.data?.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(importPreviewSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// Import books (actual import)
export const importBooks = (file) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await axios.post(`${BASE_URL}/Books/Import?dryRun=false`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (result.data?.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(importSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// List copies
export const fetchCopies = (bookId = null) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const params = bookId ? { bookId } : {};
        const result = await axios.get(`${BASE_URL}/Copies`, { params });
        if (result.data?.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(copiesSuccess(result.data || []));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// Create a copy
export const createCopy = (payload) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.post(`${BASE_URL}/Copies`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data?.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(createCopySuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

