import React, { useState, useEffect } from 'react';
import '../styles/CreateEventModal.css';

const CreateEventModal = ({ isOpen, onClose, onSubmit, event }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    details: '',
    theme: ''
  });

  // Update form data when editing an event
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: new Date(event.date).toISOString().split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        details: event.details,
        theme: event.theme || ''
      });
    } else {
      // Reset form when creating a new event
      setFormData({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        details: '',
        theme: ''
      });
    }
    console.log('Event as is passed: ', event);
    console.log('Event FormData: ', formData);
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-event-modal">
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="National day Celebration"
              required
            />
          </div>
          
          <div className="form-group date-time">
            <label>Date & time</label>
            <div className="datetime-inputs">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
              <span>to</span>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Enter event details here..."
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <div className="theme-colors">
              <input
                type="radio"
                name="theme"
                value="pink"
                checked={formData.theme === 'pink'}
                onChange={handleChange}
                className="theme-radio pink"
              />
              <input
                type="radio"
                name="theme"
                value="mint"
                checked={formData.theme === 'mint'}
                onChange={handleChange}
                className="theme-radio mint"
              />
              <input
                type="radio"
                name="theme"
                value="orange"
                checked={formData.theme === 'orange'}
                onChange={handleChange}
                className="theme-radio orange"
              />
            </div>
          </div>

          <button type="submit" className="create-button">
            {event ? 'Save Changes' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
