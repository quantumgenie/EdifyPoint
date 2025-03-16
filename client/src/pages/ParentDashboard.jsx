import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentCard from '../components/StudentCard';
import '../styles/ParentDashboard.css';

const ParentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/students/parent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
      setLoading(false);
      console.log(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  if (loading) {
    return (
      <div className="parent-dashboard loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parent-dashboard error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchStudents}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">
          <img src="/flower-of-life.png" alt="EdifyPoint" />
          <span className="logo-text">EdifyPoint</span>
        </div>
        <div>
          <h3 className="dashboard-title">My Children</h3>
        </div>
        <div className="user-name">
          {userName} <span>▼</span>
        </div>
      </header>
{/* Main Content */}
      <main className="dashboard-content">
        <div className="students-grid">
          {students.map(student => (
            <StudentCard
              key={student._id}
              student={student}
              onClick={() => handleStudentClick(student._id)}
            />
          ))}
        </div>

        {students.length === 0 && (
          <div className="no-students">
            <h2>No Students Found</h2>
            <p>Please contact your school administrator to link your children to your account.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;
