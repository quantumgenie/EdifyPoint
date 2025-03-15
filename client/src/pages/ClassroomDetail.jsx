import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ClassroomDetail.css';
import EditClassModal from '../components/EditClassModal';
import CreateEventModal from '../components/CreateEventModal';
import CreateReportModal from '../components/CreateReportModal';
import CreateModuleModal from '../components/CreateModuleModal';
import CreateLessonModal from '../components/CreateLessonModal';

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
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [activeModuleDropdown, setActiveModuleDropdown] = useState(null);
  const [activeLessonDropdown, setActiveLessonDropdown] = useState(null);

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

  // Fetch modules data
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:8080/api/modules/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setModules(response.data);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    if (activeTab === 'Modules') {
      fetchModules();
    }
  }, [id, activeTab]);

  // Fetch lessons for a module
  const fetchLessonsForModule = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/lessons/module/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLessons(response.data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  // Fetch lessons when a module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchLessonsForModule(selectedModule._id);
    } else {
      setLessons([]);
    }
  }, [selectedModule]);

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

  const handleCreateModule = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (selectedModule) {
        // Update existing module
        const response = await axios.put(
          `http://localhost:8080/api/modules/${selectedModule._id}`,
          {
            name: formData.name,
            color: formData.color
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setModules(prevModules => 
          prevModules.map(module => 
            module._id === selectedModule._id ? response.data : module
          )
        );
        setSelectedModule(null);
      } else {
        // Create new module
        const response = await axios.post(
          'http://localhost:8080/api/modules/create',
          {
            name: formData.name,
            color: formData.color,
            classroomId: classroom._id
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setModules(prevModules => [...prevModules, response.data]);
      }
      setShowCreateModuleModal(false);
    } catch (error) {
      console.error('Error creating/updating module:', error);
      alert(selectedModule ? 'Failed to update module' : 'Failed to create module');
    }
  };

  const handleCreateLesson = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create or edit lessons');
        return;
      }

      if (selectedLesson) {
        // Update existing lesson
        const response = await axios.put(
          `http://localhost:8080/api/lessons/${selectedLesson._id}`,
          {
            name: formData.name,
            description: formData.description,
            videoUrl: formData.videoUrl,
            quiz: formData.quiz
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setLessons(prevLessons => 
          prevLessons.map(lesson => 
            lesson._id === selectedLesson._id ? response.data : lesson
          )
        );
        setSelectedLesson(response.data);
      } else {
        // Create new lesson
        const response = await axios.post(
          `http://localhost:8080/api/lessons/${selectedModule._id}`,
          {
            name: formData.name,
            description: formData.description,
            videoUrl: formData.videoUrl,
            quiz: formData.quiz
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setLessons(prevLessons => [...prevLessons, response.data]);
        setSelectedLesson(response.data);
      }
      setShowCreateLessonModal(false);
    } catch (error) {
      console.error('Error creating/updating lesson:', error);
      if (error.response?.status === 401) {
        alert('You are not authorized to perform this action. Please make sure you are logged in as a teacher.');
      } else {
        alert(selectedLesson ? 'Failed to update lesson' : 'Failed to create lesson');
      }
    }
  };

  const handleModuleActionClick = (e, moduleId) => {
    e.stopPropagation();
    setActiveModuleDropdown(activeModuleDropdown === moduleId ? null : moduleId);
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to delete modules');
        return;
      }

      await axios.delete(
        `http://localhost:8080/api/modules/${moduleId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setModules(prevModules => prevModules.filter(module => module._id !== moduleId));
      if (selectedModule?._id === moduleId) {
        setSelectedModule(null);
        setLessons([]);
      }
      setActiveModuleDropdown(null);
      alert('Module deleted successfully');
    } catch (error) {
      console.error('Error deleting module:', error);
      if (error.response?.status === 401) {
        alert('You are not authorized to perform this action. Please make sure you are logged in as a teacher.');
      } else {
        alert('Failed to delete module. Please try again.');
      }
    }
  };

  const handleEditModule = (e, module) => {
    e.stopPropagation();
    setSelectedModule(module);
    setShowCreateModuleModal(true);
    setActiveModuleDropdown(null);
  };

  const handleLessonActionClick = (e) => {
    e.stopPropagation();
    setActiveLessonDropdown(activeLessonDropdown === selectedLesson._id ? null : selectedLesson._id);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to delete lessons');
        return;
      }

      await axios.delete(
        `http://localhost:8080/api/lessons/${lessonId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setLessons(prevLessons => prevLessons.filter(lesson => lesson._id !== lessonId));
      if (selectedLesson?._id === lessonId) {
        setSelectedLesson(null);
      }
      setActiveLessonDropdown(null);
      alert('Lesson deleted successfully');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      if (error.response?.status === 401) {
        alert('You are not authorized to perform this action. Please make sure you are logged in as a teacher.');
      } else {
        alert('Failed to delete lesson. Please try again.');
      }
    }
  };

  const handleEditLesson = (e, lesson) => {
    e.stopPropagation();
    setSelectedLesson(lesson);
    setShowCreateLessonModal(true);
    setActiveLessonDropdown(null);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setActiveLessonDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveLessonDropdown(null);
      setActiveModuleDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
              <div className="add-student-icon">+</div>
              <div className="add-student-text">Add Student</div>
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
        {activeTab === 'Modules' && (
          <div className="modules-container">
            {/* Modules List */}
            <div className="modules-list">
              {modules.map(module => (
                <div
                  key={module._id}
                  className={`module-item ${selectedModule?._id === module._id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedModule(module);
                    setSelectedLesson(null);
                  }}
                >
                  <div 
                    className="module-icon"
                    style={{ backgroundColor: module.color || '#1a73e8' }}
                  >
                    {module.name.charAt(0)}
                  </div>
                  <div className="module-name">{module.name}</div>
                  <div className="module-actions">
                    <button 
                      className="module-actions-button" 
                      onClick={(e) => handleModuleActionClick(e, module._id)}
                    >
                      •••
                    </button>
                    {activeModuleDropdown === module._id && (
                      <div className="module-dropdown">
                        <button onClick={(e) => handleEditModule(e, module)}>
                          Edit
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this module?')) {
                            handleDeleteModule(module._id);
                          }
                        }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="add-new" onClick={() => {
                setSelectedModule(null);
                setShowCreateModuleModal(true);
              }}>
                <div className="add-icon">+</div>
                <span>Add new</span>
              </div>
            </div>

            {/* Lessons List */}
            <div className="lessons-list">
              {selectedModule ? (
                <>
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson._id}
                      className={`lesson-item ${selectedLesson?._id === lesson._id ? 'selected' : ''}`}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="lesson-number">{index + 1}</div>
                      <div className="lesson-title">Lesson {index + 1}</div>
                    </div>
                  ))}
                  <div className="add-new" onClick={() => {
                    setSelectedLesson(null);
                    setShowCreateLessonModal(true);
                  }}>
                    <div className="add-icon">+</div>
                    <span>Add new</span>
                  </div>
                </>
              ) : (
                <div className="no-selection-message">
                  Select a module to view its lessons
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <div className="lesson-content">
              {selectedLesson ? (
                <>
                  <div className="lesson-content-header">
                    <h1 className="lesson-content-title">{selectedLesson.name}</h1>
                    <div className="lesson-actions">
                      <button 
                        className="lesson-actions-button" 
                        onClick={handleLessonActionClick}
                      >
                        •••
                      </button>
                      {activeLessonDropdown === selectedLesson._id && (
                        <div className="lesson-dropdown">
                          <button onClick={(e) => handleEditLesson(e, selectedLesson)}>
                            Edit
                          </button>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this lesson?')) {
                              handleDeleteLesson(selectedLesson._id);
                            }
                          }}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="content-section">
                    {selectedLesson.description && (
                      <div className="lesson-description">
                        {selectedLesson.description}
                      </div>
                    )}

                    {selectedLesson.videoUrl && (
                      <div className="video-container">
                        <iframe
                          src={selectedLesson.videoUrl}
                          title={selectedLesson.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
                      <div className="quiz-section">
                        <h2>Quiz</h2>
                        {selectedLesson.quiz.map((question, index) => (
                          <div key={index} className="quiz-question">
                            <h3>Question {index + 1}: {question.text}</h3>
                            <div className="options">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="option">
                                  <input
                                    type="radio"
                                    id={`q${index}-o${optionIndex}`}
                                    name={`question-${index}`}
                                    value={optionIndex}
                                  />
                                  <label htmlFor={`q${index}-o${optionIndex}`}>
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-selection-message">
                  Select a lesson to view its content
                </div>
              )}
            </div>
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
      <CreateModuleModal
        isOpen={showCreateModuleModal}
        onClose={() => {
          setShowCreateModuleModal(false);
          setSelectedModule(null);
        }}
        onSubmit={handleCreateModule}
        module={selectedModule}
      />
      <CreateLessonModal
        isOpen={showCreateLessonModal}
        onClose={() => {
          setShowCreateLessonModal(false);
          if (!selectedLesson?._id) {
            setSelectedLesson(null);
          }
        }}
        onSubmit={handleCreateLesson}
        lesson={selectedLesson}
      />
    </div>
  );
};

export default ClassroomDetail;