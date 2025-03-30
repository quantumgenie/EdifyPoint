import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/student/PasswordVerificationModal.css';

const PasswordVerificationModal = ({ 
  show, 
  onClose, 
  onVerificationSuccess, 
  verifyingPassword 
}) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const userEmail = localStorage.getItem('userEmail');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/verify-password', {
        email: userEmail,
        password: password
      });

      if (response.data.success) {
        setPasswordError('');
        onVerificationSuccess();
      } else {
        setPasswordError('Incorrect password');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to verify password');
    }
  };

  if (!show) return null;

  return (
    <div className="password-modal">
      <div className="modal-content">
        <h3>Enter Your Password</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={verifyingPassword}
          />
          {passwordError && <p className="error">{passwordError}</p>}
          <div className="modal-buttons">
            <button 
              type="submit" 
              disabled={verifyingPassword || !password}
            >
              {verifyingPassword ? 'Verifying...' : 'Submit'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              disabled={verifyingPassword}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordVerificationModal;
