import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/classroom/ClassroomStudents.css';
import EditClassModal from '../EditClassModal';

const ClassroomStudents = ({ classroom }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (classroom?.students) {
      setLoading(false);
    }
  }, [classroom]);


  const handleAddStudent = () => {
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  const handleSaveClassroom = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `http://localhost:8080/api/classrooms/${classroom._id}`,
        updatedData,
        { headers }
      );
      // Refresh classroom data after successful update
      await fetchClassroom();
    } catch (error) {
      console.error('Error updating classroom:', error);
      setError(error.response?.data?.message || 'Failed to update classroom');
      setLoading(false);
    }
  };

  const fetchClassroom = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `http://localhost:8080/api/classrooms/${classroom._id}`,
        { headers }
      );
      setClassroom(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classroom:', err);
      setError(err.response?.data?.message || 'Failed to fetch classroom');
      setLoading(false);
    }
  };

  const handleStudentsUpdate = (updatedStudents) => {
    setClassroom(prevData => ({
      ...prevData,
      students: updatedStudents
    }));
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="classroom-students-container">
      {classroom.students.map(student => (
        <div key={student._id} className="student-card">
          <div className="student-avatar-classroom">
            <img src="/student-avatar.png" alt="Student" />
          </div>
          <div className="student-name">{student.firstName} {student.lastName}</div>
        </div>
      ))}
      <div className="add-student-card" onClick={handleAddStudent}>
        <div className="add-student-icon">+</div>
        <div className="add-student-text">Add Student</div>
      </div>
      {showEditModal && (
        <EditClassModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          classroom={classroom}
          onSave={handleSaveClassroom}
          onStudentsUpdate={handleStudentsUpdate}
        />
      )}
    </div>
  );
};

ClassroomStudents.propTypes = {
  classroom: PropTypes.object.isRequired
};

export default ClassroomStudents;
