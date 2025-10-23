import axios from 'axios';
import { getRequest, getSuccess, getDetailSuccess, getFailed, getError, postDone } from './parentSlice';

export const getParents = (schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        console.log('Fetching parents from API for school:', schoolId);
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parents/${schoolId}`);
        console.log('Parents API response:', res.data);
        // Always dispatch success, even if array is empty
        dispatch(getSuccess(res.data || []));
    } catch (error) {
        console.error('Error fetching parents:', error);
        dispatch(getError(error));
    }
}

export const getParentDetails = (parentId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parent/${parentId}`);
        if (res.data.message) return dispatch(getFailed(res.data.message));
        dispatch(getDetailSuccess(res.data));
    } catch (error) {
        dispatch(getError(error));
    }
}

export const upsertParent = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        console.log('Creating parent with fields:', fields);
        const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/ParentUpsert`, fields, { headers: { 'Content-Type': 'application/json' } });
        console.log('Parent creation response:', res.data);
        dispatch(postDone());
    } catch (error) {
        console.error('Error creating parent:', error);
        dispatch(getError(error));
    }
}


