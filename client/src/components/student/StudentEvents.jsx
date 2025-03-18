import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/student/StudentEvents.css';

const StudentEvents = ({ student }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student?.classroomId?._id) {
      fetchEvents();
    }
  }, [student]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `http://localhost:8080/api/classroom/events/${student.classroomId._id}`,
        { headers }
      );

      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
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
    <div className="student-events-container">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

StudentEvents.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired
    })
  }).isRequired
};

export default StudentEvents;
