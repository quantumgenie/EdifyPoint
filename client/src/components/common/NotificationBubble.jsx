import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import '../../styles/common/NotificationBubble.css';

const NotificationBubble = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const location = useLocation();
  const socket = useSocket();
  const { id: classroomId, studentId } = useParams();
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (!socket) return;

    const isClassroomDetail = location.pathname.includes('/classroom/');
    const isStudentDetail = location.pathname.includes('/student/');

    // Join appropriate rooms based on the current route
    if (isClassroomDetail && classroomId) {
      // Get classroom ID from local storage or state management if available
      const selectedClassroomId = localStorage.getItem(`classroom_${classroomId}_classroom`);
      const selectedClassroomTeacherId = localStorage.getItem(`classroom_${classroomId}_teacher`);
      socket.emit('joinRoom', selectedClassroomId);
      socket.emit('joinRoom', selectedClassroomTeacherId);
    }

    if (isStudentDetail && studentId) {
      // Get classroom ID from local storage or state management if available
      const studentClassroomId = localStorage.getItem(`student_${studentId}_classroom`);
      const studentTeacherId = localStorage.getItem(`student_${studentId}_teacher`);
      if (studentClassroomId) {
        socket.emit('joinRoom', studentClassroomId);
        socket.emit('joinRoom', studentTeacherId);
      }
    }

    if (isClassroomDetail) {
      socket.on('newMessage', (message) => {
        if (message.senderName !== userName) {
          addNotification({
            type: 'message',
            content: `New message from ${message.senderName}`,
            timestamp: new Date(),
            read: false
          });
        }
      });
    }

    if (isStudentDetail) {
      socket.on('newEvent', (event) => {
        addNotification({
          type: 'event',
          content: `New event: ${event.title}`,
          timestamp: new Date(),
          read: false
        });
      });

      socket.on('updatedEvent', (event) => {
        addNotification({
          type: 'event',
          content: `Event updated: ${event.title}`,
          timestamp: new Date(),
          read: false
        });
      });

      socket.on('newReport', (report) => {
        addNotification({
          type: 'report',
          content: `New report available`,
          timestamp: new Date(),
          read: false
        });
      });

      socket.on('newMessage', (message) => {
        if (message.senderName !== userName) {
          addNotification({
            type: 'message',
            content: `New message from ${message.senderName}`,
            timestamp: new Date(),
            read: false
          });
        }
      });
    }

    // Cleanup: Leave rooms and remove listeners
    return () => {
      if (isClassroomDetail && classroomId) {
        const selectedClassroomId = localStorage.getItem(`classroom_${classroomId}_classroom`);
        const selectedClassroomTeacherId = localStorage.getItem(`classroom_${classroomId}_teacher`);
        socket.emit('leaveRoom', selectedClassroomId);
        socket.emit('leaveRoom', selectedClassroomTeacherId);
      }
      if (isStudentDetail && studentId) {
        const studentClassroomId = localStorage.getItem(`student_${studentId}_classroom`);
        const studentTeacherId = localStorage.getItem(`student_${studentId}_teacher`);
        if (studentClassroomId) {
          socket.emit('leaveRoom', studentClassroomId);
          socket.emit('leaveRoom', studentTeacherId);
        }
      }
      socket.off('newMessage');
      socket.off('newEvent');
      socket.off('updatedEvent');
      socket.off('newReport');
    };
  }, [location.pathname, socket, classroomId, studentId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 10));
    setUnreadCount(prev => prev + 1);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="notification-container" ref={notificationRef}>
      <div className="notification-icon" onClick={handleNotificationClick}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      {showNotifications && (
        <div className="notification-dropdown">
          <h3>Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="no-notifications">No new notifications</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification, index) => (
                <li key={index} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                  <div className="notification-content">
                    {notification.content}
                  </div>
                  <div className="notification-time">
                    {formatTime(notification.timestamp)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBubble;
