import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [studentId, setStudentId] = useState("675ff458749f817ced0f23ab");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reports?studentId=${studentId}`);
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error.response?.data?.message || error.message);
      }
    };
    fetchReports();
  }, []);

  return (
    <div>
      <h2>Reports</h2>
      {reports.map((report) => (
        <div key={report._id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <p>Student ID: {report.studentId}</p>
          <p>Type: {report.type}</p>
          <p>
            Observed Period: {new Date(report.observedPeriod.start).toDateString()} -{' '}
            {new Date(report.observedPeriod.end).toDateString()}
          </p>
          <p>Details: {report.details}</p>
        </div>
      ))}
    </div>
  );
};

export default ViewReports;
