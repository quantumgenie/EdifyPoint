import React, { useState } from 'react';
import axios from 'axios';

const CreateLesson = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [quiz, setQuiz] = useState([]);

  // add a new quiz question
  const addQuestion = () => {
    setQuiz([...quiz, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  // update question, options, or correct answer
  const updateQuiz = (index, field, value, optionIndex) => {
    const updatedQuiz = [...quiz];
    if (field === 'question') {
      updatedQuiz[index].question = value;
    } else if (field === 'options') {
      updatedQuiz[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuiz[index].correctAnswer = parseInt(value);
    }
    setQuiz(updatedQuiz);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/lessons', { title, description, videoUrl, quiz });
      alert('Lesson created successfully!');
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setQuiz([]);
    } catch (error) {
      console.error('Error creating lesson:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <h2>Create Lesson</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>Video URL:</label>
        <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />

        <h3>Quiz Questions</h3>
        {quiz.map((q, index) => (
          <div key={index}>
            <label>Question:</label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuiz(index, 'question', e.target.value)}
              required
            />
            <div>
              {q.options.map((option, optionIndex) => (
                <div key={optionIndex}>
                  <label>Option {optionIndex + 1}:</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateQuiz(index, 'options', e.target.value, optionIndex)}
                    required
                  />
                </div>
              ))}
            </div>
            <label>Correct Answer (0-3):</label>
            <input
              type="number"
              min="0"
              max="3"
              value={q.correctAnswer}
              onChange={(e) => updateQuiz(index, 'correctAnswer', e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addQuestion}>
          Add Question
        </button>
        <br />
        <button type="submit">Create Lesson</button>
      </form>
    </div>
  );
};

export default CreateLesson;
