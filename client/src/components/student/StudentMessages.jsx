import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import PropTypes from 'prop-types';
import '../../styles/student/StudentMessages.css';

const StudentMessages = ({ student }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const messagesEndRef = useRef();
  const socket = useSocket();

  useEffect(() => {
    if (!student?.classroomId?._id || !socket) {
      setLoading(false);
      return;
    }

    // Load existing messages
    fetchMessages();

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [student?.classroomId?._id, student?.teacherId, socket]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGroupChat]);

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/messages/classroom/${student.classroomId._id}`, 
        { headers }
      );
      setMessages(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setMessages([]);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !student?.parentId?._id) return;

    const messageData = {
      content: newMessage,
      sender: student.parentId._id,
      senderType: 'Parent',
      receiver: isGroupChat ? student.classroomId._id : student.teacherId,
      receiverType: isGroupChat ? 'Group' : 'Teacher',
      classroom: student.classroomId._id,
      isGroupMessage: isGroupChat
    };

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/messages`, 
        messageData, 
        { headers }
      );
      socket.emit('sendMessage', response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!student?.parentId?._id || !student?.teacherId) {
    return <div className="error-message">Missing required data to display messages</div>;
  }

  return (
    <div className="messages-container">
      <div className="chat-options-sidebar">
        <div className={`chat-option-item ${!isGroupChat ? 'selected' : ''}`} onClick={() => setIsGroupChat(false)}>
          <div className="chat-option-avatar">
            <img src="/teacher-icon.svg" alt="Teacher" />
          </div>
          <span>Teacher Messages</span>
        </div>
        <div className={`chat-option-item ${isGroupChat ? 'selected' : ''}`} onClick={() => setIsGroupChat(true)}>
          <div className="chat-option-avatar">
            <img src="/group-icon.svg" alt="Class Discussion" />
          </div>
          <span>Class Discussion</span>
        </div>
      </div>

      <div className="chat-section">
        <div className="chat-header">
          {isGroupChat ? 'Class Discussion' : 'Direct Messages with Teacher'}
        </div>

        <div className="messages-list">
          {(Array.isArray(messages) ? messages : [])
            .filter(msg => msg.isGroupMessage === isGroupChat)
            .map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.sender === student.parentId._id ? 'sent' : 'received'}`}
              >
                {message.sender !== student.parentId._id && (
                  <div className="message-avatar">
                    <img src={message.senderType === 'Teacher' ? '/teacher-icon.svg' : '/parent-icon.svg'} alt={`${message.senderType} avatar`} />
                  </div>
                )}
                <div className="message-bubble">
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.sender === student.parentId._id && (
                  <div className="message-avatar">
                    <img src="/parent-icon.svg" alt="Your avatar" />
                  </div>
                )}
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Type your ${isGroupChat ? 'class' : ''} message...`}
          />
          <button type="submit" className="send-button">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

StudentMessages.propTypes = {
  student: PropTypes.shape({
    parentId: PropTypes.shape({
      _id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string
    }),
    classroomId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      teacher: PropTypes.shape({
        _id: PropTypes.string,
        firstName: PropTypes.string,
        lastName: PropTypes.string
      })
    }).isRequired
  }).isRequired
};

export default StudentMessages;
