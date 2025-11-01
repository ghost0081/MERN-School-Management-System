const router = require('express').Router();

// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

const { adminRegister, adminLogIn, getAdminDetail} = require('../controllers/admin-controller.js');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');
const { createAssignment, listAssignments, submitAssignment, reviewAssignment, setAssignmentStatus } = require('../controllers/assignment-controller.js');
const { createLeave, listTeacherLeaves, listSchoolLeaves, setLeaveStatus } = require('../controllers/leave-controller.js');
const { upsertClassDay, getClassTimetable, getTeacherTimetable } = require('../controllers/timetable-controller.js');
const { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail } = require('../controllers/parent-controller.js');
const { staffRegister, staffLogIn, getStaff, getStaffDetail, updateStaff, deleteStaff, deleteAllStaff, staffAttendance } = require('../controllers/staff-controller.js');
const { getFeesByClass, updateFeeStatus, bulkRegisterFees, getStudentFeeHistory, getFeesSummary } = require('../controllers/fee-controller.js');
const { getPayrollByStaff, getPayrollByEmployee, getPayrollBySchool, updatePayrollStatus, getStaffPayrollHistory, getEmployeePayrollHistory, getPayrollSummary } = require('../controllers/payroll-controller.js');
const { getFinancialAccounting } = require('../controllers/financial-controller.js');

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);

router.get("/Admin/:id", getAdminDetail)
// router.delete("/Admin/:id", deleteAdmin)

// router.put("/Admin/:id", updateAdmin)

// Student

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// Assignment

router.post('/AssignmentCreate', createAssignment); // teacher creates
router.get('/AssignmentList/:scope/:id', listAssignments); // list by scope
router.put('/AssignmentSubmit', submitAssignment); // student submits
router.put('/AssignmentReview', reviewAssignment); // teacher reviews
router.put('/AssignmentSetStatus', setAssignmentStatus); // teacher set status per student

// Leave
router.post('/LeaveCreate', createLeave);
router.get('/LeaveList/teacher/:id', listTeacherLeaves);
router.get('/LeaveList/school/:id', listSchoolLeaves);
router.put('/LeaveStatus/:id', setLeaveStatus);

// Timetable
router.post('/TimetableUpsert', upsertClassDay); // admin
router.get('/TimetableClass/:id', getClassTimetable);
router.get('/TimetableTeacher/:id', getTeacherTimetable);

// Parent
router.post('/ParentLogin', parentLogIn);
router.post('/ParentUpsert', upsertParent);
router.get('/Parents/:id', listParents); // by school
router.get('/Parent/:id', parentDetail);

// Staff
router.post('/StaffReg', staffRegister);
router.post('/StaffLogin', staffLogIn);
router.get('/Staff/:id', getStaffDetail);
router.get('/Staffs/:id', getStaff); // by school
router.put('/Staff/:id', updateStaff);
router.delete('/Staff/:id', deleteStaff);
router.delete('/Staffs/:id', deleteAllStaff); // delete all by school
router.put('/StaffAttendance/:id', staffAttendance);

// Fees
router.get('/Fees/Class', getFeesByClass); // ?classId=&month=&schoolId=
router.put('/Fees/Status', updateFeeStatus); // update/create fee
router.post('/Fees/BulkRegister', bulkRegisterFees); // bulk register fees for class
router.get('/Fees/Student/:studentId', getStudentFeeHistory);
router.get('/Fees/Summary', getFeesSummary); // ?schoolId=&month=

// Payroll
router.get('/Payroll/Staff', getPayrollByStaff); // ?staffId=&month=&schoolId= (legacy)
router.get('/Payroll/Employee', getPayrollByEmployee); // ?employeeId=&employeeType=&month=&schoolId=
router.get('/Payroll/School', getPayrollBySchool); // ?schoolId=&month=
router.put('/Payroll/Status', updatePayrollStatus); // update/create payroll
router.get('/Payroll/Staff/:staffId', getStaffPayrollHistory); // legacy
router.get('/Payroll/Employee/:employeeType/:employeeId', getEmployeePayrollHistory); // Get history by employee type and ID
router.get('/Payroll/Summary', getPayrollSummary); // ?schoolId=&month=

// Financial Accounting
router.get('/Financial/Accounting', getFinancialAccounting); // ?schoolId=&year=&month=

module.exports = router;