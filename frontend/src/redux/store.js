import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';
import { assignmentReducer } from './assignmentRelated/assignmentSlice';
import { leaveReducer } from './leaveRelated/leaveSlice';
import { timetableReducer } from './timetableRelated/timetableSlice';
import { parentReducer } from './parentRelated/parentSlice';
import { staffReducer } from './staffRelated/staffSlice';
import { feeReducer } from './feeRelated/feeSlice';
import { payrollReducer } from './payrollRelated/payrollSlice';
import financialReducer from './financialRelated/financialSlice';
import stationeryReducer from './stationeryRelated/stationerySlice';
import { reportReducer } from './reportRelated/reportSlice';
import { visitorReducer } from './visitorRelated/visitorSlice';
import { libraryReducer } from './libraryRelated/librarySlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        complain: complainReducer,
        sclass: sclassReducer,
        assignment: assignmentReducer,
        leave: leaveReducer,
        timetable: timetableReducer,
        parent: parentReducer,
        staff: staffReducer,
        fee: feeReducer,
        payroll: payrollReducer,
        financial: financialReducer,
        stationery: stationeryReducer,
        report: reportReducer,
        visitor: visitorReducer,
        library: libraryReducer,
    },
});

export default store;
