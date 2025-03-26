import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import '../../styles/classroom/ClassroomMessages.css';

const ClassroomMessages = ({ classroom }) => {
    const [messages, setMessages] = useState([]);  
    const [newMessage, setNewMessage] = useState('');
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isGroupChat, setIsGroupChat] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socketRef = useRef();
    const messagesEndRef = useRef();

    // Transform teacher data if needed
    const teacher = classroom.teacher || (classroom.teacherId && {
        _id: classroom.teacherId._id,
        firstName: classroom.teacherId.firstName,
        lastName: classroom.teacherId.lastName
    });

    console.log('classroom.students:', classroom.students);
    
    useEffect(() => {
        if (!teacher) {
            setLoading(false);
            return;
        }

        // Connect to Socket.IO server
        socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:8080', {
            withCredentials: true,
            transports: ['polling', 'websocket']
        });

        // Join room
        socketRef.current.emit('joinRoom', classroom._id);
        socketRef.current.emit('joinRoom', teacher._id);

        // Load existing messages
        fetchMessages();

        // Listen for new messages
        socketRef.current.on('receiveMessage', (message) => {
            setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
        });

        return () => {
            socketRef.current.emit('leaveRoom', classroom._id);
            socketRef.current.emit('leaveRoom', teacher._id);
            socketRef.current.disconnect();
        };
    }, [classroom._id, teacher]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isGroupChat, selectedParent]);

    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const response = await axios.get(
                `http://localhost:8080/api/messages/classroom/${classroom._id}`, 
                { headers }
            );
            setMessages(Array.isArray(response.data) ? response.data : []);
            console.log('Fetched messages:', response.data);
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
        if (!newMessage.trim() || !teacher) return;

        const messageData = {
            content: newMessage,
            sender: teacher._id,
            senderType: 'Teacher',
            receiver: isGroupChat ? classroom._id : selectedParent,
            receiverType: isGroupChat ? 'Group' : 'Parent',
            classroom: classroom._id,
            isGroupMessage: isGroupChat
        };
        console.log('Sending message:', messageData);
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
        return <div className="loader"></div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!teacher) {
        return <div className="error-message">Teacher data not available</div>;
    }

    return (
        <div className="messages-container">
            <div className="parents-sidebar">
                <div className={`all-parents-item ${isGroupChat ? 'selected' : ''}`} onClick={() => setIsGroupChat(true)}>
                    <div className="parent-avatar">
                        <img src="/group-icon.svg" alt="All Parents" />
                    </div>
                    <span>All Parents</span>
                </div>
                {classroom.students
                    .filter(student => student.parentId)
                    .map(student => (
                        <div
                            key={student._id}
                            className={`parent-item ${(!isGroupChat && selectedParent === student.parentId && selectedStudent === student) ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedParent(student.parentId);
                                setSelectedStudent(student);
                                setIsGroupChat(false);
                            }}
                        >
                            <div className="parent-avatar">
                                <img src="/parent-icon.svg" alt="Parent avatar" />
                            </div>
                            <span>{student.firstName} {student.lastName}'s Parent</span>
                        </div>
                    ))}
            </div>
            
            <div className="chat-section">
                <div className="chat-header">
                    {isGroupChat ? 'All Parents' : selectedParent ? `DM ${selectedStudent.firstName} ${selectedStudent.lastName}'s Parent` : 'Select a parent to start messaging'}
                </div>

                <div className="messages-list">
                    {(Array.isArray(messages) ? messages : []).filter(msg => 
                        isGroupChat ? msg.isGroupMessage : 
                        (!msg.isGroupMessage && 
                        (msg.sender === selectedParent || msg.receiver === selectedParent))
                    ).map((message, index) => (
                        <div 
                            key={index}
                            className={`message-row ${message.sender === teacher._id ? 'sent' : 'received'}`}
                        >
                            {message.sender !== teacher._id && (
                                <div className="message-avatar">
                                    <img src="/parent-icon.svg" alt="Parent avatar" />
                                </div>
                            )}
                            <div className="message-bubble">
                                <div className="message-content">{message.content}</div>
                                <div className="message-time">
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            {message.sender === teacher._id && (
                                <div className="message-avatar">
                                    <img src="/teacher-icon.svg" alt="Teacher avatar" />
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
                        placeholder="Type your message..."
                        disabled={!isGroupChat && !selectedParent}
                    />
                    <button type="submit" disabled={!isGroupChat && !selectedParent} className="send-button">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

ClassroomMessages.propTypes = {
    classroom: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        teacher: PropTypes.shape({
            _id: PropTypes.string,
            firstName: PropTypes.string,
            lastName: PropTypes.string
        }),
        teacherId: PropTypes.shape({
            _id: PropTypes.string,
            firstName: PropTypes.string,
            lastName: PropTypes.string
        }),
        students: PropTypes.arrayOf(PropTypes.shape({
            _id: PropTypes.string.isRequired,
            parent: PropTypes.shape({
                _id: PropTypes.string,
                firstName: PropTypes.string,
                lastName: PropTypes.string
            })
        }))
    }).isRequired
};

export default ClassroomMessages;