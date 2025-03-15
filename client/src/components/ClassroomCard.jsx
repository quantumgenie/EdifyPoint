import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ClassroomCard.css';

const ClassroomCard = ({ classroom, onClick, onEdit, onDelete }) => {
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="classroom-card" onClick={onClick}>
      <div className="classroom-icon">
        <img src="/classroom-icon.png" alt="Classroom" />
      </div>
      <h3 className="classroom-name">{classroom.name}</h3>
      <p className="classroom-info">
        <span className="school-name">{classroom.school}</span>
        <span className="student-count">({classroom.studentCount} Students)</span>
      </p>
      <div className="card-actions">
        <button className="action-button edit" onClick={handleEditClick}>
          Edit
        </button>
        <button className="action-button delete" onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
    </div>
  );
};

ClassroomCard.propTypes = {
  classroom: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    school: PropTypes.string.isRequired,
    studentCount: PropTypes.number.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ClassroomCard;