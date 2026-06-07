import { Container, Grid, Paper, Box } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getFinancialAccounting } from '../../redux/financialRelated/financialHandle';
import FinancialAccounting from './financialRelated/FinancialAccounting';
import { fetchAttendanceReport, fetchFeesReport } from '../../redux/reportRelated/reportHandle';
import AttendanceFeesCharts from '../../components/reports/AttendanceFeesCharts';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { financialData } = useSelector((state) => state.financial);

    const { currentUser } = useSelector(state => state.user)

    const adminID = currentUser._id
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
        // Fetch current year financial data for Fees Collection card
        dispatch(getFinancialAccounting(adminID, currentYear));
        dispatch(fetchAttendanceReport(adminID, 6));
        dispatch(fetchFeesReport(adminID, 6));
    }, [adminID, dispatch, currentYear]);

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;
    
    // Get total revenue from fees for current year (for Fees Collection card)
    const totalFeesRevenue = financialData?.totalRevenue || 0;

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <img src={Students} alt="Students" style={{ height: '48px', objectFit: 'contain' }} />
                            </Box>
                            <Box>
                                <Title>Total Students</Title>
                                <Data start={0} end={numberOfStudents} duration={2.5} />
                            </Box>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <img src={Classes} alt="Classes" style={{ height: '48px', objectFit: 'contain' }} />
                            </Box>
                            <Box>
                                <Title>Total Classes</Title>
                                <Data start={0} end={numberOfClasses} duration={5} />
                            </Box>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <img src={Teachers} alt="Teachers" style={{ height: '48px', objectFit: 'contain' }} />
                            </Box>
                            <Box>
                                <Title>Total Teachers</Title>
                                <Data start={0} end={numberOfTeachers} duration={2.5} />
                            </Box>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <img src={Fees} alt="Fees" style={{ height: '48px', objectFit: 'contain' }} />
                            </Box>
                            <Box>
                                <Title>Fees Collection</Title>
                                <Data start={0} end={totalFeesRevenue} duration={2.5} prefix="₹" />
                            </Box>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <AttendanceFeesCharts hideSummaries />
                    </Grid>
                    <Grid item xs={12}>
                        <FinancialAccounting />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};


const StyledPaper = styled(Paper)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  text-align: left;
  border-radius: 16px;
  border: 1px solid #EAEAEC;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.06);
  }
`;

const Title = styled.p`
  font-size: 0.85rem;
  font-weight: 600;
  color: #8B8B8B;
  margin: 16px 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Data = styled(CountUp)`
  font-size: 2rem;
  font-weight: 700;
  color: #1E1E1E;
`;

export default AdminHomePage