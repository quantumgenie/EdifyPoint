import React from 'react';
import PropTypes from 'prop-types';
import '../styles/StudentCard.css';

const StudentCard = ({ student, onClick }) => {
  return (
    <div className="dashboard-student-card" onClick={onClick}>
      <div className="student-icon">
        <img src="/student-avatar.png" alt="Student" />
      </div>
      <h3 className="studentcard-student-name">{student.firstName} {student.lastName}</h3>
      <p className="student-info">
        {student.classroomId && (
          <>
            <span className="studentcard-classroom-name">{student.classroomId.name}</span>
            <span className="studentcard-school-name">{`(${student.classroomId.school})`}</span>
          </>
        )}
      </p>
    </div>
  );
};

StudentCard.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired
    }),
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default StudentCard;
