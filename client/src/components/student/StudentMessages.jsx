import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/student/StudentMessages.css';

const StudentMessages = ({ student }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (loading) {
    return <div className="loader"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="student-messages">
      <h2>Messages</h2>
    </div>
  );
};

StudentMessages.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired
  }).isRequired
};

export default StudentMessages;
