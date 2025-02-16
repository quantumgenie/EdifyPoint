import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ClassroomCard.css';

const ClassroomCard = ({ name, studentCount, onClick }) => {
  return (
    <div className="classroom-card" onClick={onClick}>
      <div className="classroom-icon">
        <img src="/classroom-icon.png" alt="Classroom" />
      </div>
      <h3 className="classroom-name">{name}</h3>
      <p className="student-count">({studentCount} Students)</p>
    </div>
  );
};

ClassroomCard.propTypes = {
  name: PropTypes.string.isRequired,
  studentCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

export default ClassroomCard; 