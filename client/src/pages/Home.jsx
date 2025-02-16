import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Edify Point</h1>
      <p className="home-subtitle">
        A platform for teachers and parents to collaborate on student education
      </p>
      
      <div className="auth-buttons">
        <Link to="/login" className="auth-button login-button">
          Login
        </Link>
        <Link to="/signup" className="auth-button signup-button">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home; 