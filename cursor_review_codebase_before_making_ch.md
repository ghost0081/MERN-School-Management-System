# Review codebase before making changes
_Exported on 11/13/2025 at 19:05:37 GMT+5:30 from Cursor (2.0.69)_

---

**User**

read the codebase properly you have to make changes

---

**Cursor**

Reviewing the codebase to understand the structure and identify required changes. Starting with the open file and project structure.


Exploring the codebase structure to understand the architecture and identify required changes.


Reviewing key components and Redux setup to understand the patterns:


---

**User**

check in the code why it is not showing me the parents lists

---

**Cursor**

Investigating why the parents list isn't showing. Checking the parent list component, API endpoint, and data flow.


Reviewing the parent-related files to identify the issue:


Checking the parent slice and environment configuration:


Checking how other handle files handle the BASE_URL to identify the issue:


Identifying issues:
1. Errors are caught but not logged, so failures are silent.
2. The UI doesn't show error messages.
3. `REACT_APP_BASE_URL` may be undefined.

Fixing these:


Fixing the issues: adding error handling and logging, and ensuring the BASE_URL is set correctly.


```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getParents } from '../../../redux/parentRelated/parentHandle';
import TableTemplate from '../../../components/TableTemplate';
import { Paper, Box, Typography, Alert } from '@mui/material';
import Popup from '../../../components/Popup';

const ShowParents = () => {
    const dispatch = useDispatch();
    const { parentsList, loading, error, response, status } = useSelector((state) => state.parent);
    const { currentUser } = useSelector((state) => state.user);
    
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (currentUser) {
            dispatch(getParents(currentUser._id));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === 'error') {
            const errorMessage = error?.response?.data?.message || error?.message || "Network Error. Please check your connection and try again.";
            setMessage(errorMessage);
            setShowPopup(true);
            console.error("Error fetching parents:", error);
        } else if (status === 'failed') {
            setMessage(response || "Failed to load parents");
            setShowPopup(true);
        }
    }, [status, error, response]);

    const columns = [
        { id: 'name', label: 'Parent Name', minWidth: 150 },
        { id: 'studentName', label: 'Student Name', minWidth: 150 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 120 },
        { id: 'mobile', label: 'Mobile Number', minWidth: 150 },
        { id: 'className', label: 'Class', minWidth: 100 },
    ];

    const rows = parentsList.map((parent) => ({
        name: parent.name,
        studentName: parent.student?.name || 'N/A',
        rollNum: parent.student?.rollNum || 'N/A',
        mobile: parent.mobile,
        className: parent.student?.sclassName?.sclassName || 'N/A',
    }));

    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Typography variant="h4" sx={{ padding: 2, textAlign: 'center', fontWeight: 'bold' }}>
                    Parents List
                </Typography>
                {status === 'error' && (
                    <Alert severity="error" sx={{ margin: 2 }}>
                        Failed to load parents. Please refresh the page or check your connection.
                    </Alert>
                )}
                {parentsList.length === 0 && !loading && status !== 'error' ? (
                    <Typography variant="h6" sx={{ padding: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No parents found. Add students with parent details to see them here.
                    </Typography>
                ) : (
                    <TableTemplate
                        columns={columns}
                        rows={rows}
                        loading={loading}
                    />
                )}
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowParents;

```

```javascript
import axios from 'axios';
import { getRequest, getSuccess, getDetailSuccess, getFailed, getError, postDone } from './parentSlice';

// Fallback for BASE_URL if environment variable is not set
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const getParents = (schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const url = `${BASE_URL}/Parents/${schoolId}`;
        console.log('Fetching parents from:', url);
        const res = await axios.get(url);
        console.log('Parents response:', res.data);
        dispatch(getSuccess(res.data || []));
    } catch (error) {
        console.error('Error fetching parents:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
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



```

```javascript
import axios from 'axios';
import { getRequest, getSuccess, getDetailSuccess, getFailed, getError, postDone } from './parentSlice';

// Fallback for BASE_URL if environment variable is not set
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const getParents = (schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const url = `${BASE_URL}/Parents/${schoolId}`;
        console.log('Fetching parents from:', url);
        const res = await axios.get(url);
        console.log('Parents response:', res.data);
        dispatch(getSuccess(res.data || []));
    } catch (error) {
        console.error('Error fetching parents:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        dispatch(getError(error));
    }
}

export const getParentDetails = (parentId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const res = await axios.get(`${BASE_URL}/Parent/${parentId}`);
        if (res.data.message) return dispatch(getFailed(res.data.message));
        dispatch(getDetailSuccess(res.data));
    } catch (error) {
        console.error('Error fetching parent details:', error);
        dispatch(getError(error));
    }
}

export const upsertParent = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        console.log('Creating/updating parent with fields:', fields);
        const res = await axios.post(`${BASE_URL}/ParentUpsert`, fields, { headers: { 'Content-Type': 'application/json' } });
        console.log('Parent upsert response:', res.data);
        dispatch(postDone());
    } catch (error) {
        console.error('Error upserting parent:', error);
        dispatch(getError(error));
    }
}



```

Checking for linting errors and verifying the backend route:


Adding backend logging to help debug. Updating the todos:


```javascript
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');

// login with roll number and last 5 digits of parent's mobile
const parentLogIn = async (req, res) => {
    try {
        const { rollNum, password } = req.body; // password: last 5 of mobile
        const student = await Student.findOne({ rollNum }).populate('school', 'schoolName');
        if (!student) return res.send({ message: 'Student not found' });
        const parent = await Parent.findOne({ student: student._id });
        if (!parent) return res.send({ message: 'Parent not found' });
        const last5 = (parent.mobile || '').slice(-5);
        if (last5 !== password) return res.send({ message: 'Invalid password' });
        const payload = { _id: parent._id, name: parent.name, role: 'Parent', student: student._id, school: student.school };
        res.send(payload);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent for a student
const upsertParentForStudent = async (req, res) => {
    try {
        const { studentId, name, mobile, email, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: studentId },
            { name, mobile, email, school, student: studentId },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent (new function for frontend compatibility)
const upsertParent = async (req, res) => {
    try {
        const { name, mobile, student, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const schoolId = req.params.id;
        console.log('Fetching parents for school:', schoolId);
        const items = await Parent.find({ school: schoolId })
            .populate('student', 'name rollNum')
            .populate({
                path: 'student',
                populate: {
                    path: 'sclassName',
                    model: 'Sclass'
                }
            });
        console.log(`Found ${items.length} parents for school ${schoolId}`);
        res.send(items);
    } catch (error) {
        console.error('Error in listParents:', error);
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id).populate('student', 'name rollNum sclassName');
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };



```

```javascript
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');

// login with roll number and last 5 digits of parent's mobile
const parentLogIn = async (req, res) => {
    try {
        const { rollNum, password } = req.body; // password: last 5 of mobile
        const student = await Student.findOne({ rollNum }).populate('school', 'schoolName');
        if (!student) return res.send({ message: 'Student not found' });
        const parent = await Parent.findOne({ student: student._id });
        if (!parent) return res.send({ message: 'Parent not found' });
        const last5 = (parent.mobile || '').slice(-5);
        if (last5 !== password) return res.send({ message: 'Invalid password' });
        const payload = { _id: parent._id, name: parent.name, role: 'Parent', student: student._id, school: student.school };
        res.send(payload);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent for a student
const upsertParentForStudent = async (req, res) => {
    try {
        const { studentId, name, mobile, email, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: studentId },
            { name, mobile, email, school, student: studentId },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent (new function for frontend compatibility)
const upsertParent = async (req, res) => {
    try {
        const { name, mobile, student, school } = req.body;
        console.log('Upserting parent:', { name, mobile, student, school });
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        console.log('Parent upserted successfully:', parent._id);
        res.send(parent);
    } catch (error) {
        console.error('Error in upsertParent:', error);
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const schoolId = req.params.id;
        console.log('Fetching parents for school:', schoolId);
        const items = await Parent.find({ school: schoolId })
            .populate('student', 'name rollNum')
            .populate({
                path: 'student',
                populate: {
                    path: 'sclassName',
                    model: 'Sclass'
                }
            });
        console.log(`Found ${items.length} parents for school ${schoolId}`);
        res.send(items);
    } catch (error) {
        console.error('Error in listParents:', error);
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id).populate('student', 'name rollNum sclassName');
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };



```

