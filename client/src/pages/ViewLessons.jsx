import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewLessons = () => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/lessons');
        setLessons(response.data);
      } catch (error) {
        console.error('Error fetching lessons:', error.response?.data?.message || error.message);
      }
    };
    fetchLessons();
  }, []);

  return (
    <div>
      <h2>Lessons</h2>
      {lessons.map((lesson) => (
        <div key={lesson._id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <h3>{lesson.title}</h3>
          <p>{lesson.description}</p>
          {lesson.videoUrl && (
            <div>
              <label>Video:</label>
              <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                Watch Video
              </a>
            </div>
          )}
          <h4>Quiz</h4>
          {lesson.quiz.map((q, index) => (
            <div key={index}>
              <p>
                <strong>Question:</strong> {q.question}
              </p>
              <ul>
                {q.options.map((option, optionIndex) => (
                  <li key={optionIndex}>{option}</li>
                ))}
              </ul>
              <p>Correct Answer: Option {q.correctAnswer + 1}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ViewLessons;
