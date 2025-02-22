import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ClassroomDetail.css';
import EditClassModal from '../components/EditClassModal';
import CreateEventModal from '../components/CreateEventModal';
import CreateReportModal from '../components/CreateReportModal';

const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Students');
  const [activeSubTab, setActiveSubTab] = useState('Events');
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [classroomData, setClassroomData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentReports, setStudentReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  // Fetch classroom data
  useEffect(() => {
    fetchClassroom();
  }, [id]);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8080/api/classroom/events/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    if (activeSubTab === 'Events') {
      fetchEvents();
    }
  }, [id, activeSubTab]);

  // Fetch student reports when a student is selected
  useEffect(() => {
    const fetchStudentReports = async () => {
      if (selectedStudent) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:8080/api/classroom/reports/${id}/${selectedStudent._id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setStudentReports(response.data);
        } catch (err) {
          console.error('Error fetching student reports:', err);
        }
      }
    };

    fetchStudentReports();
  }, [selectedStudent, id]);

  const fetchClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/classrooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassroom(response.data);
      setClassroomData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classroom:', err);
      setError('Failed to load classroom details');
      setLoading(false);
    }
  };

  const handleSaveClassroom = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/classrooms/${id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Refresh classroom data after successful update
      await fetchClassroom();
    } catch (err) {
      console.error('Error updating classroom:', err);
    }
  };

  const handleStudentsUpdate = (updatedStudents) => {
    setClassroomData(prevData => ({
      ...prevData,
      students: updatedStudents
    }));
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('token');
      if (selectedEvent) {
        // Update existing event
        const response = await axios.put(
          `http://localhost:8080/api/classroom/events/update-event/${selectedEvent._id}`,
          eventData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Update the events list with the updated event
        setEvents(prevEvents => prevEvents.map(event => 
          event._id === selectedEvent._id ? response.data : event
        ));
      } else {
        // Create new event
        const response = await axios.post(
          `http://localhost:8080/api/classroom/events/create-event/${id}`,
          eventData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Update the events list with the new event
        setEvents(prevEvents => [...prevEvents, response.data]);
      }
      
      // Close the modal
      setShowCreateEventModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error creating event:', err);
      // TODO: Show error message to user
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowCreateEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8080/api/classroom/events/delete-event/${id}/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Remove the event from the list
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
      // TODO: Show error message to user
    }
  };

  const handleCreateReport = async (reportData) => {
    try {
      if (!selectedStudent) {
        alert('Please select a student first');
        return;
      }

      const token = localStorage.getItem('token');
  
      if (selectedReport) {
        // Update existing report
        const response = await axios.put(
          `http://localhost:8080/api/classroom/reports/update-report/${id}/${selectedStudent._id}/${selectedReport._id}`,
          { ...reportData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        // Update the reports list with the updated report
        setStudentReports(prevReports =>
          prevReports.map(report =>
            report._id === selectedReport._id ? response.data : report
          )
        );
      } else {
        // Create new report
        const response = await axios.post(
          `http://localhost:8080/api/classroom/reports/create-report/${id}/${selectedStudent._id}`,
          { ...reportData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log("Report created:", response.data);
  
        setStudentReports(prevReports => [...prevReports, response.data]);
      }
  
      setShowCreateReportModal(false);
      setSelectedReport(null);
    } catch (err) {
      console.error("Error creating report:", err);
    }
  };
  
  const handleEditReport = (report) => {
    setSelectedReport(report); 
    setShowCreateReportModal(true);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8080/api/classroom/reports/delete-report/${id}/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setStudentReports(prevReports => 
        prevReports.filter(report => report._id !== reportId)
      );
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!classroom) return <div className="error">Classroom not found</div>;

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
      {/* Header */}
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
            <div className="notification-icon">🔔</div>
            <div className="user-name">Mr. Parker ▼</div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="classroom-nav">
        <ul>
          <li className="back-to-classes">
            <button onClick={() => navigate('/dashboard')} className="back-button">
              ← Back to classes
            </button>
          </li>
          <li className={activeTab === 'Students' ? 'active' : ''}>
            <button onClick={() => setActiveTab('Students')}>Students</button>
          </li>
          <li className={activeTab === 'Events & Reports' ? 'active' : ''}>
            <button onClick={() => setActiveTab('Events & Reports')}>Events & Reports</button>
          </li>
          <li className={activeTab === 'Modules' ? 'active' : ''}>
            <button onClick={() => setActiveTab('Modules')}>Modules</button>
          </li>
          <li className={activeTab === 'Messages' ? 'active' : ''}>
            <button onClick={() => setActiveTab('Messages')}>Messages</button>
          </li>
          <li className="settings">
            {settingsButton}
          </li>
        </ul>
      </nav>

      {/* Content Area */}
      <main className="classroom-content">
        {activeTab === 'Students' && (
          <div className="students-grid">
            {classroom.students.map(student => (
              <div key={student._id} className="student-card">
                <div className="student-avatar-classroom">
                  <img src="/student-avatar.png" alt="Student" />
                </div>
                <div className="student-name">{student.firstName} {student.lastName}</div>
              </div>
            ))}
            <div className="add-student-card" onClick={() => setShowEditModal(true)}>
              <div className="add-icon">+</div>
              <div className="add-text">Add Student</div>
            </div>
          </div>
        )}
        {activeTab === 'Events & Reports' && (
          <div className="events-reports-container">
            <div className="toggle-buttons">
              <button className={activeSubTab === 'Events' ? 'active' : ''} onClick={() => setActiveSubTab('Events')}>Events</button>
              <button className={activeSubTab === 'Reports' ? 'active' : ''} onClick={() => setActiveSubTab('Reports')}>Reports</button>
            </div>
            {activeSubTab === 'Events' && (
              <div className="events-list">
                {events.map(event => (
                  <div key={event._id} className="event-card">
                    <div className={`event-date ${event.theme}`}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      }).toUpperCase()}
                    </div>
                    <div className="event-content">
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-time">
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="event-details">
                        <h4>Event Details:</h4>
                        <p>{event.details}</p>
                      </div>
                      <div className="event-actions">
                        <button 
                          className="edit-event"
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-event"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeSubTab === 'Events' && (
              <button className="add-event-button" onClick={() => setShowCreateEventModal(true)}>
                +
              </button>
            )}
            {activeSubTab === 'Reports' && (
              <div className="reports-container">
                <div className="students-list">
                  <h3>Students</h3>
                  {classroom.students.map(student => (
                    <div
                      key={student._id}
                      className={`student-item ${selectedStudent?._id === student._id ? 'active' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="student-avatar">
                        <img src="/student-avatar.png" alt={`${student.firstName} ${student.lastName}`} />
                      </div>
                      <div className="student-info">
                        <div className="student-name">{student.firstName} {student.lastName}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="reports-list">
                  {selectedStudent ? (
                    <>
                      <div className="reports-header">
                        <h3>Reports for {selectedStudent.firstName} {selectedStudent.lastName}</h3>
                      </div>
                      <div className="reports-content">
                        {studentReports.map(report => (
                          <div key={report._id} className="report-card">
                            <div className="report-header">
                              <div className="report-type">{report.type}</div>
                              <div className="report-date">
                                {new Date(report.createdAt).toLocaleDateString('en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="report-period">
                              from {new Date(report.observedPeriod.start).toLocaleDateString()} to {new Date(report.observedPeriod.end).toLocaleDateString()}
                            </div>
                            <div className="report-content">
                              <p>{report.details}</p>
                            </div>
                            <div className="report-actions">
                              <button 
                                className="edit-report"
                                onClick={() => handleEditReport(report)}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-report"
                                onClick={() => handleDeleteReport(report._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="add-report-button"
                        onClick={() => selectedStudent && setShowCreateReportModal(true)}
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <div className="no-student-selected">
                      <p>Select a student to view their reports</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Other tab contents will be added later */}
      </main>

      <EditClassModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        classroom={classroomData}
        onSave={handleSaveClassroom}
        onStudentsUpdate={handleStudentsUpdate}
      />

      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => {
          setShowCreateEventModal(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleCreateEvent}
        event={selectedEvent}
      />

      <CreateReportModal
        isOpen={showCreateReportModal}
        onClose={() => {
          setShowCreateReportModal(false);
          setSelectedReport(null);
        }}
        onSubmit={handleCreateReport}
        report={selectedReport}
      />
    </div>
  );
};

export default ClassroomDetail;