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

      // Fetch events and reports in parallel
      const eventsRes = await Promise.all([
        axios.get(`http://localhost:8080/api/events/${student.classroomId._id}`, { headers })
      ]);

      setEvents(eventsRes.data);
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
    <div className="student-events">
      <h2>Events</h2>
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
