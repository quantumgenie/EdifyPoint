import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/student/StudentModules.css';

const StudentModules = ({ student }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student?.classroomId?._id) {
      fetchModules();
    }
  }, [student]);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/modules/${student.classroomId._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModules(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch modules');
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
    <div className="student-modules">
      <h2>Learning Modules</h2>
    </div>
  );
};

StudentModules.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired
    })
  }).isRequired
};

export default StudentModules;
