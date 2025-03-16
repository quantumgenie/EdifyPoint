import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClassroomCard from '../components/ClassroomCard';
import AddClassroomCard from '../components/AddClassroomCard';
import CreateClassModal from '../components/CreateClassModal';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Get user info from localStorage
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
        setLoading(false);
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
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch classrooms');
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [navigate, token]);

  const handleCreateClass = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create a class');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/api/classrooms',
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setClassrooms(prev => [...prev, response.data]);
      setShowCreateModal(false);
      alert('Class created successfully!');
    } catch (error) {
      console.error('Error creating class:', error);
      if (error.response?.status === 401) {
        alert('You are not authorized to create classes. Please make sure you are logged in as a teacher.');
      } else {
        alert('Failed to create class. Please try again.');
      }
    }
  };

  const handleEditClass = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to edit a class');
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/classrooms/${selectedClassroom._id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setClassrooms(prev => 
        prev.map(classroom => 
          classroom._id === selectedClassroom._id ? response.data : classroom
        )
      );
      setShowEditModal(false);
      setSelectedClassroom(null);
      alert('Class updated successfully!');
    } catch (error) {
      console.error('Error updating class:', error);
      if (error.response?.status === 401) {
        alert('You are not authorized to edit this class. Please make sure you are logged in as a teacher.');
      } else {
        alert('Failed to update class. Please try again.');
      }
    }
  };

  const handleDeleteClass = async (classroomId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to delete a class');
        return;
      }

      await axios.delete(
        `http://localhost:8080/api/classrooms/${classroomId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setClassrooms(prev => prev.filter(classroom => classroom._id !== classroomId));
      alert('Class deleted successfully!');
    } catch (error) {
      console.error('Error deleting class:', error);
      if (error.response?.status === 401) {
        alert('You are not authorized to delete this class. Please make sure you are logged in as a teacher.');
      } else {
        alert('Failed to delete class. Please try again.');
      }
    }
  };

  const handleClassroomClick = (classroomId) => {
    navigate(`/classroom/${classroomId}`);
  };

  if (loading) {
    return (
      <div className="teacher-dashboard loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-dashboard error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchClassrooms}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
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
          {userName} <span>▼</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="classroom-grid">
          {classrooms.map(classroom => (
            <ClassroomCard
              key={classroom._id}
              classroom={classroom}
              onEdit={() => {
                setSelectedClassroom(classroom);
                setShowEditModal(true);
              }}
              onDelete={() => {
                if (window.confirm('Are you sure you want to delete this class?')) {
                  handleDeleteClass(classroom._id);
                }
              }}
              onClick={() => handleClassroomClick(classroom._id)}
            />
          ))}
          <AddClassroomCard onClick={() => setShowCreateModal(true)} />
        </div>
        
        {classrooms.length === 0 && (
          <p className="no-classrooms-message">
            You haven't created any classrooms yet. Click the "Add a classroom" card to get started!
          </p>
        )}
      </main>

      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
      />

      <CreateClassModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClassroom(null);
        }}
        onSubmit={handleEditClass}
        classroom={selectedClassroom}
      />
    </div>
  );
};

export default TeacherDashboard;
