import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/classroom/ClassroomEventsAndReports.css';
import CreateEventModal from '../CreateEventModal';
import CreateReportModal from '../CreateReportModal';

const ClassroomEventsAndReports = ({ classroom }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [activeSubTab, setActiveSubTab] = useState('Events');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [studentReports, setStudentReports] = useState([]);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  useEffect(() => {
      const fetchEvents = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(
            `http://localhost:8080/api/classroom/events/${id}`,
            { headers }
          );
          setEvents(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching events:', err);
          setError(err.response?.data?.message || 'Failed to fetch events');
          setLoading(false);
        }
      };
  
      if (activeSubTab === 'Events') {
        fetchEvents();
      }
  }, [id, activeSubTab]);

  useEffect(() => {
    const fetchStudentReports = async () => {
      if (selectedStudent) {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(
            `http://localhost:8080/api/classroom/reports/${id}/${selectedStudent._id}`,
            { headers }
          );
          setStudentReports(response.data);
        } catch (err) {
          console.error('Error fetching student reports:', err);
        }
      }
    };

    fetchStudentReports();
  }, [selectedStudent, id]);

  const handleCreateEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      if (selectedEvent) {
        const response = await axios.put(
          `http://localhost:8080/api/classroom/events/update-event/${selectedEvent._id}`,
          eventData,
          { headers }
        );
        
        setEvents(prevEvents => prevEvents.map(event => 
          event._id === selectedEvent._id ? response.data : event
        ));
      } else {
        const response = await axios.post(
          `http://localhost:8080/api/classroom/events/create-event/${id}`,
          eventData,
          { headers }
        );
        
        setEvents(prevEvents => [...prevEvents, response.data]);
      }
      
      setShowCreateEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.message || 'Failed to create event');
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowCreateEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `http://localhost:8080/api/classroom/events/delete-event/${id}/${eventId}`,
        { headers }
      );
      
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.message || 'Failed to delete event');
      setLoading(false);
    }
  };

  const handleCreateReport = async (reportData) => {
    try {
      if (!selectedStudent) {
        alert('Please select a student first');
        return;
      }
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      if (selectedReport) {
        const response = await axios.put(
          `http://localhost:8080/api/classroom/reports/update-report/${id}/${selectedStudent._id}/${selectedReport._id}`,
          { ...reportData },
          { headers }
        );
        setStudentReports(prevReports =>
          prevReports.map(report =>
            report._id === selectedReport._id ? response.data : report
          )
        );
      } else {
        const response = await axios.post(
          `http://localhost:8080/api/classroom/reports/create-report/${id}/${selectedStudent._id}`,
          { ...reportData },
          { headers }
        );
        setStudentReports(prevReports => [...prevReports, response.data]);
      }
      setShowCreateReportModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error creating report:", error);
      setError(error.response?.data?.message || 'Failed to create report');
      setLoading(false);
    }
  };
  
  const handleEditReport = (report) => {
    setSelectedReport(report); 
    setShowCreateReportModal(true);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `http://localhost:8080/api/classroom/reports/delete-report/${id}/${reportId}`,
        { headers }
      );
      setStudentReports(prevReports => 
        prevReports.filter(report => report._id !== reportId)
      );
    } catch (error) {
      console.error('Error deleting report:', error);
      setError(error.response?.data?.message || 'Failed to delete report');
      setLoading(false);
    }
  };

  if (loading) {
      return <div className="loader"></div>;
    }
  
  if (error) {
      return <div className="error-message">{error}</div>;
  }
  return (
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
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this event?')) {
                            handleDeleteEvent(event._id);
                          }
                        }}
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
              <div className="reports-students-list">
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
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this report?')) {
                                  handleDeleteReport(report._id);
                                }
                              }}
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
}

ClassroomEventsAndReports.propTypes = {
  classroom: PropTypes.object.isRequired
};

export default ClassroomEventsAndReports;
