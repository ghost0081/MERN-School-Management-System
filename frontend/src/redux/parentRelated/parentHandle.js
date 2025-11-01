import axios from 'axios';
import { getRequest, getSuccess, getDetailSuccess, getFailed, getError, postDone } from './parentSlice';

export const getParents = (schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parents/${schoolId}`);
        dispatch(getSuccess(res.data || []));
    } catch (error) {
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
        await axios.post(`${process.env.REACT_APP_BASE_URL}/ParentUpsert`, fields, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}


