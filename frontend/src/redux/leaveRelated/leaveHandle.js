import axios from 'axios';
import { getRequest, getSuccess, getFailed, getError, postDone } from './leaveSlice';

export const createLeave = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.post(`${process.env.REACT_APP_BASE_URL}/LeaveCreate`, fields, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherLeaves = (teacherId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/LeaveList/teacher/${teacherId}`);
        if (result.data.message) dispatch(getFailed(result.data.message));
        else dispatch(getSuccess(result.data));
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSchoolLeaves = (schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/LeaveList/school/${schoolId}`);
        if (result.data.message) dispatch(getFailed(result.data.message));
        else dispatch(getSuccess(result.data));
    } catch (error) {
        dispatch(getError(error));
    }
}

export const setLeaveStatus = (leaveId, status) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.put(`${process.env.REACT_APP_BASE_URL}/LeaveStatus/${leaveId}`, { status }, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}








