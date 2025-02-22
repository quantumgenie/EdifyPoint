import React, { useState, useEffect } from 'react';
import '../styles/CreateReportModal.css';

const CreateReportModal = ({ isOpen, onClose, onSubmit, report }) => {
  const [formData, setFormData] = useState({
    type: 'Behavioral',
    observedPeriod: {
      start: '',
      end: ''
    },
    details: ''
  });

  useEffect(() => {
    if (report) {
      setFormData({
        type: report.type,
        observedPeriod: {
          start: formatDate(report.observedPeriod.start),
          end: formatDate(report.observedPeriod.end)
        },
        details: report.details
      });
    } else {
      // Reset form when creating a new report
      setFormData({
        type: 'Behavioral',
        observedPeriod: {
          start: '',
          end: ''
        },
        details: ''
      });
    }
    console.log('Report as is passed: ', report);
    console.log('Report FormData: ', formData);
  }, [report]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
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
        [e.target.name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.type || !formData.observedPeriod.start || !formData.observedPeriod.end || !formData.details) {
      alert('Please fill in all required fields');
      return;
    }

    // Create a copy of formData with properly formatted dates
    const submissionData = {
      ...formData,
      observedPeriod: {
        start: new Date(formData.observedPeriod.start).toISOString(),
        end: new Date(formData.observedPeriod.end).toISOString()
      }
    };
    console.log('Report submissionData: ', submissionData);
    onSubmit(submissionData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-report-modal">
        <div className="modal-header">
          <h2>{report ? 'Edit Report' : 'Create Report'}</h2>
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
                value={formData.observedPeriod.start || ''}
                onChange={handleChange}
                required
              />
              <span>to</span>
              <input
                type="date"
                name="observedPeriod.end"
                value={formData.observedPeriod.end || ''}
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

          <button type="submit" className="create-button">
            {report ? 'Save Changes' : 'Create Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Format date to 'yyyy-MM-dd' form
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];  
};

export default CreateReportModal;
