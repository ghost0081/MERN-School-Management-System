import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { upsertParent } from '../../../redux/parentRelated/parentHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress } from '@mui/material';
import axios from 'axios';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('')
    const [className, setClassName] = useState('')
    const [sclassName, setSclassName] = useState('')
    
    // Parent fields
    const [parentName, setParentName] = useState('');
    const [parentMobile, setParentMobile] = useState('');

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    }

    const fields = { name, rollNum, password, sclassName, adminID, role, attendance }

    const submitHandler = async (event) => {
        event.preventDefault()
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
        }
        else if (!parentName || !parentMobile) {
            setMessage("Please fill in parent details")
            setShowPopup(true)
        }
        else {
            setLoader(true)
            try {
                // First register the student
                const studentResult = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentReg`, fields, {
                    headers: { 'Content-Type': 'application/json' },
                });
                
                if (studentResult.data._id) {
                    // Student created successfully, now create parent
                    const parentFields = {
                        name: parentName,
                        mobile: parentMobile,
                        student: studentResult.data._id,
                        school: adminID
                    };
                    await dispatch(upsertParent(parentFields));
                    dispatch(underControl())
                    navigate(-1)
                } else {
                    setMessage(studentResult.data.message || "Error creating student")
                    setShowPopup(true)
                    setLoader(false)
                }
            } catch (error) {
                setMessage("Error creating student and parent record")
                setShowPopup(true)
                setLoader(false)
            }
        }
    }

    useEffect(() => {
        if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, error, response, dispatch]);

    return (
        <>
            <div className="register">
                <form className="registerForm" onSubmit={submitHandler}>
                    <span className="registerTitle">Add Student</span>
                    <label>Name</label>
                    <input className="registerInput" type="text" placeholder="Enter student's name..."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name" required />

                    {
                        situation === "Student" &&
                        <>
                            <label>Class</label>
                            <select
                                className="registerInput"
                                value={className}
                                onChange={changeHandler} required>
                                <option value='Select Class'>Select Class</option>
                                {sclassesList.map((classItem, index) => (
                                    <option key={index} value={classItem.sclassName}>
                                        {classItem.sclassName}
                                    </option>
                                ))}
                            </select>
                        </>
                    }

                    <label>Roll Number</label>
                    <input className="registerInput" type="number" placeholder="Enter student's Roll Number..."
                        value={rollNum}
                        onChange={(event) => setRollNum(event.target.value)}
                        required />

                    <label>Password</label>
                    <input className="registerInput" type="password" placeholder="Enter student's password..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password" required />

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Parent Details</h3>
                        
                        <label>Parent Name</label>
                        <input className="registerInput" type="text" placeholder="Enter parent's name..."
                            value={parentName}
                            onChange={(event) => setParentName(event.target.value)}
                            required />

                        <label>Parent Mobile Number</label>
                        <input className="registerInput" type="tel" placeholder="Enter parent's mobile number..."
                            value={parentMobile}
                            onChange={(event) => setParentMobile(event.target.value)}
                            required />
                        <small style={{ color: '#666', fontSize: '12px' }}>
                            Password for parent login will be the last 5 digits of this mobile number
                        </small>
                    </div>

                    <button className="registerButton" type="submit" disabled={loader}>
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Add'
                        )}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddStudent