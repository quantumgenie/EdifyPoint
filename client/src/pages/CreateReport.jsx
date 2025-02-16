import React, { useState } from 'react';
import axios from 'axios';

const CreateReport = () => {
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState('Behavioral');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8080/api/reports', {
        studentId,
        type,
        observedPeriod: { start, end },
        details,
      });
      alert('Report created successfully!');
      setStudentId('');
      setStart('');
      setEnd('');
      setDetails('');
    } catch (error) {
      console.error('Error creating report:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <h2>Create Report</h2>
      <form onSubmit={handleSubmit}>
        <label>Student ID:</label>
        <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />

        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Behavioral">Behavioral</option>
          <option value="Progress">Progress</option>
        </select>

        <label>Observed Period Start:</label>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />

        <label>Observed Period End:</label>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required />

        <label>Details:</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} required />

        <button type="submit">Create Report</button>
      </form>
    </div>
  );
};

export default CreateReport;
