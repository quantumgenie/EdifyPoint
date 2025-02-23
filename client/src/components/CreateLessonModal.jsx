import React, { useState, useEffect } from 'react';
import '../styles/CreateLessonModal.css';

const CreateLessonModal = ({ isOpen, onClose, onSubmit, lesson }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    videoUrl: '',
    quiz: []
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        name: lesson.name,
        description: lesson.description,
        videoUrl: lesson.videoUrl || '',
        quiz: lesson.quiz || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        videoUrl: '',
        quiz: []
      });
    }
  }, [lesson]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuizChange = (index, field, value) => {
    setFormData(prev => {
      const newQuiz = [...prev.quiz];
      if (!newQuiz[index]) {
        newQuiz[index] = { text: '', options: ['', ''], correctAnswer: 0 };
      }
      if (field === 'option') {
        newQuiz[index].options[value.index] = value.text;
      } else {
        newQuiz[index][field] = value;
      }
      return { ...prev, quiz: newQuiz };
    });
  };

  const addQuizQuestion = () => {
    setFormData(prev => ({
      ...prev,
      quiz: [...prev.quiz, { text: '', options: ['', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuizQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate quiz questions if any exist
    if (formData.quiz.length > 0) {
      const isQuizValid = formData.quiz.every(question => 
        question.text && 
        question.options.length >= 2 &&
        question.options.every(option => option.trim() !== '') &&
        question.correctAnswer >= 0 &&
        question.correctAnswer < question.options.length
      );

      if (!isQuizValid) {
        alert('Please ensure all quiz questions are properly filled out');
        return;
      }
    }

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-lesson-modal">
        <div className="modal-header">
          <h2>{lesson ? 'Edit Lesson' : 'Create Lesson'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lesson Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter lesson description..."
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Video URL (optional)</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="Enter video URL"
            />
          </div>

          <div className="form-group">
            <label>Quiz Questions (optional)</label>
            {formData.quiz.map((question, qIndex) => (
              <div key={qIndex} className="quiz-question">
                <div className="question-header">
                  <span>Question {qIndex + 1}</span>
                  <button 
                    type="button" 
                    className="remove-question"
                    onClick={() => removeQuizQuestion(qIndex)}
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuizChange(qIndex, 'text', e.target.value)}
                  placeholder="Enter question"
                />
                <div className="options-container">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleQuizChange(qIndex, 'option', { index: oIndex, text: e.target.value })}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => handleQuizChange(qIndex, 'correctAnswer', oIndex)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button 
              type="button" 
              className="add-question-button"
              onClick={addQuizQuestion}
            >
              Add Question
            </button>
          </div>

          <button type="submit" className="create-button">
            {lesson ? 'Save Changes' : 'Create Lesson'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;
