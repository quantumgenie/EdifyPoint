import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../styles/ClassroomDetail.css';
import ClassroomStudents from '../components/classroom/ClassroomStudents';
import ClassroomEventsAndReports from '../components/classroom/ClassroomEventsAndReports';
import ClassroomModules from '../components/classroom/ClassroomModules';
import ClassroomMessages from '../components/classroom/ClassroomMessages';
import EditClassModal from '../components/EditClassModal';
import NotificationBubble from '../components/common/NotificationBubble';

const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);


  // Fetch classroom data
  useEffect(() => {
    fetchClassroom();
  }, [id]);

  useEffect(() => {
    if (classroom?._id) {
      localStorage.setItem(`classroom_${classroom._id}_classroom`, classroom._id);
      localStorage.setItem(`classroom_${classroom._id}_teacher`, userId);
    }
    return () => {
      if (classroom?._id) {
        localStorage.removeItem(`classroom_${classroom._id}_classroom`);
        localStorage.removeItem(`classroom_${classroom._id}_teacher`);
      }
    };
  }, [classroom]);

  const handleSaveClassroom = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `http://localhost:8080/api/classrooms/${id}`,
        updatedData,
        { headers }
      );
      // Refresh classroom data after successful update
      await fetchClassroom();
    } catch (error) {
      console.error('Error updating classroom:', error);
      setError(error.response?.data?.message || 'Failed to update classroom');
      setLoading(false);
    }
  };
  
  const fetchClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `http://localhost:8080/api/classrooms/${id}/details`, 
        { headers }
      );

      // Ensure we have the teacher data in the correct format
      const classroomData = response.data;
      if (!classroomData.teacher && classroomData.teacherId) {
        classroomData.teacher = classroomData.teacherId;
        delete classroomData.teacherId;
      }

      setClassroom(classroomData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classroom:', err);
      setError(err.response?.data?.message || 'Failed to fetch classroom');
      setLoading(false);
    }
  };

  const handleStudentsUpdate = (updatedStudents) => {
    setClassroom(prevData => ({
      ...prevData,
      students: updatedStudents
    }));
  };

  if (loading) {
    return (
      <div className="classroom-detail loading">
        <div className="loader"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="classroom-detail error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }
  if (!classroom) {
    return (
      <div className="classroom-detail not-found">
        <h2>Classroom Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const settingsButton = (
    <div className="settings-container">
      <button 
        className="settings-button"
        onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
      >
        Settings ▼
      </button>
      {showSettingsDropdown && (
        <div className="settings-dropdown">
          <button onClick={() => {
            setShowEditModal(true);
            setShowSettingsDropdown(false);
          }}>
            Edit Class
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="classroom-detail">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <header className="classroom-header">
            <div className="left-section logo">
              <img src="/flower-of-life.png" alt="EdifyPoint" />
              <span className="logo-text">EdifyPoint</span>
            </div>
            <div className="center-section">
              <h1>{classroom.name}</h1>
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

          <main className="classroom-content">
            <Tabs>
              <TabList>
                <button onClick={() => navigate('/teacher/dashboard')} className="back-button">
                  ← Back to classes
                </button>
                <div className="tab-wrapper">
                  <Tab>Students</Tab>
                  <Tab>Events & Reports</Tab>
                  <Tab>Modules</Tab>
                  <Tab>Messages</Tab>
                </div>
                <div className="settings-container">
                  {settingsButton}
                </div>
              </TabList>
              <TabPanel>
                <ClassroomStudents
                  classroom={classroom}
                />
              </TabPanel>
              <TabPanel>
                <ClassroomEventsAndReports
                  classroom={classroom}
                />
              </TabPanel>
              <TabPanel>
                <ClassroomModules
                  classroom={classroom}
                />
              </TabPanel>
              <TabPanel>
                <ClassroomMessages
                  classroom={classroom}
                />
              </TabPanel>
            </Tabs>
          </main>
          <EditClassModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            classroom={classroom}
            onSave={handleSaveClassroom}
            onStudentsUpdate={handleStudentsUpdate}
          />
        </>
      )}
    </div>
  );
};

export default ClassroomDetail;