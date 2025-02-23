import React, { useState } from 'react';
import '../styles/CreateModuleModal.css';

const CreateModuleModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#1a73e8'
  });

  const predefinedColors = [
    '#1a73e8', // Blue
    '#34a853', // Green
    '#ea4335', // Red
    '#fbbc05', // Yellow
    '#9334e6', // Purple
    '#ff7043', // Orange
    '#00acc1', // Cyan
    '#ec407a'  // Pink
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleColorSelect = (color) => {
    setFormData(prevState => ({
      ...prevState,
      color
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', color: '#1a73e8' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-module-modal">
        <div className="modal-header">
          <h2>Module Creator</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter module title"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Module Color</label>
            <div className="color-picker">
              <div className="color-options">
                {predefinedColors.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="create-button"
            style={{ backgroundColor: formData.color }}
          >
            Create Module
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateModuleModal;
