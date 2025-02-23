import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ClassroomCard.css';

const AddClassroomCard = ({ onClick }) => {
  return (
    <div className="classroom-card add-classroom-card" onClick={onClick}>
      <div className="add-classroom-icon">+</div>
      <h3 className="add-classroom-text">Add a classroom</h3>
    </div>
  );
};

AddClassroomCard.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default AddClassroomCard; 