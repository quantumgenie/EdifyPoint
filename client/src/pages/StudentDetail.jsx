import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/StudentDetail.css';

// Tab Components
import StudentEvents from '../components/student/StudentEvents';
import StudentReports from '../components/student/StudentReports';
import StudentModules from '../components/student/StudentModules';
import StudentMessages from '../components/student/StudentMessages';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="student-detail loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-detail error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-detail not-found">
        <h2>Student Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  return (
    <div className="student-detail">
      <header className="student-header">
          <div className="left-section logo">
            <img src="/flower-of-life.png" alt="EdifyPoint" />
            <span className="logo-text">EdifyPoint</span>
          </div>
          <div className="center-section">
            <h1>{student.firstName} {student.lastName}</h1>
          </div>
          <div className="right-section">
            <div className="user-info">
              <div className="notification-icon">🔔</div>
              <div className="user-name">{userName} ▼</div>
            </div>
          </div>
      </header>

      <main className="student-content">
          <Tabs>
            <TabList>
              <button onClick={() => navigate('/parent/dashboard')} className="back-button">
                ← Back to students
              </button>
              <div className="tab-wrapper">
                <Tab>Modules</Tab>
                <Tab>Events</Tab>
                <Tab>Reports</Tab>
                <Tab>Messages</Tab>
              </div>
            </TabList>

            <TabPanel>
              <StudentModules student={student} />
            </TabPanel>
            
            <TabPanel>
              <StudentEvents student={student} />
            </TabPanel>
            
            <TabPanel>
              <StudentReports student={student} />
            </TabPanel>

            <TabPanel>
              <StudentMessages student={student} />
            </TabPanel>
          </Tabs>
      </main>
    </div>
  );
};

export default StudentDetail;
