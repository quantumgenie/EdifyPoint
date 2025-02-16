import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClassroomCard from '../components/ClassroomCard';
import AddClassroomCard from '../components/AddClassroomCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get user info from localStorage
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.isValid) {
          localStorage.clear();
          navigate('/login');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication failed');
        localStorage.clear();
        navigate('/login');
      }
    };

    verifyAuth();
  }, [navigate, token]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Fetching classrooms...');
        const response = await axios.get('http://localhost:8080/api/classrooms/teacher', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Response received:', response.data);
        setClassrooms(response.data);
        setLoading(false);
        setError('');
      } catch (err) {
        console.error('Detailed error:', err);
        
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', err.response.data);
          console.error('Error status:', err.response.status);
          
          if (err.response.status === 401) {
            setError('Your session has expired. Please login again.');
            localStorage.clear();
            navigate('/login');
          } else if (err.response.status === 403) {
            setError('You do not have permission to view classrooms.');
          } else {
            setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('Could not connect to the server. Please check your internet connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', err.message);
          setError('An unexpected error occurred. Please try again.');
        }
        
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [navigate, token]);

  const handleClassroomClick = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  const handleAddClassroom = () => {
    navigate('/classroom/new');
  };

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <div className="logo">
            <img src="/flower-of-life.png" alt="EdifyPoint" />
            <span className="logo-text">EdifyPoint</span>
          </div>
          <div>
            <h2 className="dashboard-title">My Classrooms</h2>
          </div>
          <div className="user-name">
            Mr. Parker <span>▼</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-content">
          
          
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Try Again
            </button>
          </div>

          <div className="classroom-grid">
            {classrooms.map(classroom => (
              <ClassroomCard
                key={classroom._id}
                name={classroom.name}
                studentCount={classroom.studentCount}
                onClick={() => handleClassroomClick(classroom._id)}
              />
            ))}
            <AddClassroomCard onClick={handleAddClassroom} />
          </div>
          
          {classrooms.length === 0 && !error && (
            <p className="no-classrooms-message">
              You haven't created any classrooms yet. Click the "Add a class" card to get started!
            </p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">
          <img src="/flower-of-life.png" alt="EdifyPoint" />
          <span className="logo-text">EdifyPoint</span>
        </div>
        <div>
          <h3 className="dashboard-title">My Classrooms</h3>
        </div>
        <div className="user-name">
          Mr. Parker <span>▼</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="classroom-grid">
          {classrooms.map(classroom => (
            <ClassroomCard
              key={classroom._id}
              name={classroom.name}
              studentCount={classroom.studentCount}
              onClick={() => handleClassroomClick(classroom._id)}
            />
          ))}
          <AddClassroomCard onClick={handleAddClassroom} />
        </div>
        
        {classrooms.length === 0 && !error && (
          <p className="no-classrooms-message">
            You haven't created any classrooms yet. Click the "Add a class" card to get started!
          </p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
