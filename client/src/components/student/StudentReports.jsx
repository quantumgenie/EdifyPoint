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

      const response = await axios.get(
        `http://localhost:8080/api/classroom/reports/${student.classroomId._id}/${student._id}`,
        { headers }
      );

      setReports(response.data);
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
    <div className="student-reports-container">
      <div className="student-reports-list">
        {reports.length > 0 ? (
          reports.map(report => (
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
              {report.observedPeriod && (
                <div className="report-period">
                  From {new Date(report.observedPeriod.start).toLocaleDateString()} to{' '}
                  {new Date(report.observedPeriod.end).toLocaleDateString()}
                </div>
              )}
              <div className="report-content">
                <p>{report.details}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-reports">
            <p>No reports available for this student</p>
          </div>
        )}
      </div>
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
