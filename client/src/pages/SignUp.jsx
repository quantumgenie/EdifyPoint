import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await axios.post(
        `http://localhost:8080/api/auth/${formData.role}/register`,
        submitData
      );

      setSuccess('Registration successful! Redirecting to login...');
      
      // Store token if auto-login is desired
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', formData.role);

      // Redirect after a short delay
      setTimeout(() => {
        if (formData.role === 'teacher') {
          navigate('/dashboard');
        } else {
          navigate('/view-reports');
        }
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group-signup">
          <label className="form-label-signup">
            Role:
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input-signup"
            >
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </label>
        </div>

        <div className="form-group-signup">
          <label className="form-label-signup">
            Title:
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input-signup"
            >
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
            </select>
          </label>
        </div>

        <div className="form-group-signup">
          <label className="form-label-signup">
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="form-input-signup"
            />
          </label>
        </div>

        <div className="form-group-signup">
          <label className="form-label-signup">
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="form-input-signup"
            />
          </label>
        </div>

        <div className="form-group-signup">
          <label className="form-label-signup">
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input-signup"
            />
          </label>
        </div>

        <div className="form-group-signup">
          <label className="form-label-signup">
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input-signup"
            />
          </label>
        </div>

        <div className="form-group-signup">
          <label className="form-label-signup">
            Confirm Password:
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-input-signup"
            />
          </label>
        </div>

        <button type="submit" className="submit-button">
          Sign Up
        </button>

        <Link to="/login" className="login-link">
          Already have an account? Login here
        </Link>
      </form>
    </div>
  );
};

export default SignUp; 