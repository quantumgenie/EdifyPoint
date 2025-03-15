import React, { useState, useEffect } from 'react';
import '../styles/CreateClassModal.css';

const CreateClassModal = ({ isOpen, onClose, onSubmit, classroom }) => {
  const [formData, setFormData] = useState({
    name: '',
    school: ''
  });

  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name || '',
        school: classroom.school || ''
      });
    } else {
      setFormData({
        name: '',
        school: ''
      });
    }
  }, [classroom]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.school) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-class-modal">
        <div className="modal-header">
          <h2>{classroom ? 'Edit Class' : 'Create Class'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter class name"
              required
            />
          </div>

          <div className="form-group">
            <label>School Name*</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Enter school name"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {classroom ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
