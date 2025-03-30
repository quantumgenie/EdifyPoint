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
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);

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

  useEffect(() => {
    if (selectedModule) {
      fetchLessonsForModule(selectedModule._id);
    } else {
      setLessons([]);
    }
  }, [selectedModule]);

  const handleLessonClick = async (lesson) => {
    setSelectedLesson(lesson);
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(null);
    
    // Fetch quiz attempts for this lesson
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/lessons/${lesson._id}/attempts/${student._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizAttempts(response.data);
    } catch (err) {
      console.error('Error fetching quiz attempts:', err);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/lessons/${selectedLesson._id}/submit-quiz`,
        {
          studentId: student._id,
          answers: quizAnswers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizScore(response.data.score);
      setQuizSubmitted(true);
      setQuizAttempts([...quizAttempts, response.data]);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="student-modules-container">
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

        {selectedModule ? (
          <div className="lessons-list">
            {lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`lesson-item ${selectedLesson?._id === lesson._id ? 'active' : ''}`}
                onClick={() => handleLessonClick(lesson)}
              >
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-title">{lesson.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="select-module-message">
            Please select a module to view its lessons
          </div>
        )}

        {selectedLesson && (
          <div className="lesson-content">
            <div className="lesson-content-header">
              {quizScore !== null && (
                <div className="quiz-score">
                  Latest Score: {quizScore}%
                </div>
              )}
              <h2 className="lesson-content-title">{selectedLesson.name}</h2>
            </div>

            <div className="lesson-description">{selectedLesson.description}</div>
            
            {selectedLesson.videoUrl && (
              <div className="video-container">
                <iframe
                  src={selectedLesson.videoUrl}
                  title={selectedLesson.name}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
              <div className="quiz-section">
                <h3>Quiz</h3>
                {!quizSubmitted ? (
                  <>
                    {selectedLesson.quiz.map((question, qIndex) => (
                      <div key={qIndex} className="quiz-question">
                        <p>{question.text}</p>
                        <div className="quiz-options">
                          {question.options.map((option, oIndex) => (
                            <label key={oIndex} className="quiz-option">
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                checked={quizAnswers[qIndex] === oIndex}
                                onChange={() => handleAnswerSelect(qIndex, oIndex)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      className="submit-quiz-btn"
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.length !== selectedLesson.quiz.length}
                    >
                      Submit Quiz
                    </button>
                  </>
                ) : (
                  <div className="quiz-results">
                    <h4>Quiz Results</h4>
                    <p>Your score: {quizScore}%</p>
                    <button className="retake-quiz-btn" onClick={handleRetakeQuiz}>
                      Retake Quiz
                    </button>
                  </div>
                )}

                {quizAttempts.length > 0 && (
                  <div className="quiz-history">
                    <h4>Previous Attempts</h4>
                    <div className="attempts-list">
                      {quizAttempts.map((attempt, index) => (
                        <div key={index} className="attempt-item">
                          <span>Score: {attempt.score}% </span>
                          <span>Date: {new Date(attempt.attemptDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

StudentModules.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default StudentModules;
