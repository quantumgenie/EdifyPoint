import React, { useState } from 'react';
import '../styles/CreateReportModal.css';

const CreateReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'Behavioral',
    observedPeriod: {
      start: '',
      end: ''
    },
    details: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('observedPeriod.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        observedPeriod: {
          ...prev.observedPeriod,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-report-modal">
        <div className="modal-header">
          <h2>Create Report</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Report Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Behavioral">Behavioral Report</option>
              <option value="Progress">Progress Report</option>
            </select>
          </div>
          
          <div className="form-group date-range">
            <label>Observation Period</label>
            <div className="date-inputs">
              <input
                type="date"
                name="observedPeriod.start"
                value={formData.observedPeriod.start}
                onChange={handleChange}
                required
              />
              <span>to</span>
              <input
                type="date"
                name="observedPeriod.end"
                value={formData.observedPeriod.end}
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
              placeholder="Enter report details here..."
              rows="6"
              required
            ></textarea>
          </div>

          <button type="submit" className="create-button">Create Report</button>
        </form>
      </div>
    </div>
  );
};

export default CreateReportModal;
