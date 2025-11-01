const Fee = require('../models/feeSchema.js');
const Payroll = require('../models/payrollSchema.js');

// Get financial accounting data (revenue from fees and payroll expenses)
const getFinancialAccounting = async (req, res) => {
    try {
        const { schoolId, year, month } = req.query;
        
        if (!schoolId || !year) {
            return res.status(400).send({ message: 'School ID and year are required' });
        }

        // Build query for fees
        const feeQuery = {
            school: schoolId,
            status: 'Paid',
        };

        // Build query for payroll
        const payrollQuery = {
            school: schoolId,
            status: 'Paid',
        };

        // If month is provided, filter by year-month
        if (month) {
            const monthStr = `${year}-${String(month).padStart(2, '0')}`;
            feeQuery.month = monthStr;
            payrollQuery.month = monthStr;
        } else {
            // Filter by year only (all months in that year)
            feeQuery.month = { $regex: `^${year}-` };
            payrollQuery.month = { $regex: `^${year}-` };
        }

        // Get all paid fees (revenue)
        const paidFees = await Fee.find(feeQuery);
        const totalRevenue = paidFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

        // Get all paid payrolls (expenses)
        const paidPayrolls = await Payroll.find(payrollQuery);
        const totalPayrollExpenses = paidPayrolls.reduce((sum, payroll) => {
            // Calculate net amount (amount - deductions + bonus)
            const netAmount = (payroll.amount || 0) - (payroll.deductions || 0) + (payroll.bonus || 0);
            return sum + netAmount;
        }, 0);

        // Calculate net profit/loss
        const netProfit = totalRevenue - totalPayrollExpenses;

        // Get breakdown by month if year is selected but no specific month
        let monthlyBreakdown = null;
        if (!month) {
            const monthlyData = [];
            for (let m = 1; m <= 12; m++) {
                const monthStr = `${year}-${String(m).padStart(2, '0')}`;
                
                const monthFees = await Fee.find({
                    school: schoolId,
                    status: 'Paid',
                    month: monthStr,
                });
                const monthRevenue = monthFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

                const monthPayrolls = await Payroll.find({
                    school: schoolId,
                    status: 'Paid',
                    month: monthStr,
                });
                const monthPayroll = monthPayrolls.reduce((sum, payroll) => {
                    const netAmount = (payroll.amount || 0) - (payroll.deductions || 0) + (payroll.bonus || 0);
                    return sum + netAmount;
                }, 0);

                monthlyData.push({
                    month: monthStr,
                    monthName: new Date(year, m - 1, 1).toLocaleString('default', { month: 'long' }),
                    revenue: monthRevenue,
                    payroll: monthPayroll,
                    netProfit: monthRevenue - monthPayroll,
                });
            }
            monthlyBreakdown = monthlyData;
        }

        const result = {
            year: year,
            month: month || null,
            totalRevenue: totalRevenue,
            totalPayrollExpenses: totalPayrollExpenses,
            netProfit: netProfit,
            monthlyBreakdown: monthlyBreakdown,
            totalFeeRecords: paidFees.length,
            totalPayrollRecords: paidPayrolls.length,
        };

        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    getFinancialAccounting,
};

