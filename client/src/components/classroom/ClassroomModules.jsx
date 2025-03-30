import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../styles/classroom/ClassroomModules.css';
import CreateModuleModal from '../CreateModuleModal';
import CreateLessonModal from '../CreateLessonModal';

const ClassrooomModules = ({ classroom }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [activeModuleDropdown, setActiveModuleDropdown] = useState(null);
  const [activeLessonDropdown, setActiveLessonDropdown] = useState(null);

  // Fetch modules data
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `http://localhost:8080/api/modules/${classroom._id}`,
          { headers }
        );
        setModules(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'Failed to fetch modules');
        setLoading(false);
      }
    };

    fetchModules();
  }, [classroom._id]);

  // Fetch lessons when a module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchLessonsForModule(selectedModule._id);
    } else {
      setLessons([]);
    }
  }, [selectedModule]);

  // Fetch lessons for a module
  const fetchLessonsForModule = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `http://localhost:8080/api/lessons/module/${moduleId}`,
        { headers }
      );
      setLessons(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError(err.response?.data?.message || 'Failed to fetch lessons');
      setLoading(false);
    }
  };


  const handleCreateModule = async (formData) => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        if (selectedModule) {
          // Update existing module
          const response = await axios.put(
            `http://localhost:8080/api/modules/${selectedModule._id}`,
            {
              name: formData.name,
              color: formData.color
            },
            { headers }
          );
          
          setModules(prevModules => 
            prevModules.map(module => 
              module._id === selectedModule._id ? response.data : module
            )
          );
          setSelectedModule(null);
        } else {
          // Create new module
          const response = await axios.post(
            'http://localhost:8080/api/modules/create',
            {
              name: formData.name,
              color: formData.color,
              classroomId: classroom._id
            },
            { headers }
          );
          setModules(prevModules => [...prevModules, response.data]);
        }
        setShowCreateModuleModal(false);
      } catch (error) {
        console.error('Error creating/updating module:', error);
        setError(error.response?.data?.message || 'Failed to create/update module');
      }
  };
  
  const handleCreateLesson = async (formData) => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        if (!token) {
          alert('You must be logged in to create or edit lessons');
          return;
        }
  
        if (selectedLesson) {
          // Update existing lesson
          const response = await axios.put(
            `http://localhost:8080/api/lessons/${selectedLesson._id}`,
            {
              name: formData.name,
              description: formData.description,
              videoUrl: formData.videoUrl,
              quiz: formData.quiz
            },
            { headers }
          );
          
          setLessons(prevLessons => 
            prevLessons.map(lesson => 
              lesson._id === selectedLesson._id ? response.data : lesson
            )
          );
          setSelectedLesson(response.data);
        } else {
          // Create new lesson
          const response = await axios.post(
            `http://localhost:8080/api/lessons/${selectedModule._id}`,
            {
              name: formData.name,
              description: formData.description,
              videoUrl: formData.videoUrl,
              quiz: formData.quiz
            },
            { headers }
          );
          setLessons(prevLessons => [...prevLessons, response.data]);
          setSelectedLesson(response.data);
        }
        setShowCreateLessonModal(false);
      } catch (error) {
        console.error('Error creating/updating lesson:', error);
        if (error.response?.status === 401) {
          alert('You are not authorized to perform this action. Please make sure you are logged in as a teacher.');
        } else {
          setError(error.response?.data?.message || 'Failed to create/update lesson');
        }
      }
  };
  
  const handleModuleActionClick = (e, moduleId) => {
      e.stopPropagation();
      setActiveModuleDropdown(activeModuleDropdown === moduleId ? null : moduleId);
  };
  
  const handleDeleteModule = async (moduleId) => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        if (!token) {
          alert('You must be logged in to delete modules');
          return;
        }
  
        await axios.delete(
          `http://localhost:8080/api/modules/${moduleId}`,
          { headers }
        );
        
        setModules(prevModules => prevModules.filter(module => module._id !== moduleId));
        if (selectedModule?._id === moduleId) {
          setSelectedModule(null);
          setLessons([]);
        }
        setActiveModuleDropdown(null);
        setError(null);
      } catch (error) {
        console.error('Error deleting module:', error);
        if (error.response?.status === 401) {
          setError('You are not authorized to perform this action. Please make sure you are logged in as a teacher.');
        } else {
          setError('Failed to delete module. Please try again.');
        }
      }
  };
  
  const handleEditModule = (e, module) => {
      e.stopPropagation();
      setSelectedModule(module);
      setShowCreateModuleModal(true);
      setActiveModuleDropdown(null);
  };
  
  const handleLessonActionClick = (e) => {
      e.stopPropagation();
      setActiveLessonDropdown(activeLessonDropdown === selectedLesson._id ? null : selectedLesson._id);
  };
  
  const handleDeleteLesson = async (lessonId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to delete lessons');
          return;
        }
  
        await axios.delete(
          `http://localhost:8080/api/lessons/${lessonId}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setLessons(prevLessons => prevLessons.filter(lesson => lesson._id !== lessonId));
        if (selectedLesson?._id === lessonId) {
          setSelectedLesson(null);
        }
        setActiveLessonDropdown(null);
        setError(null);
      } catch (error) {
        console.error('Error deleting lesson:', error);
        if (error.response?.status === 401) {
          setError('You are not authorized to perform this action. Please make sure you are logged in as a teacher.');
        } else {
          setError('Failed to delete lesson. Please try again.');
        }
      }
  };
  
  const handleEditLesson = (e, lesson) => {
      e.stopPropagation();
      setSelectedLesson(lesson);
      setShowCreateLessonModal(true);
      setActiveLessonDropdown(null);
  };
  
  const handleLessonClick = (lesson) => {
      setSelectedLesson(lesson);
      setActiveLessonDropdown(null);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = () => {
          setActiveLessonDropdown(null);
        setActiveModuleDropdown(null);
      };
  
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
  }, []);

  if (loading) {
      return <div className="loader"></div>;
  }
  
  if (error) {
      return <div className="error-message">{error}</div>;
  }

  return (
    <div className="modules-container">
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
                <div className="module-actions">
                <button 
                    className="module-actions-button" 
                    onClick={(e) => handleModuleActionClick(e, module._id)}
                >
                    •••
                </button>
                {activeModuleDropdown === module._id && (
                    <div className="module-dropdown">
                    <button onClick={(e) => handleEditModule(e, module)}>
                        Edit
                    </button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this module?')) {
                        handleDeleteModule(module._id);
                        }
                    }}>
                        Delete
                    </button>
                    </div>
                )}
                </div>
            </div>
            ))}
            <div className="add-new" onClick={() => {
            setSelectedModule(null);
            setShowCreateModuleModal(true);
            }}>
            <div className="add-icon">+</div>
            <span>Add new</span>
            </div>
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
                    <div className="lesson-title">{lesson.name}</div>
                </div>
                ))}
                <div className="add-new" onClick={() => {
                setSelectedLesson(null);
                setShowCreateLessonModal(true);
                }}>
                <div className="add-icon">+</div>
                <span>Add new</span>
                </div>
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
                  <div className="lesson-actions">
                      <button 
                      className="lesson-actions-button" 
                      onClick={handleLessonActionClick}
                      >
                      •••
                      </button>
                      {activeLessonDropdown === selectedLesson._id && (
                      <div className="lesson-dropdown">
                          <button onClick={(e) => handleEditLesson(e, selectedLesson)}>
                          Edit
                          </button>
                          <button onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this lesson?')) {
                              handleDeleteLesson(selectedLesson._id);
                          }
                          }}>
                          Delete
                          </button>
                      </div>
                      )}
                  </div>
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
        <CreateModuleModal
          isOpen={showCreateModuleModal}
          onClose={() => {
            setShowCreateModuleModal(false);
            setSelectedModule(null);
          }}
          onSubmit={handleCreateModule}
          module={selectedModule}
        />
        <CreateLessonModal
          isOpen={showCreateLessonModal}
          onClose={() => {
            setShowCreateLessonModal(false);
            if (!selectedLesson?._id) {
              setSelectedLesson(null);
            }
          }}
          onSubmit={handleCreateLesson}
          lesson={selectedLesson}
        />
    </div>
  );
}

ClassrooomModules.propTypes = {
    classroom: PropTypes.object.isRequired
};

export default ClassrooomModules;