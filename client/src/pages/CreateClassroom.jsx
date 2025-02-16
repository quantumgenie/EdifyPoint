import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateClassroom.css';

const CreateClassroom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    school: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/api/classrooms',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Classroom created:', response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError(err.response?.data?.message || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-classroom-container">
      <h1>Create New Classroom</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-classroom-form">
        <div className="form-group">
          <label htmlFor="name">Classroom Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Mathematics 101"
          />
        </div>

        <div className="form-group">
          <label htmlFor="school">School</label>
          <input
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleChange}
            required
            placeholder="e.g., Springfield Elementary"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Classroom'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClassroom; 