## Issues found

1. No error handling in the UI — errors were caught but not shown
2. No logging — API failures were silent
3. Missing BASE_URL fallback — if `REACT_APP_BASE_URL` wasn't set, API calls failed

## Fixes applied

### 1. Frontend - ShowParents component (`ShowParents.js`)
- Added error state handling from Redux
- Added error alert display
- Added popup for error messages
- Improved empty state logic to distinguish between "no data" and "error"

### 2. Frontend - Parent API handler (`parentHandle.js`)
- Added BASE_URL fallback: `process.env.REACT_APP_BASE_URL || "http://localhost:5000"`
- Added console logging for API calls and responses
- Added detailed error logging with request/response info
- Updated all API calls to use the BASE_URL constant

### 3. Backend - Parent controller (`parent-controller.js`)
- Added logging in `listParents` to show school ID and count
- Added logging in `upsertParent` for debugging parent creation

## How to debug

1. Check the browser console (F12) for:
   - The API URL being called
   - Response data
   - Error details if something fails

2. Check the backend console for:
   - School ID being queried
   - Number of parents found
   - Any errors

3. The UI will show:
   - Error alerts if the API call fails
   - Popup messages with specific error details
   - Clear distinction between "no parents" and "error loading"

## Next steps

1. Refresh the page and check the browser console
2. Verify the backend is running on port 5000
3. Confirm students were added with parent details (parents are created when students are registered)
4. Check the network tab in DevTools to see the actual API request/response

The parents list should now work, and if there are issues, you'll see clear error messages instead of a silent failure.

---

**User**

@node (53-104) getting this error fix the codebase for the parents list for the students

---

**Cursor**

The error is that the `Sclass` model isn't registered when populating. Fixing by importing the `Sclass` model in the parent controller:


Checking how other controllers use the Sclass model:


Checking the student schema to see how sclassName is referenced:


The student schema uses `ref: 'sclass'` (lowercase), but the populate uses `model: 'Sclass'` (capitalized). Fixing by importing the Sclass model and using the correct model name:


```javascript
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');
const Sclass = require('../models/sclassSchema.js');

// login with roll number and last 5 digits of parent's mobile
const parentLogIn = async (req, res) => {
    try {
        const { rollNum, password } = req.body; // password: last 5 of mobile
        const student = await Student.findOne({ rollNum }).populate('school', 'schoolName');
        if (!student) return res.send({ message: 'Student not found' });
        const parent = await Parent.findOne({ student: student._id });
        if (!parent) return res.send({ message: 'Parent not found' });
        const last5 = (parent.mobile || '').slice(-5);
        if (last5 !== password) return res.send({ message: 'Invalid password' });
        const payload = { _id: parent._id, name: parent.name, role: 'Parent', student: student._id, school: student.school };
        res.send(payload);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent for a student
const upsertParentForStudent = async (req, res) => {
    try {
        const { studentId, name, mobile, email, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: studentId },
            { name, mobile, email, school, student: studentId },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent (new function for frontend compatibility)
const upsertParent = async (req, res) => {
    try {
        const { name, mobile, student, school } = req.body;
        console.log('Upserting parent:', { name, mobile, student, school });
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        console.log('Parent upserted successfully:', parent._id);
        res.send(parent);
    } catch (error) {
        console.error('Error in upsertParent:', error);
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const schoolId = req.params.id;
        console.log('Fetching parents for school:', schoolId);
        const items = await Parent.find({ school: schoolId })
            .populate('student', 'name rollNum')
            .populate({
                path: 'student',
                populate: {
                    path: 'sclassName',
                    model: 'Sclass'
                }
            });
        console.log(`Found ${items.length} parents for school ${schoolId}`);
        res.send(items);
    } catch (error) {
        console.error('Error in listParents:', error);
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id).populate('student', 'name rollNum sclassName');
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };



```

```javascript
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');
const Sclass = require('../models/sclassSchema.js');

// login with roll number and last 5 digits of parent's mobile
const parentLogIn = async (req, res) => {
    try {
        const { rollNum, password } = req.body; // password: last 5 of mobile
        const student = await Student.findOne({ rollNum }).populate('school', 'schoolName');
        if (!student) return res.send({ message: 'Student not found' });
        const parent = await Parent.findOne({ student: student._id });
        if (!parent) return res.send({ message: 'Parent not found' });
        const last5 = (parent.mobile || '').slice(-5);
        if (last5 !== password) return res.send({ message: 'Invalid password' });
        const payload = { _id: parent._id, name: parent.name, role: 'Parent', student: student._id, school: student.school };
        res.send(payload);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent for a student
const upsertParentForStudent = async (req, res) => {
    try {
        const { studentId, name, mobile, email, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: studentId },
            { name, mobile, email, school, student: studentId },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent (new function for frontend compatibility)
const upsertParent = async (req, res) => {
    try {
        const { name, mobile, student, school } = req.body;
        console.log('Upserting parent:', { name, mobile, student, school });
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        console.log('Parent upserted successfully:', parent._id);
        res.send(parent);
    } catch (error) {
        console.error('Error in upsertParent:', error);
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const schoolId = req.params.id;
        console.log('Fetching parents for school:', schoolId);
        const items = await Parent.find({ school: schoolId })
            .populate({
                path: 'student',
                select: 'name rollNum sclassName',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            });
        console.log(`Found ${items.length} parents for school ${schoolId}`);
        res.send(items);
    } catch (error) {
        console.error('Error in listParents:', error);
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id).populate('student', 'name rollNum sclassName');
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };



```

```javascript
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');
const Sclass = require('../models/sclassSchema.js');

// login with roll number and last 5 digits of parent's mobile
const parentLogIn = async (req, res) => {
    try {
        const { rollNum, password } = req.body; // password: last 5 of mobile
        const student = await Student.findOne({ rollNum }).populate('school', 'schoolName');
        if (!student) return res.send({ message: 'Student not found' });
        const parent = await Parent.findOne({ student: student._id });
        if (!parent) return res.send({ message: 'Parent not found' });
        const last5 = (parent.mobile || '').slice(-5);
        if (last5 !== password) return res.send({ message: 'Invalid password' });
        const payload = { _id: parent._id, name: parent.name, role: 'Parent', student: student._id, school: student.school };
        res.send(payload);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent for a student
const upsertParentForStudent = async (req, res) => {
    try {
        const { studentId, name, mobile, email, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: studentId },
            { name, mobile, email, school, student: studentId },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent (new function for frontend compatibility)
const upsertParent = async (req, res) => {
    try {
        const { name, mobile, student, school } = req.body;
        console.log('Upserting parent:', { name, mobile, student, school });
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        console.log('Parent upserted successfully:', parent._id);
        res.send(parent);
    } catch (error) {
        console.error('Error in upsertParent:', error);
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const schoolId = req.params.id;
        console.log('Fetching parents for school:', schoolId);
        const items = await Parent.find({ school: schoolId })
            .populate({
                path: 'student',
                select: 'name rollNum sclassName',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            });
        console.log(`Found ${items.length} parents for school ${schoolId}`);
        res.send(items);
    } catch (error) {
        console.error('Error in listParents:', error);
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id)
            .populate({
                path: 'student',
                select: 'name rollNum sclassName',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            });
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        console.error('Error in parentDetail:', error);
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };



```

Verifying the fix and checking for issues:


## Problem
The error `MissingSchemaError: Schema hasn't been registered for model "Sclass"` occurred because:
1. The `Sclass` model wasn't imported in `parent-controller.js`
2. The populate used `model: 'Sclass'` (capitalized) while the schema registers it as `'sclass'` (lowercase)

## Solution
1. Added the Sclass import at the top of the file
2. Updated the populate to use nested populate without explicitly specifying the model name, letting Mongoose infer it from the `ref: 'sclass'` in the student schema
3. Used `select` to specify which fields to populate

## Changes made

**File: `backend/controllers/parent-controller.js`**
- Added: `const Sclass = require('../models/sclassSchema.js');`
- Updated `listParents()` to use nested populate without the explicit model name
- Updated `parentDetail()` to use the same nested populate structure

