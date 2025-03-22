import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import '../../styles/classroom/ClassroomMessages.css';

const ClassroomMessages = ({ classroom }) => {
    const [messages, setMessages] = useState([]);  
    const [newMessage, setNewMessage] = useState('');
    const [selectedParent, setSelectedParent] = useState(null);
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

        // Join classroom room
        socketRef.current.emit('joinRoom', classroom._id);

        // Load existing messages
        fetchMessages();

        // Listen for new messages
        socketRef.current.on('receiveMessage', (message) => {
            setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
        });

        return () => {
            socketRef.current.emit('leaveRoom', classroom._id);
            socketRef.current.disconnect();
        };
    }, [classroom._id, teacher]);

    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const response = await axios.get(
                `http://localhost:8080/api/messages/classroom/${classroom._id}`, 
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
        if (!newMessage.trim() || !teacher) return;

        const messageData = {
            content: newMessage,
            sender: teacher._id,
            senderType: 'Teacher',
            receiver: isGroupChat ? classroom._id : selectedParent._id,
            receiverType: isGroupChat ? 'Group' : 'Parent',
            classroom: classroom._id,
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

    if (!teacher) {
        return <div className="error-message">Teacher data not available</div>;
    }

    return (
        <div className="messages-container">
            <div className="messages-header">
                <h2>Messages</h2>
                <div className="chat-controls">
                    <button 
                        className={`chat-type-btn ${isGroupChat ? 'active' : ''}`}
                        onClick={() => setIsGroupChat(true)}
                    >
                        Group Chat
                    </button>
                    <button 
                        className={`chat-type-btn ${!isGroupChat ? 'active' : ''}`}
                        onClick={() => setIsGroupChat(false)}
                    >
                        Private Chat
                    </button>
                </div>
            </div>

            {!isGroupChat && classroom.students && classroom.students.length > 0 && (
                <div className="parents-list">
                    {classroom.students
                        .filter(student => student.parent)
                        .map(student => (
                            <div
                                key={student._id}
                                className={`parent-item ${selectedParent?._id === student.parent._id ? 'selected' : ''}`}
                                onClick={() => setSelectedParent(student.parent)}
                            >
                                {student.parent.firstName} {student.parent.lastName}
                            </div>
                        ))}
                </div>
            )}

            <div className="messages-list">
                {(Array.isArray(messages) ? messages : []).filter(msg => 
                    isGroupChat ? msg.isGroupMessage : 
                    (msg.sender === selectedParent?._id || msg.receiver === selectedParent?._id)
                ).map((message, index) => (
                    <div 
                        key={index}
                        className={`message ${message.sender === teacher._id ? 'sent' : 'received'}`}
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
                    placeholder="Type your message..."
                    disabled={!isGroupChat && !selectedParent}
                />
                <button type="submit" disabled={!isGroupChat && !selectedParent}>
                    Send
                </button>
            </form>
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