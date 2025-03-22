import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import '../../styles/student/StudentMessages.css';

const StudentMessages = ({ student }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (!student?.classroomId?._id) {
      setLoading(false);
      return;
    }

    // Connect to Socket.IO server
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:8080', {
        withCredentials: true,
        transports: ['polling', 'websocket']
    });

    // Join classroom room
    socketRef.current.emit('joinRoom', student.classroomId._id);

    // Load existing messages
    fetchMessages();

    // Listen for new messages
    socketRef.current.on('receiveMessage', (message) => {
      setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
    });

    return () => {
      socketRef.current.emit('leaveRoom', student.classroomId._id);
      socketRef.current.disconnect();
    };
  }, [student?.classroomId?._id]);

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get(
        `http://localhost:8080/api/messages/classroom/${student.classroomId._id}`, 
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
        'http://localhost:8080/api/messages', 
        messageData, 
        { headers }
      );
      socketRef.current.emit('sendMessage', response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div className="loader">Loading messages...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!student?.parentId?._id || !student?.teacherId) {
    return <div className="error-message">Missing required data to display messages</div>;
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>{isGroupChat ? 'Class Discussion' : 'Direct Messages with Teacher'}</h2>
        <div className="message-type-toggle">
          <button 
            className={!isGroupChat ? 'active' : ''} 
            onClick={() => setIsGroupChat(false)}
          >
            Direct Messages
          </button>
          <button 
            className={isGroupChat ? 'active' : ''} 
            onClick={() => setIsGroupChat(true)}
          >
            Class Messages
          </button>
        </div>
      </div>

      <div className="messages-list">
        {(Array.isArray(messages) ? messages : [])
          .filter(msg => msg.isGroupMessage === isGroupChat)
          .map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === student.parentId._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
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
        <button type="submit">Send</button>
      </form>
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