The parents list should now work. The backend will:
- Register the Sclass model when the controller loads
- Populate student and class information correctly
- Return parents with their associated student and class data

Restart the backend server and try loading the parents list again. The error should be resolved.

---

**User**

it should be as per class first fee managment structure first show me all classes then when i click on a partiular class it will show me the parents name and student name roll no moblie no in parents part not in fees prt

---

**Cursor**

Updating the parents list to show classes first; clicking a class shows parents and students for that class. Checking the current structure:


Checking the routing structure and creating the class-based parents view:


Creating the class-based parents view. Updating ShowParents to show classes first, then creating a component to show parents by class:


```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Box, CircularProgress } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const ShowParents = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList, loading } = useSelector(state => state.sclass);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, 'Sclass'));
        }
    }, [dispatch, currentUser]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Parents Management
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Select a class to view parents and students
            </Typography>
            
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Class Name</StyledTableCell>
                                <StyledTableCell align="right">Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {sclassesList.length > 0 ? (
                                sclassesList.map((sclass) => (
                                    <StyledTableRow key={sclass._id}>
                                        <TableCell>{sclass.sclassName}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/Admin/parents/class/${sclass._id}`)}
                                            >
                                                View Parents
                                            </Button>
                                        </TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={2} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No classes found. Please add classes first.
                                        </Typography>
                                    </TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default ShowParents;

```

```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getParents } from '../../../redux/parentRelated/parentHandle';
import { Paper, Box, Typography, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import Popup from '../../../components/Popup';

const ClassParentsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // classId
    const { parentsList, loading, error, response, status } = useSelector((state) => state.parent);
    const { currentUser } = useSelector((state) => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);
    
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Get class name
    const currentClass = sclassesList.find(sclass => sclass._id === id);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParents(currentUser._id));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === 'error') {
            const errorMessage = error?.response?.data?.message || error?.message || "Network Error. Please check your connection and try again.";
            setMessage(errorMessage);
            setShowPopup(true);
            console.error("Error fetching parents:", error);
        } else if (status === 'failed') {
            setMessage(response || "Failed to load parents");
            setShowPopup(true);
        }
    }, [status, error, response]);

    // Filter parents by class
    const classParents = parentsList.filter(parent => {
        const studentClassId = parent.student?.sclassName?._id || parent.student?.sclassName;
        return studentClassId === id;
    });

    if (loading && parentsList.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Parents & Students - {currentClass?.sclassName || 'Class'}
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/Admin/parents')}>
                    Back to Classes
                </Button>
            </Box>

            {status === 'error' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load parents. Please refresh the page or check your connection.
                </Alert>
            )}

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Parent Name</StyledTableCell>
                                <StyledTableCell>Student Name</StyledTableCell>
                                <StyledTableCell>Roll Number</StyledTableCell>
                                <StyledTableCell>Mobile Number</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {classParents.length > 0 ? (
                                classParents.map((parent) => (
                                    <StyledTableRow key={parent._id}>
                                        <TableCell>{parent.name}</TableCell>
                                        <TableCell>{parent.student?.name || 'N/A'}</TableCell>
                                        <TableCell>{parent.student?.rollNum || 'N/A'}</TableCell>
                                        <TableCell>{parent.mobile || 'N/A'}</TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                            {loading ? 'Loading...' : 'No parents found for this class. Add students with parent details to see them here.'}
                                        </Typography>
                                    </TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ClassParentsPage;

```

```javascript
import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer, drawerWidth } from '../../components/styles';
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';
import AdminTimetable from './timetable/AdminTimetable';
import AdminTimetableHome from './timetable/AdminTimetableHome';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';
import TeacherLeavePage from './TeacherLeavePage';
import ShowParents from './parentRelated/ShowParents';
import ClassParentsPage from './parentRelated/ClassParentsPage';
import ShowStaff from './staffRelated/ShowStaff';
import AddStaff from './staffRelated/AddStaff';
import StaffDetails from './staffRelated/StaffDetails';
import FeesHomePage from './feesRelated/FeesHomePage';
import ClassFeesPage from './feesRelated/ClassFeesPage';
import PayrollHomePage from './payrollRelated/PayrollHomePage';
import StaffPayrollPage from './payrollRelated/StaffPayrollPage';
import AddStationery from './stationeryRelated/AddStationery';
import StationeryInvoices from './stationeryRelated/StationeryInvoices';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Admin Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <SideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={(theme) => ({
                    ...styles.boxStyled,
                    width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${theme.spacing(7)})`,
                    transition: theme.transitions.create(['width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    [theme.breakpoints.up('sm')]: {
                        width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${theme.spacing(9)})`,
                    },
                })}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />
                        <Route path="/Admin/complains" element={<SeeComplains />} />

                        {/* Notice */}
                        <Route path="/Admin/addnotice" element={<AddNotice />} />
                        <Route path="/Admin/notices" element={<ShowNotices />} />

                        {/* Subject */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />

                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />

                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/timetable" element={<AdminTimetableHome />} />
                        <Route path="/Admin/timetable/:id" element={<AdminTimetable />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        <Route path="/Admin/teacher-leave" element={<TeacherLeavePage />} />
                        <Route path="/Admin/parents" element={<ShowParents />} />
                        
                        {/* Staff */}
                        <Route path="/Admin/staff" element={<ShowStaff />} />
                        <Route path="/Admin/addstaff" element={<AddStaff />} />
                        <Route path="/Admin/staff/:id" element={<StaffDetails />} />

                        {/* Fees */}
                        <Route path="/Admin/fees" element={<FeesHomePage />} />
                        <Route path="/Admin/fees/class/:id" element={<ClassFeesPage />} />

                        {/* Payroll */}
                        <Route path="/Admin/payroll" element={<PayrollHomePage />} />
                        <Route path="/Admin/payroll/staff/:id" element={<StaffPayrollPage />} />
                        <Route path="/Admin/payroll/teacher/:id" element={<StaffPayrollPage />} />

                        {/* Stationery */}
                        <Route path="/Admin/stationery" element={<AddStationery />} />
                        <Route path="/Admin/invoices" element={<StationeryInvoices />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default AdminDashboard

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        // Custom scrollbar for main content
        '&::-webkit-scrollbar': {
            width: '12px',
        },
        '&::-webkit-scrollbar-track': {
            background: (theme) => theme.palette.mode === 'light' ? '#f1f1f1' : '#2a2a2a',
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: (theme) => theme.palette.mode === 'light' ? '#888' : '#555',
            borderRadius: '10px',
            '&:hover': {
                background: (theme) => theme.palette.mode === 'light' ? '#555' : '#777',
            },
        },
        // Firefox scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: (theme) => theme.palette.mode === 'light' ? '#888 #f1f1f1' : '#555 #2a2a2a',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}
```

```javascript
import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer, drawerWidth } from '../../components/styles';
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';
import AdminTimetable from './timetable/AdminTimetable';
import AdminTimetableHome from './timetable/AdminTimetableHome';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';
import TeacherLeavePage from './TeacherLeavePage';
import ShowParents from './parentRelated/ShowParents';
import ClassParentsPage from './parentRelated/ClassParentsPage';
import ShowStaff from './staffRelated/ShowStaff';
import AddStaff from './staffRelated/AddStaff';
import StaffDetails from './staffRelated/StaffDetails';
import FeesHomePage from './feesRelated/FeesHomePage';
import ClassFeesPage from './feesRelated/ClassFeesPage';
import PayrollHomePage from './payrollRelated/PayrollHomePage';
import StaffPayrollPage from './payrollRelated/StaffPayrollPage';
import AddStationery from './stationeryRelated/AddStationery';
import StationeryInvoices from './stationeryRelated/StationeryInvoices';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Admin Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <SideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={(theme) => ({
                    ...styles.boxStyled,
                    width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${theme.spacing(7)})`,
                    transition: theme.transitions.create(['width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    [theme.breakpoints.up('sm')]: {
                        width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${theme.spacing(9)})`,
                    },
                })}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />
                        <Route path="/Admin/complains" element={<SeeComplains />} />

                        {/* Notice */}
                        <Route path="/Admin/addnotice" element={<AddNotice />} />
                        <Route path="/Admin/notices" element={<ShowNotices />} />

                        {/* Subject */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />

                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />

                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/timetable" element={<AdminTimetableHome />} />
                        <Route path="/Admin/timetable/:id" element={<AdminTimetable />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        <Route path="/Admin/teacher-leave" element={<TeacherLeavePage />} />
                        <Route path="/Admin/parents" element={<ShowParents />} />
                        <Route path="/Admin/parents/class/:id" element={<ClassParentsPage />} />
                        
                        {/* Staff */}
                        <Route path="/Admin/staff" element={<ShowStaff />} />
                        <Route path="/Admin/addstaff" element={<AddStaff />} />
                        <Route path="/Admin/staff/:id" element={<StaffDetails />} />

                        {/* Fees */}
                        <Route path="/Admin/fees" element={<FeesHomePage />} />
                        <Route path="/Admin/fees/class/:id" element={<ClassFeesPage />} />

                        {/* Payroll */}
                        <Route path="/Admin/payroll" element={<PayrollHomePage />} />
                        <Route path="/Admin/payroll/staff/:id" element={<StaffPayrollPage />} />
                        <Route path="/Admin/payroll/teacher/:id" element={<StaffPayrollPage />} />

                        {/* Stationery */}
                        <Route path="/Admin/stationery" element={<AddStationery />} />
                        <Route path="/Admin/invoices" element={<StationeryInvoices />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default AdminDashboard

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        // Custom scrollbar for main content
        '&::-webkit-scrollbar': {
            width: '12px',
        },
        '&::-webkit-scrollbar-track': {
            background: (theme) => theme.palette.mode === 'light' ? '#f1f1f1' : '#2a2a2a',
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: (theme) => theme.palette.mode === 'light' ? '#888' : '#555',
            borderRadius: '10px',
            '&:hover': {
                background: (theme) => theme.palette.mode === 'light' ? '#555' : '#777',
            },
        },
        // Firefox scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: (theme) => theme.palette.mode === 'light' ? '#888 #f1f1f1' : '#555 #2a2a2a',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}
```

Ensuring ClassParentsPage loads classes to display the class name. Checking and fixing:


```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getParents } from '../../../redux/parentRelated/parentHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Paper, Box, Typography, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import Popup from '../../../components/Popup';

const ClassParentsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // classId
    const { parentsList, loading, error, response, status } = useSelector((state) => state.parent);
    const { currentUser } = useSelector((state) => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);
    
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Get class name
    const currentClass = sclassesList.find(sclass => sclass._id === id);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParents(currentUser._id));
            dispatch(getAllSclasses(currentUser._id, 'Sclass'));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (status === 'error') {
            const errorMessage = error?.response?.data?.message || error?.message || "Network Error. Please check your connection and try again.";
            setMessage(errorMessage);
            setShowPopup(true);
            console.error("Error fetching parents:", error);
        } else if (status === 'failed') {
            setMessage(response || "Failed to load parents");
            setShowPopup(true);
        }
    }, [status, error, response]);

    // Filter parents by class
    const classParents = parentsList.filter(parent => {
        const studentClassId = parent.student?.sclassName?._id || parent.student?.sclassName;
        return studentClassId === id;
    });

    if (loading && parentsList.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Parents & Students - {currentClass?.sclassName || 'Class'}
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/Admin/parents')}>
                    Back to Classes
                </Button>
            </Box>

            {status === 'error' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load parents. Please refresh the page or check your connection.
                </Alert>
            )}

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Parent Name</StyledTableCell>
                                <StyledTableCell>Student Name</StyledTableCell>
                                <StyledTableCell>Roll Number</StyledTableCell>
                                <StyledTableCell>Mobile Number</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {classParents.length > 0 ? (
                                classParents.map((parent) => (
                                    <StyledTableRow key={parent._id}>
                                        <TableCell>{parent.name}</TableCell>
                                        <TableCell>{parent.student?.name || 'N/A'}</TableCell>
                                        <TableCell>{parent.student?.rollNum || 'N/A'}</TableCell>
                                        <TableCell>{parent.mobile || 'N/A'}</TableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                            {loading ? 'Loading...' : 'No parents found for this class. Add students with parent details to see them here.'}
                                        </Typography>
                                    </TableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ClassParentsPage;


```

## Changes Made

### 1. **Modified `ShowParents.js`** (Parents List Homepage)
- Shows all classes first (like Fees Management)
- Each class has a "View Parents" button
- Clicking navigates to the class-specific parents view

### 2. **Created `ClassParentsPage.js`** (New Component)
- Displays parents and students for a selected class
- Shows:
  - **Parent Name**
  - **Student Name**
  - **Roll Number**
  - **Mobile Number**
- Includes a "Back to Classes" button
- Filters parents by the selected class

### 3. **Updated `AdminDashboard.js`**
- Added route: `/Admin/parents/class/:id` for the class-specific view

## How It Works

1. Navigate to Parents section → Shows all classes
2. Click "View Parents" on a class → Shows parents/students for that class
3. The table displays:
   - Parent Name
   - Student Name
   - Roll Number
   - Mobile Number

## Features

- Class-based organization (like Fees Management)
- Clear navigation with back button
- Error handling and loading states
- Empty state message when no parents found
- Consistent UI matching the Fees Management style

The parents list is now organized by class, matching the Fees Management structure.

---

**User**

all calculate fix including leave total

when teacher applied for fees then in admin pannel add a option with leave approval to cut salary and also update salary there for that month 

---

**Cursor**

```javascript
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    reason: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, default: 1 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    deductionApplied: { type: Boolean, default: false },
    deductionAmount: { type: Number, default: 0 },
    deductionReason: { type: String },
    deductionMonth: { type: String },
    finalAmount: { type: Number },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    approvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('leave', leaveSchema);




```

```javascript
const Leave = require('../models/leaveSchema.js');
const Payroll = require('../models/payrollSchema.js');

const createLeave = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;
        let totalDays = 1;
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            if (!isNaN(start) && !isNaN(end)) {
                const diffTime = Math.abs(end - start);
                totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }
        }
        const leave = new Leave({ ...req.body, status: 'Pending', totalDays });
        const result = await leave.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// list teacher leaves by teacher
const listTeacherLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ teacher: req.params.id }).sort({ createdAt: -1 });
        if (leaves.length === 0) return res.send({ message: 'No leaves found' });
        res.send(leaves);
    } catch (error) {
        res.status(500).json(error);
    }
};

