import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/student/StudentModules.css';

const StudentModules = ({ student }) => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student?.classroomId?._id) {
      fetchModules();
    }
  }, [student]);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/modules/${student.classroomId._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModules(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch modules');
      setLoading(false);
    }
  };

  // Fetch lessons for a module
  const fetchLessonsForModule = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/lessons/module/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLessons(response.data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  // Fetch lessons when a module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchLessonsForModule(selectedModule._id);
    } else {
      setLessons([]);
    }
  }, [selectedModule]);

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="student-modules-container">
      {/* Modules List */}
      <div className="modules-list">
          {modules.map(module => (
            <div
              key={module._id}
              className={`module-item ${selectedModule?._id === module._id ? 'active' : ''}`}
              onClick={() => {
                setSelectedModule(module);
                setSelectedLesson(null);
              }}
            >
              <div 
                className="module-icon"
                style={{ backgroundColor: module.color || '#1a73e8' }}
              >
                {module.name.charAt(0)}
              </div>
              <div className="module-name">{module.name}</div>
            </div>
          ))}
      </div>
      {/* Lessons List */}
      <div className="lessons-list">
        {selectedModule ? (
          <>
            {lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`lesson-item ${selectedLesson?._id === lesson._id ? 'selected' : ''}`}
                onClick={() => handleLessonClick(lesson)}
              >
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-title">Lesson {index + 1}</div>
              </div>
            ))}
          </>
        ) : (
          <div className="no-selection-message">
            Select a module to view its lessons
          </div>
        )}
      </div>
      {/* Lesson Content */}
      <div className="lesson-content">
        {selectedLesson ? (
          <>
            <div className="lesson-content-header">
                <h1 className="lesson-content-title">{selectedLesson.name}</h1>
              </div>
              <div className="content-section">
                {selectedLesson.description && (
                  <div className="lesson-description">
                    {selectedLesson.description}
                  </div>
                )}

                {selectedLesson.videoUrl && (
                  <div className="video-container">
                    <iframe
                      src={selectedLesson.videoUrl}
                      title={selectedLesson.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
                  <div className="quiz-section">
                    <h2>Quiz</h2>
                    {selectedLesson.quiz.map((question, index) => (
                      <div key={index} className="quiz-question">
                        <h3>Question {index + 1}: {question.text}</h3>
                        <div className="options">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="option">
                              <input
                                type="radio"
                                id={`q${index}-o${optionIndex}`}
                                name={`question-${index}`}
                                value={optionIndex}
                              />
                              <label htmlFor={`q${index}-o${optionIndex}`}>
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection-message">
              Select a lesson to view its content
            </div>
          )}
    </div>
    </div>
  );
};

StudentModules.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      school: PropTypes.string.isRequired
    })
  }).isRequired
};

export default StudentModules;
