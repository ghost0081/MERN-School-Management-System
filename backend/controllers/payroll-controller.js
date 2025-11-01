const Payroll = require('../models/payrollSchema.js');
const Staff = require('../models/staffSchema.js');
const Teacher = require('../models/teacherSchema.js');

// Get payroll by employee (staff or teacher) and month
const getPayrollByEmployee = async (req, res) => {
    try {
        const { employeeId, employeeType, month, schoolId } = req.query;
        
        if (!employeeId || !employeeType || !month || !schoolId) {
            return res.status(400).send({ message: 'Employee ID, type, month, and school ID are required' });
        }

        let employee, payroll;
        
        if (employeeType === 'Staff') {
            employee = await Staff.findById(employeeId).populate('school', 'schoolName');
            if (!employee) {
                return res.status(404).send({ message: 'Staff not found' });
            }
            
            payroll = await Payroll.findOne({ 
                staff: employeeId, 
                school: schoolId, 
                month: month 
            }).populate('staff', 'name email role');
        } else if (employeeType === 'Teacher') {
            employee = await Teacher.findById(employeeId).populate('school', 'schoolName');
            if (!employee) {
                return res.status(404).send({ message: 'Teacher not found' });
            }
            
            payroll = await Payroll.findOne({ 
                teacher: employeeId, 
                school: schoolId, 
                month: month 
            }).populate('teacher', 'name email role');
        } else {
            return res.status(400).send({ message: 'Invalid employee type. Must be Staff or Teacher' });
        }

        // If no payroll record exists, return default structure
        const result = {
            employee: {
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role || 'Teacher',
                salary: employee.salary || 0,
            },
            employeeType: employeeType,
            payroll: payroll || null,
            status: payroll ? payroll.status : 'Unpaid',
            amount: payroll ? payroll.amount : (employee.salary || 0),
        };

        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Legacy support - Get payroll by staff and month
const getPayrollByStaff = async (req, res) => {
    const { staffId, month, schoolId } = req.query;
    req.query.employeeId = staffId;
    req.query.employeeType = 'Staff';
    return getPayrollByEmployee(req, res);
};

// Get all employees (staff and teachers) payroll for a school and month
const getPayrollBySchool = async (req, res) => {
    try {
        const { schoolId, month } = req.query;
        
        if (!schoolId || !month) {
            return res.status(400).send({ message: 'School ID and month are required' });
        }

        // Get all staff and teachers
        const allStaff = await Staff.find({ school: schoolId });
        const allTeachers = await Teacher.find({ school: schoolId });

        // Get payroll records for the month
        const payrollRecords = await Payroll.find({ 
            school: schoolId, 
            month: month 
        }).populate('staff', 'name email role').populate('teacher', 'name email role');

        // Create maps of payroll by employee ID
        const staffPayrollMap = new Map();
        const teacherPayrollMap = new Map();
        
        payrollRecords.forEach(p => {
            if (p.staff) {
                staffPayrollMap.set(p.staff._id.toString(), p);
            }
            if (p.teacher) {
                teacherPayrollMap.set(p.teacher._id.toString(), p);
            }
        });

        // Combine staff info with payroll status
        const staffPayroll = allStaff.map(staff => {
            const payroll = staffPayrollMap.get(staff._id.toString());
            return {
                employee: {
                    _id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    salary: staff.salary || 0,
                },
                employeeType: 'Staff',
                payroll: payroll || null,
                status: payroll ? payroll.status : 'Unpaid',
                amount: payroll ? payroll.amount : (staff.salary || 0),
            };
        });

        // Combine teacher info with payroll status
        const teacherPayroll = allTeachers.map(teacher => {
            const payroll = teacherPayrollMap.get(teacher._id.toString());
            return {
                employee: {
                    _id: teacher._id,
                    name: teacher.name,
                    email: teacher.email,
                    role: teacher.role || 'Teacher',
                    salary: 0, // Teachers don't have salary in schema, will be set during payroll
                },
                employeeType: 'Teacher',
                payroll: payroll || null,
                status: payroll ? payroll.status : 'Unpaid',
                amount: payroll ? payroll.amount : 0,
            };
        });

        // Combine both arrays
        const allPayroll = [...staffPayroll, ...teacherPayroll];

        res.send(allPayroll);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Update or create payroll payment status
const updatePayrollStatus = async (req, res) => {
    try {
        const { staffId, teacherId, employeeType, month, status, amount, paidDate, paymentMethod, deductions, bonus, remarks, schoolId } = req.body;

        if (!month || !status || !schoolId || !employeeType) {
            return res.status(400).send({ message: 'Month, status, school ID, and employee type are required' });
        }

        let employeeId, employee;
        const queryCondition = { school: schoolId, month: month };

        if (employeeType === 'Staff') {
            if (!staffId) {
                return res.status(400).send({ message: 'Staff ID is required' });
            }
            employee = await Staff.findById(staffId);
            if (!employee) {
                return res.status(404).send({ message: 'Staff not found' });
            }
            employeeId = staffId;
            queryCondition.staff = staffId;
        } else if (employeeType === 'Teacher') {
            if (!teacherId) {
                return res.status(400).send({ message: 'Teacher ID is required' });
            }
            employee = await Teacher.findById(teacherId);
            if (!employee) {
                return res.status(404).send({ message: 'Teacher not found' });
            }
            employeeId = teacherId;
            queryCondition.teacher = teacherId;
        } else {
            return res.status(400).send({ message: 'Invalid employee type. Must be Staff or Teacher' });
        }

        const defaultAmount = employeeType === 'Staff' ? (employee.salary || 0) : 0;

        const updateData = {
            employeeType: employeeType,
            school: schoolId,
            month: month,
            status: status,
            amount: amount || defaultAmount,
        };

        if (employeeType === 'Staff') {
            updateData.staff = employeeId;
        } else {
            updateData.teacher = employeeId;
        }

        if (paidDate) updateData.paidDate = paidDate;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (deductions !== undefined) updateData.deductions = deductions;
        if (bonus !== undefined) updateData.bonus = bonus;
        if (remarks) updateData.remarks = remarks;
        if (status === 'Paid' && !paidDate) {
            updateData.paidDate = new Date();
        }

        const populateFields = employeeType === 'Staff' 
            ? ['staff', 'name email role'] 
            : ['teacher', 'name email role'];

        const payroll = await Payroll.findOneAndUpdate(
            queryCondition,
            updateData,
            { new: true, upsert: true }
        ).populate(...populateFields).populate('school', 'schoolName');

        res.send(payroll);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get payroll history for an employee (staff or teacher)
const getEmployeePayrollHistory = async (req, res) => {
    try {
        const { employeeId, employeeType } = req.params;
        
        if (!employeeId || !employeeType) {
            return res.status(400).send({ message: 'Employee ID and type are required' });
        }

        const query = employeeType === 'Staff' 
            ? { staff: employeeId }
            : { teacher: employeeId };

        const payroll = await Payroll.find(query)
            .sort({ month: -1 })
            .populate('staff', 'name email role')
            .populate('teacher', 'name email role')
            .populate('school', 'schoolName');

        res.send(payroll);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Legacy support - Get payroll history for a staff
const getStaffPayrollHistory = async (req, res) => {
    const { staffId } = req.params;
    req.params.employeeId = staffId;
    req.params.employeeType = 'Staff';
    return getEmployeePayrollHistory(req, res);
};

// Get payroll summary by school and month
const getPayrollSummary = async (req, res) => {
    try {
        const { schoolId, month } = req.query;
        
        if (!schoolId || !month) {
            return res.status(400).send({ message: 'School ID and month are required' });
        }

        const payroll = await Payroll.find({ school: schoolId, month: month });
        const allStaff = await Staff.find({ school: schoolId });
        const allTeachers = await Teacher.find({ school: schoolId });
        
        const totalEmployees = allStaff.length + allTeachers.length;
        
        const summary = {
            total: totalEmployees,
            paid: payroll.filter(p => p.status === 'Paid').length,
            unpaid: totalEmployees - payroll.filter(p => p.status === 'Paid').length,
            totalAmount: payroll.reduce((sum, p) => sum + (p.amount || 0), 0),
            paidAmount: payroll.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0),
            unpaidAmount: payroll.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + (p.amount || 0), 0),
        };

        res.send(summary);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    getPayrollByStaff,
    getPayrollByEmployee,
    getPayrollBySchool,
    updatePayrollStatus,
    getStaffPayrollHistory,
    getEmployeePayrollHistory,
    getPayrollSummary,
};