// list all leaves for a school (admin)
const listSchoolLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ school: req.params.id }).populate('teacher', 'name email').sort({ createdAt: -1 });
        if (leaves.length === 0) return res.send({ message: 'No leaves found' });
        res.send(leaves);
    } catch (error) {
        res.status(500).json(error);
    }
};

const setLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params; // leave id
        const {
            status,
            deductionApplied,
            deductionAmount,
            deductionReason,
            finalAmount,
            approvedBy,
        } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).send({ message: 'Leave not found' });
        }

        const previousDeduction = leave.deductionAmount || 0;
        const previousDeductionApplied = leave.deductionApplied;
        const monthKey = leave.fromDate ? new Date(leave.fromDate).toISOString().slice(0, 7) : null;

        if (status) {
            leave.status = status;
        }
        if (approvedBy) {
            leave.approvedBy = approvedBy;
        }
        leave.approvedAt = new Date();

        let payrollRecord = null;

        if (status === 'Approved') {
            const shouldDeduct = Boolean(deductionApplied) && Number(deductionAmount) > 0;
            leave.deductionApplied = shouldDeduct;

            if (shouldDeduct) {
                const newDeductionAmount = Number(deductionAmount) || 0;
                leave.deductionAmount = newDeductionAmount;
                leave.deductionReason = deductionReason || leave.deductionReason;
                leave.deductionMonth = monthKey;
                if (finalAmount !== undefined && finalAmount !== null) {
                    leave.finalAmount = Number(finalAmount);
                }

                if (monthKey) {
                    payrollRecord = await Payroll.findOne({
                        teacher: leave.teacher,
                        school: leave.school,
                        month: monthKey,
                    });

                    if (!payrollRecord) {
                        payrollRecord = new Payroll({
                            teacher: leave.teacher,
                            employeeType: 'Teacher',
                            school: leave.school,
                            month: monthKey,
                            status: 'Unpaid',
                            amount: finalAmount !== undefined && finalAmount !== null ? Number(finalAmount) : 0,
                            deductions: newDeductionAmount,
                            remarks: deductionReason || 'Leave deduction applied',
                        });
                    } else {
                        const existingDeductions = payrollRecord.deductions || 0;
                        const adjustedDeductions = Math.max(
                            0,
                            existingDeductions - (previousDeductionApplied ? previousDeduction : 0) + newDeductionAmount
                        );
                        payrollRecord.deductions = adjustedDeductions;
                        if (finalAmount !== undefined && finalAmount !== null) {
                            payrollRecord.amount = Number(finalAmount);
                        }
                        if (deductionReason) {
                            payrollRecord.remarks = deductionReason;
                        }
                    }

                    await payrollRecord.save();
                }
            } else {
                // remove previous deduction if it existed
                if (previousDeductionApplied && previousDeduction > 0 && monthKey) {
                    payrollRecord = await Payroll.findOne({
                        teacher: leave.teacher,
                        school: leave.school,
                        month: monthKey,
                    });
                    if (payrollRecord) {
                        const existingDeductions = payrollRecord.deductions || 0;
                        payrollRecord.deductions = Math.max(0, existingDeductions - previousDeduction);
                        if (finalAmount !== undefined && finalAmount !== null) {
                            payrollRecord.amount = Number(finalAmount);
                        }
                        await payrollRecord.save();
                    }
                }
                leave.deductionApplied = false;
                leave.deductionAmount = 0;
                leave.deductionReason = undefined;
                leave.deductionMonth = undefined;
                if (finalAmount !== undefined && finalAmount !== null) {
                    leave.finalAmount = Number(finalAmount);
                } else {
                    leave.finalAmount = undefined;
                }
            }
        } else {
            // Rejected or Pending: rollback any previous deduction
            if (previousDeductionApplied && previousDeduction > 0 && monthKey) {
                payrollRecord = await Payroll.findOne({
                    teacher: leave.teacher,
                    school: leave.school,
                    month: monthKey,
                });
                if (payrollRecord) {
                    const existingDeductions = payrollRecord.deductions || 0;
                    payrollRecord.deductions = Math.max(0, existingDeductions - previousDeduction);
                    await payrollRecord.save();
                }
            }
            leave.deductionApplied = false;
            leave.deductionAmount = 0;
            leave.deductionReason = undefined;
            leave.deductionMonth = undefined;
            leave.finalAmount = undefined;
        }

        const updatedLeave = await leave.save();
        res.send(updatedLeave);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { createLeave, listTeacherLeaves, listSchoolLeaves, setLeaveStatus };




