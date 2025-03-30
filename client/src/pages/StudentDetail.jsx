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
import NotificationBubble from '../components/common/NotificationBubble';
import PasswordVerificationModal from '../components/student/PasswordVerificationModal';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  useEffect(() => {
    if (student?.classroomId) {
      localStorage.setItem(`student_${student._id}_classroom`, student.classroomId._id);
      localStorage.setItem(`student_${student._id}_teacher`, student.teacherId);
    }
    return () => {
      if (student?._id) {
        localStorage.removeItem(`student_${student._id}_classroom`);
        localStorage.removeItem(`student_${student._id}_teacher`);
      }
    };
  }, [student]);

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

  const handleTabSelect = (index) => {
    if (index > 0 && !isPasswordVerified) {
      setSelectedTabIndex(0); // Stay on current tab
      setShowPasswordModal(true);
      return false;
    }
    setSelectedTabIndex(index);
    return true;
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
            <div className="notification-wrapper">
              <NotificationBubble />
            </div>
            <div className="user-name">{userName} ▼</div>
          </div>
        </div>
      </header>

      <main className="student-content">
        <Tabs selectedIndex={selectedTabIndex} onSelect={handleTabSelect}>
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
            {isPasswordVerified ? (
              <StudentEvents student={student} />
            ) : (
              <div className="locked-content">
                <p>Please verify your password to view content</p>
                <button onClick={() => setShowPasswordModal(true)}>Verify Password</button>
              </div>
            )}
          </TabPanel>
          <TabPanel>
            {isPasswordVerified ? (
              <StudentReports student={student} />
            ) : (
              <div className="locked-content">
                <p>Please verify your password to view content</p>
                <button onClick={() => setShowPasswordModal(true)}>Verify Password</button>
              </div>
            )}
          </TabPanel>
          <TabPanel>
            {isPasswordVerified ? (
              <StudentMessages student={student} />
            ) : (
              <div className="locked-content">
                <p>Please verify your password to view content</p>
                <button onClick={() => setShowPasswordModal(true)}>Verify Password</button>
              </div>
            )}
          </TabPanel>
        </Tabs>
        <PasswordVerificationModal 
          show={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedTabIndex(0);
          }}
          onVerificationSuccess={() => {
            setIsPasswordVerified(true);
            setShowPasswordModal(false);
            setSelectedTabIndex(selectedTabIndex);
          }}
          verifyingPassword={verifyingPassword}
        />
      </main>
    </div>
  );
};

export default StudentDetail;
