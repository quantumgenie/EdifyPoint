import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'teacher'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      
      // Redirect based on user role
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group-login">
          <label className="form-label-login">
            Role:
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input-login"
            >
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </label>
        </div>

        <div className="form-group-login">
          <label className="form-label-login">
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input-login"
            />
          </label>
        </div>

        <div className="form-group-login">
          <label className="form-label-login">
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input-login"
            />
          </label>
        </div>

        <button type="submit" className="submit-button">
          Login
        </button>

        <Link to="/signup" className="signup-link">
          Don't have an account? Sign up here
        </Link>
      </form>
    </div>
  );
};

export default Login;