```

```javascript
import axios from 'axios';
import { getRequest, getSuccess, getFailed, getError, postDone } from './leaveSlice';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

export const createLeave = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.post(`${BASE_URL}/LeaveCreate`, fields, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherLeaves = (teacherId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${BASE_URL}/LeaveList/teacher/${teacherId}`);
        if (result.data.message) dispatch(getFailed(result.data.message));
        else dispatch(getSuccess(result.data));
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSchoolLeaves = (schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${BASE_URL}/LeaveList/school/${schoolId}`);
        if (result.data.message) dispatch(getFailed(result.data.message));
        else dispatch(getSuccess(result.data));
    } catch (error) {
        dispatch(getError(error));
    }
}

export const setLeaveStatus = (leaveId, payload) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.put(`${BASE_URL}/LeaveStatus/${leaveId}`, payload, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}









```

```javascript
*** Begin Patch
*** Update File: MERN-School-Management-System/frontend/src/pages/admin/TeacherLeavePage.js
@@
-import { useDispatch, useSelector } from 'react-redux';
-import { useEffect } from 'react';
-import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
-import { Card, CardContent, Typography, Button, Chip, Stack, Grid } from '@mui/material';
-
-const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';
-
-const TeacherLeavePage = () => {
-    const dispatch = useDispatch();
-    const { currentUser } = useSelector(state => state.user);
-    const { leaves } = useSelector(state => state.leave);
-
-    useEffect(() => {
-        if (currentUser?._id) dispatch(getSchoolLeaves(currentUser._id));
-    }, [dispatch, currentUser]);
-
-    const update = async (id, status) => {
-        await dispatch(setLeaveStatus(id, status));
-        dispatch(getSchoolLeaves(currentUser._id));
-    };
-
-    return (
-        <Stack spacing={2}>
-            {leaves.map(l => (
-                <Card key={l._id}>
-                    <CardContent>
-                        <Grid container alignItems="center">
-                            <Grid item xs={3}><Typography variant="body1">{l.teacher?.name}</Typography></Grid>
-                            <Grid item xs={5}><Typography variant="body2">{l.reason} ({new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()})</Typography></Grid>
-                            <Grid item xs={2}><Chip label={l.status} color={statusColor(l.status)} size="small" /></Grid>
-                            <Grid item xs={2}>
-                                <Button size="small" onClick={() => update(l._id, 'Approved')}>Approve</Button>
-                                <Button size="small" onClick={() => update(l._id, 'Rejected')}>Reject</Button>
-                            </Grid>
-                        </Grid>
-                    </CardContent>
-                </Card>
-            ))}
-        </Stack>
-    );
-};
-
-export default TeacherLeavePage;
-
-
-
-
-
-
-
-
-
-
+import { useDispatch, useSelector } from 'react-redux';
+import { useEffect, useMemo, useState } from 'react';
+import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
+import {
+    Card,
+    CardContent,
+    Typography,
+    Button,
+    Chip,
+    Stack,
+    Grid,
+    Dialog,
+    DialogTitle,
+    DialogContent,
+    DialogActions,
+    TextField,
+    FormControlLabel,
+    Switch,
+    Divider,
+    Box
+} from '@mui/material';
+
+const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';
+
+const formatDate = (date) => new Date(date).toLocaleDateString();
+const calculateDays = (fromDate, toDate) => {
+    if (!fromDate || !toDate) return 1;
+    const start = new Date(fromDate);
+    const end = new Date(toDate);
+    if (isNaN(start) || isNaN(end)) return 1;
+    const diff = Math.abs(end - start);
+    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
+};
+
+const TeacherLeavePage = () => {
+    const dispatch = useDispatch();
+    const { currentUser } = useSelector(state => state.user);
+    const { leaves, loading } = useSelector(state => state.leave);
+
+    const [dialogOpen, setDialogOpen] = useState(false);
+    const [selectedLeave, setSelectedLeave] = useState(null);
+    const [deductionApplied, setDeductionApplied] = useState(false);
+    const [deductionAmount, setDeductionAmount] = useState('');
+    const [finalAmount, setFinalAmount] = useState('');
+    const [deductionReason, setDeductionReason] = useState('');
+
+    useEffect(() => {
+        if (currentUser?._id) dispatch(getSchoolLeaves(currentUser._id));
+    }, [dispatch, currentUser]);
+
+    const leavesList = useMemo(() => Array.isArray(leaves) ? leaves : [], [leaves]);
+
+    const handleReject = async (leave) => {
+        if (!currentUser?._id) return;
+        await dispatch(setLeaveStatus(leave._id, { status: 'Rejected', approvedBy: currentUser._id }));
+        dispatch(getSchoolLeaves(currentUser._id));
+    };
+
+    const openApproveDialog = (leave) => {
+        setSelectedLeave(leave);
+        setDeductionApplied(Boolean(leave.deductionApplied));
+        setDeductionAmount(
+            leave.deductionAmount !== undefined && leave.deductionAmount !== null
+                ? String(leave.deductionAmount)
+                : ''
+        );
+        setFinalAmount(
+            leave.finalAmount !== undefined && leave.finalAmount !== null
+                ? String(leave.finalAmount)
+                : ''
+        );
+        setDeductionReason(leave.deductionReason || '');
+        setDialogOpen(true);
+    };
+
+    const closeDialog = () => {
+        setDialogOpen(false);
+        setSelectedLeave(null);
+        setDeductionApplied(false);
+        setDeductionAmount('');
+        setFinalAmount('');
+        setDeductionReason('');
+    };
+
+    const handleApprove = async () => {
+        if (!selectedLeave || !currentUser?._id) return;
+        const payload = {
+            status: 'Approved',
+            approvedBy: currentUser._id,
+            deductionApplied,
+        };
+
+        if (deductionApplied) {
+            payload.deductionAmount = deductionAmount ? Number(deductionAmount) : 0;
+            payload.deductionReason = deductionReason || `Leave deduction (${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)`;
+        }
+
+        if (finalAmount !== '') {
+            payload.finalAmount = Number(finalAmount);
+        }
+
+        await dispatch(setLeaveStatus(selectedLeave._id, payload));
+        closeDialog();
+        dispatch(getSchoolLeaves(currentUser._id));
+    };
+
+    return (
+        <>
+            <Stack spacing={2}>
+                {loading && leavesList.length === 0 && (
+                    <Typography variant="body2">Loading leaves...</Typography>
+                )}
+                {leavesList.map(leave => {
+                    const totalDays = leave.totalDays || calculateDays(leave.fromDate, leave.toDate);
+                    return (
+                        <Card key={leave._id}>
+                            <CardContent>
+                                <Grid container spacing={2} alignItems="center">
+                                    <Grid item xs={12} md={3}>
+                                        <Typography variant="subtitle1" fontWeight="bold">
+                                            {leave.teacher?.name || 'Unknown Teacher'}
+                                        </Typography>
+                                        <Typography variant="body2" color="text.secondary">
+                                            Total Days: {totalDays}
+                                        </Typography>
+                                    </Grid>
+                                    <Grid item xs={12} md={5}>
+                                        <Typography variant="body2">
+                                            {leave.reason}
+                                        </Typography>
+                                        <Typography variant="body2" color="text.secondary">
+                                            {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
+                                        </Typography>
+                                        {leave.deductionApplied && (
+                                            <Typography variant="caption" color="error">
+                                                Deduction applied: ₹{leave.deductionAmount || 0} {leave.deductionReason ? `(${leave.deductionReason})` : ''}
+                                            </Typography>
+                                        )}
+                                    </Grid>
+                                    <Grid item xs={12} md={2}>
+                                        <Chip label={leave.status} color={statusColor(leave.status)} size="small" />
+                                    </Grid>
+                                    <Grid item xs={12} md={2}>
+                                        <Stack direction="row" spacing={1}>
+                                            <Button size="small" variant="contained" onClick={() => openApproveDialog(leave)}>
+                                                Approve
+                                            </Button>
+                                            <Button size="small" variant="outlined" color="error" onClick={() => handleReject(leave)}>
+                                                Reject
+                                            </Button>
+                                        </Stack>
+                                    </Grid>
+                                </Grid>
+                            </CardContent>
+                        </Card>
+                    );
+                })}
+                {!loading && leavesList.length === 0 && (
+                    <Typography variant="body2" color="text.secondary">
+                        No leave applications found.
+                    </Typography>
+                )}
+            </Stack>
+
+            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
+                <DialogTitle>Approve Leave & Salary Adjustment</DialogTitle>
+                <DialogContent dividers>
+                    {selectedLeave && (
+                        <Box>
+                            <Typography variant="subtitle1" fontWeight="bold">
+                                {selectedLeave.teacher?.name}
+                            </Typography>
+                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
+                                {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)} ({selectedLeave.totalDays || calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)
+                            </Typography>
+                            <Divider sx={{ mb: 2 }} />
+                            <FormControlLabel
+                                control={
+                                    <Switch
+                                        checked={deductionApplied}
+                                        onChange={(e) => setDeductionApplied(e.target.checked)}
+                                        color="primary"
+                                    />
+                                }
+                                label="Apply salary deduction for this leave"
+                            />
+                            {deductionApplied && (
+                                <TextField
+                                    margin="dense"
+                                    label="Deduction Amount (₹)"
+                                    type="number"
+                                    fullWidth
+                                    value={deductionAmount}
+                                    onChange={(e) => setDeductionAmount(e.target.value)}
+                                    helperText="Total amount to deduct from the teacher's salary for this month"
+                                />
+                            )}
+                            <TextField
+                                margin="dense"
+                                label="Updated Salary Amount (₹)"
+                                type="number"
+                                fullWidth
+                                value={finalAmount}
+                                onChange={(e) => setFinalAmount(e.target.value)}
+                                helperText="Optional: set the final salary amount for this month after deduction"
+                            />
+                            {deductionApplied && (
+                                <TextField
+                                    margin="dense"
+                                    label="Deduction Notes"
+                                    fullWidth
+                                    multiline
+                                    minRows={2}
+                                    value={deductionReason}
+                                    onChange={(e) => setDeductionReason(e.target.value)}
+                                    helperText="Reason for deduction (visible in payroll records)"
+                                />
+                            )}
+                        </Box>
+                    )}
+                </DialogContent>
+                <DialogActions>
+                    <Button onClick={closeDialog}>Cancel</Button>
+                    <Button onClick={handleApprove} variant="contained">
+                        Approve & Save
+                    </Button>
+                </DialogActions>
+            </Dialog>
+        </>
+    );
+};
+
+export default TeacherLeavePage;
*** End Patch
```

```javascript
*** Begin Patch
*** Update File: MERN-School-Management-System/frontend/src/pages/admin/TeacherLeavePage.js
@@
-import { useDispatch, useSelector } from 'react-redux';
-import { useEffect } from 'react';
-import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
-import { Card, CardContent, Typography, Button, Chip, Stack, Grid } from '@mui/material';
-
-const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';
-
-const TeacherLeavePage = () => {
-    const dispatch = useDispatch();
-    const { currentUser } = useSelector(state => state.user);
-    const { leaves } = useSelector(state => state.leave);
-
-    useEffect(() => {
-        if (currentUser?._id) dispatch(getSchoolLeaves(currentUser._id));
-    }, [dispatch, currentUser]);
-
-    const update = async (id, status) => {
-        await dispatch(setLeaveStatus(id, status));
-        dispatch(getSchoolLeaves(currentUser._id));
-    };
-
-    return (
-        <Stack spacing={2}>
-            {leaves.map(l => (
-                <Card key={l._id}>
-                    <CardContent>
-                        <Grid container alignItems="center">
-                            <Grid item xs={3}><Typography variant="body1">{l.teacher?.name}</Typography></Grid>
-                            <Grid item xs={5}><Typography variant="body2">{l.reason} ({new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()})</Typography></Grid>
-                            <Grid item xs={2}><Chip label={l.status} color={statusColor(l.status)} size="small" /></Grid>
-                            <Grid item xs={2}>
-                                <Button size="small" onClick={() => update(l._id, 'Approved')}>Approve</Button>
-                                <Button size="small" onClick={() => update(l._id, 'Rejected')}>Reject</Button>
-                            </Grid>
-                        </Grid>
-                    </CardContent>
-                </Card>
-            ))}
-        </Stack>
-    );
-};
-
-export default TeacherLeavePage;
-
-
-
-
-
-
-
-
-
-
+import { useDispatch, useSelector } from 'react-redux';
+import { useEffect, useMemo, useState } from 'react';
+import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
+import {
+    Card,
+    CardContent,
+    Typography,
+    Button,
+    Chip,
+    Stack,
+    Grid,
+    Dialog,
+    DialogTitle,
+    DialogContent,
+    DialogActions,
+    TextField,
+    FormControlLabel,
+    Switch,
+    Divider,
+    Box,
+} from '@mui/material';
+
+const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';
+
+const formatDate = (date) => new Date(date).toLocaleDateString();
+const calculateDays = (fromDate, toDate) => {
+    if (!fromDate || !toDate) return 1;
+    const start = new Date(fromDate);
+    const end = new Date(toDate);
+    if (isNaN(start) || isNaN(end)) return 1;
+    const diff = Math.abs(end - start);
+    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
+};
+
+const TeacherLeavePage = () => {
+    const dispatch = useDispatch();
+    const { currentUser } = useSelector(state => state.user);
+    const { leaves, loading } = useSelector(state => state.leave);
+
+    const [dialogOpen, setDialogOpen] = useState(false);
+    const [selectedLeave, setSelectedLeave] = useState(null);
+    const [deductionApplied, setDeductionApplied] = useState(false);
+    const [deductionAmount, setDeductionAmount] = useState('');
+    const [finalAmount, setFinalAmount] = useState('');
+    const [deductionReason, setDeductionReason] = useState('');
+
+    useEffect(() => {
+        if (currentUser?._id) dispatch(getSchoolLeaves(currentUser._id));
+    }, [dispatch, currentUser]);
+
+    const leavesList = useMemo(() => Array.isArray(leaves) ? leaves : [], [leaves]);
+
+    const handleReject = async (leave) => {
+        if (!currentUser?._id) return;
+        await dispatch(setLeaveStatus(leave._id, { status: 'Rejected', approvedBy: currentUser._id }));
+        dispatch(getSchoolLeaves(currentUser._id));
+    };
+
+    const openApproveDialog = (leave) => {
+        setSelectedLeave(leave);
+        setDeductionApplied(Boolean(leave.deductionApplied));
+        setDeductionAmount(
+            leave.deductionAmount !== undefined && leave.deductionAmount !== null
+                ? String(leave.deductionAmount)
+                : ''
+        );
+        setFinalAmount(
+            leave.finalAmount !== undefined && leave.finalAmount !== null
+                ? String(leave.finalAmount)
+                : ''
+        );
+        setDeductionReason(leave.deductionReason || '');
+        setDialogOpen(true);
+    };
+
+    const closeDialog = () => {
+        setDialogOpen(false);
+        setSelectedLeave(null);
+        setDeductionApplied(false);
+        setDeductionAmount('');
+        setFinalAmount('');
+        setDeductionReason('');
+    };
+
+    const handleApprove = async () => {
+        if (!selectedLeave || !currentUser?._id) return;
+        const payload = {
+            status: 'Approved',
+            approvedBy: currentUser._id,
+            deductionApplied,
+        };
+
+        if (deductionApplied) {
+            payload.deductionAmount = deductionAmount ? Number(deductionAmount) : 0;
+            payload.deductionReason = deductionReason || `Leave deduction (${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)`;
+        }
+
+        if (finalAmount !== '') {
+            payload.finalAmount = Number(finalAmount);
+        }
+
+        await dispatch(setLeaveStatus(selectedLeave._id, payload));
+        closeDialog();
+        dispatch(getSchoolLeaves(currentUser._id));
+    };
+
+    return (
+        <>
+            <Stack spacing={2}>
+                {loading && leavesList.length === 0 && (
+                    <Typography variant="body2">Loading leaves...</Typography>
+                )}
+                {leavesList.map(leave => {
+                    const totalDays = leave.totalDays || calculateDays(leave.fromDate, leave.toDate);
+                    return (
+                        <Card key={leave._id}>
+                            <CardContent>
+                                <Grid container spacing={2} alignItems="center">
+                                    <Grid item xs={12} md={3}>
+                                        <Typography variant="subtitle1" fontWeight="bold">
+                                            {leave.teacher?.name || 'Unknown Teacher'}
+                                        </Typography>
+                                        <Typography variant="body2" color="text.secondary">
+                                            Total Days: {totalDays}
+                                        </Typography>
+                                    </Grid>
+                                    <Grid item xs={12} md={5}>
+                                        <Typography variant="body2">
+                                            {leave.reason}
+                                        </Typography>
+                                        <Typography variant="body2" color="text.secondary">
+                                            {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
+                                        </Typography>
+                                        {leave.deductionApplied && (
+                                            <Typography variant="caption" color="error">
+                                                Deduction applied: ₹{leave.deductionAmount || 0} {leave.deductionReason ? `(${leave.deductionReason})` : ''}
+                                            </Typography>
+                                        )}
+                                    </Grid>
+                                    <Grid item xs={12} md={2}>
+                                        <Chip label={leave.status} color={statusColor(leave.status)} size="small" />
+                                    </Grid>
+                                    <Grid item xs={12} md={2}>
+                                        <Stack direction="row" spacing={1}>
+                                            <Button size="small" variant="contained" onClick={() => openApproveDialog(leave)}>
+                                                Approve
+                                            </Button>
+                                            <Button size="small" variant="outlined" color="error" onClick={() => handleReject(leave)}>
+                                                Reject
+                                            </Button>
+                                        </Stack>
+                                    </Grid>
+                                </Grid>
+                            </CardContent>
+                        </Card>
+                    );
+                })}
+                {!loading && leavesList.length === 0 && (
+                    <Typography variant="body2" color="text.secondary">
+                        No leave applications found.
+                    </Typography>
+                )}
+            </Stack>
+
+            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
+                <DialogTitle>Approve Leave & Salary Adjustment</DialogTitle>
+                <DialogContent dividers>
+                    {selectedLeave && (
+                        <Box>
+                            <Typography variant="subtitle1" fontWeight="bold">
+                                {selectedLeave.teacher?.name}
+                            </Typography>
+                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
+                                {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)} ({selectedLeave.totalDays || calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)
+                            </Typography>
+                            <Divider sx={{ mb: 2 }} />
+                            <FormControlLabel
+                                control={
+                                    <Switch
+                                        checked={deductionApplied}
+                                        onChange={(e) => setDeductionApplied(e.target.checked)}
+                                        color="primary"
+                                    />
+                                }
+                                label="Apply salary deduction for this leave"
+                            />
+                            {deductionApplied && (
+                                <TextField
+                                    margin="dense"
+                                    label="Deduction Amount (₹)"
+                                    type="number"
+                                    fullWidth
+                                    value={deductionAmount}
+                                    onChange={(e) => setDeductionAmount(e.target.value)}
+                                    helperText="Total amount to deduct from the teacher's salary for this month"
+                                />
+                            )}
+                            <TextField
+                                margin="dense"
+                                label="Updated Salary Amount (₹)"
+                                type="number"
+                                fullWidth
+                                value={finalAmount}
+                                onChange={(e) => setFinalAmount(e.target.value)}
+                                helperText="Optional: set the final salary amount for this month after deduction"
+                            />
+                            {deductionApplied && (
+                                <TextField
+                                    margin="dense"
+                                    label="Deduction Notes"
+                                    fullWidth
+                                    multiline
+                                    minRows={2}
+                                    value={deductionReason}
+                                    onChange={(e) => setDeductionReason(e.target.value)}
+                                    helperText="Reason for deduction (visible in payroll records)"
+                                />
+                            )}
+                        </Box>
+                    )}
+                </DialogContent>
+                <DialogActions>
+                    <Button onClick={closeDialog}>Cancel</Button>
+                    <Button onClick={handleApprove} variant="contained">
+                        Approve & Save
+                    </Button>
+                </DialogActions>
+            </Dialog>
+        </>
+    );
+};
+
+export default TeacherLeavePage;
*** End Patch
```

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { getSchoolLeaves, setLeaveStatus } from '../../redux/leaveRelated/leaveHandle';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Divider,
    Box,
} from '@mui/material';

const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';

const formatDate = (date) => new Date(date).toLocaleDateString();
const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start) || isNaN(end)) return 1;
    const diff = Math.abs(end - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

const TeacherLeavePage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { leaves, loading } = useSelector(state => state.leave);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [deductionApplied, setDeductionApplied] = useState(false);
    const [deductionAmount, setDeductionAmount] = useState('');
    const [finalAmount, setFinalAmount] = useState('');
    const [deductionReason, setDeductionReason] = useState('');

    useEffect(() => {
        if (currentUser?._id) dispatch(getSchoolLeaves(currentUser._id));
    }, [dispatch, currentUser]);

    const leavesList = useMemo(() => Array.isArray(leaves) ? leaves : [], [leaves]);

    const handleReject = async (leave) => {
        if (!currentUser?._id) return;
        await dispatch(setLeaveStatus(leave._id, { status: 'Rejected', approvedBy: currentUser._id }));
        dispatch(getSchoolLeaves(currentUser._id));
    };

    const openApproveDialog = (leave) => {
        setSelectedLeave(leave);
        setDeductionApplied(Boolean(leave.deductionApplied));
        setDeductionAmount(
            leave.deductionAmount !== undefined && leave.deductionAmount !== null
                ? String(leave.deductionAmount)
                : ''
        );
        setFinalAmount(
            leave.finalAmount !== undefined && leave.finalAmount !== null
                ? String(leave.finalAmount)
                : ''
        );
        setDeductionReason(leave.deductionReason || '');
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedLeave(null);
        setDeductionApplied(false);
        setDeductionAmount('');
        setFinalAmount('');
        setDeductionReason('');
    };

    const handleApprove = async () => {
        if (!selectedLeave || !currentUser?._id) return;
        const payload = {
            status: 'Approved',
            approvedBy: currentUser._id,
            deductionApplied,
        };

        if (deductionApplied) {
            payload.deductionAmount = deductionAmount ? Number(deductionAmount) : 0;
            payload.deductionReason = deductionReason || `Leave deduction (${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)`;
        }

        if (finalAmount !== '') {
            payload.finalAmount = Number(finalAmount);
        }

        await dispatch(setLeaveStatus(selectedLeave._id, payload));
        closeDialog();
        dispatch(getSchoolLeaves(currentUser._id));
    };

    return (
        <>
            <Stack spacing={2}>
                {loading && leavesList.length === 0 && (
                    <Typography variant="body2">Loading leaves...</Typography>
                )}
                {leavesList.map(leave => {
                    const totalDays = leave.totalDays || calculateDays(leave.fromDate, leave.toDate);
                    return (
                        <Card key={leave._id}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {leave.teacher?.name || 'Unknown Teacher'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Days: {totalDays}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Typography variant="body2">
                                            {leave.reason}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                                        </Typography>
                                        {leave.deductionApplied && (
                                            <Typography variant="caption" color="error">
                                                Deduction applied: ₹{leave.deductionAmount || 0} {leave.deductionReason ? `(${leave.deductionReason})` : ''}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Chip label={leave.status} color={statusColor(leave.status)} size="small" />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" onClick={() => openApproveDialog(leave)}>
                                                Approve
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleReject(leave)}>
                                                Reject
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    );
                })}
                {!loading && leavesList.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No leave applications found.
                    </Typography>
                )}
            </Stack>

            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Approve Leave & Salary Adjustment</DialogTitle>
                <DialogContent dividers>
                    {selectedLeave && (
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {selectedLeave.teacher?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)} ({selectedLeave.totalDays || calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={deductionApplied}
                                        onChange={(e) => setDeductionApplied(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Apply salary deduction for this leave"
                            />
                            {deductionApplied && (
                                <TextField
                                    margin="dense"
                                    label="Deduction Amount (₹)"
                                    type="number"
                                    fullWidth
                                    value={deductionAmount}
                                    onChange={(e) => setDeductionAmount(e.target.value)}
                                    helperText="Total amount to deduct from the teacher's salary for this month"
                                />
                            )}
                            <TextField
                                margin="dense"
                                label="Updated Salary Amount (₹)"
                                type="number"
                                fullWidth
                                value={finalAmount}
                                onChange={(e) => setFinalAmount(e.target.value)}
                                helperText="Optional: set the final salary amount for this month after deduction"
                            />
                            {deductionApplied && (
                                <TextField
                                    margin="dense"
                                    label="Deduction Notes"
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    value={deductionReason}
                                    onChange={(e) => setDeductionReason(e.target.value)}
                                    helperText="Reason for deduction (visible in payroll records)"
                                />
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={handleApprove} variant="contained">
                        Approve & Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TeacherLeavePage;
```

## Leave-Payroll Integration Update
- Added rich leave metadata (`totalDays`, deduction flags, approval tracking) so each request captures total days and salary-impact details from the start.  
```1:18:MERN-School-Management-System/backend/models/leaveSchema.js
const leaveSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    reason: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, default: 1 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    deductionApplied: { type: Boolean, default: false },
    deductionAmount: { type: Number, default: 0 },
    deductionReason: { type: String },
    deductionMonth: { type: String },
    finalAmount: { type: Number },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    approvedAt: { type: Date },
}, { timestamps: true });
```

- Leave lifecycle now auto-calculates day counts and, on approval, updates the relevant teacher payroll entry (incremental deductions, optional final amount override, rollback when deductions are cleared or leave rejected).  
```4:175:MERN-School-Management-System/backend/controllers/leave-controller.js
const setLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, deductionApplied, deductionAmount, deductionReason, finalAmount, approvedBy } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).send({ message: 'Leave not found' });
        }

        const previousDeduction = leave.deductionAmount || 0;
        const previousDeductionApplied = leave.deductionApplied;
        const monthKey = leave.fromDate ? new Date(leave.fromDate).toISOString().slice(0, 7) : null;
        ...
        const updatedLeave = await leave.save();
        res.send(updatedLeave);
    } catch (error) {
        res.status(500).json(error);
    }
};
```

- Front-end adjustments: Redux actions accept the richer payload, and the admin leave screen now provides a dialog to review totals, toggle salary deductions, capture reasons, and set the month’s final salary before approval.  
```1:45:MERN-School-Management-System/frontend/src/redux/leaveRelated/leaveHandle.js
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
...
export const setLeaveStatus = (leaveId, payload) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.put(`${BASE_URL}/LeaveStatus/${leaveId}`, payload, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}
```

```1:220:MERN-School-Management-System/frontend/src/pages/admin/TeacherLeavePage.js
const TeacherLeavePage = () => {
    ...
    const handleApprove = async () => {
        if (!selectedLeave || !currentUser?._id) return;
        const payload = {
            status: 'Approved',
            approvedBy: currentUser._id,
            deductionApplied,
        };

        if (deductionApplied) {
            payload.deductionAmount = deductionAmount ? Number(deductionAmount) : 0;
            payload.deductionReason = deductionReason || `Leave deduction (${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)`;
        }

        if (finalAmount !== '') {
            payload.finalAmount = Number(finalAmount);
        }

        await dispatch(setLeaveStatus(selectedLeave._id, payload));
        closeDialog();
        dispatch(getSchoolLeaves(currentUser._id));
    };
    ...
};
```

## Next Steps
- Restart the backend server so Mongoose picks up the schema changes.
- Approve a test leave and confirm the teacher’s payroll entry reflects the deduction and final amount.
- Verify the admin leave page shows total days and the deduction dialog behaves as expected.

If you also want automatic teacher salary defaults, we’ll need to extend the teacher schema to store base salary; let me know and I can add that.

```javascript
const leaveSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    reason: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, default: 1 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    deductionApplied: { type: Boolean, default: false },
    deductionAmount: { type: Number, default: 0 },
    deductionReason: { type: String },
    deductionMonth: { type: String },
    finalAmount: { type: Number },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    approvedAt: { type: Date },
}, { timestamps: true });
```

```javascript
const setLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, deductionApplied, deductionAmount, deductionReason, finalAmount, approvedBy } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).send({ message: 'Leave not found' });
        }

        const previousDeduction = leave.deductionAmount || 0;
        const previousDeductionApplied = leave.deductionApplied;
        const monthKey = leave.fromDate ? new Date(leave.fromDate).toISOString().slice(0, 7) : null;
        ...
        const updatedLeave = await leave.save();
        res.send(updatedLeave);
    } catch (error) {
        res.status(500).json(error);
    }
};
```

```javascript
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
...
export const setLeaveStatus = (leaveId, payload) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.put(`${BASE_URL}/LeaveStatus/${leaveId}`, payload, { headers: { 'Content-Type': 'application/json' } });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}
```

```javascript
const TeacherLeavePage = () => {
    ...
    const handleApprove = async () => {
        if (!selectedLeave || !currentUser?._id) return;
        const payload = {
            status: 'Approved',
            approvedBy: currentUser._id,
            deductionApplied,
        };

        if (deductionApplied) {
            payload.deductionAmount = deductionAmount ? Number(deductionAmount) : 0;
            payload.deductionReason = deductionReason || `Leave deduction (${calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} days)`;
        }

        if (finalAmount !== '') {
            payload.finalAmount = Number(finalAmount);
        }

        await dispatch(setLeaveStatus(selectedLeave._id, payload));
        closeDialog();
        dispatch(getSchoolLeaves(currentUser._id));
    };
    ...
};
```

