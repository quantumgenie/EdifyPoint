import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/student/StudentReports.css';

const StudentReports = ({ student }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student?.classroomId?._id) {
      fetchReports();
    }
  }, [student]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch reports in parallel
      const reportsRes = await Promise.all([
        axios.get(`http://localhost:8080/api/reports/${student.classroomId._id}/${student._id}`, { headers })
      ]);

      setReports(reportsRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
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
    <div className="student-reports">
      <h2>Reports</h2>
    </div>
  );
};

StudentReports.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired
    })
  }).isRequired
};

export default StudentReports;
