const { Server } = require('socket.io');
const Teacher = require('./models/Teacher');
const Parent = require('./models/Parent');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        
        socket.on('joinRoom', (classroomId) => {
            socket.join(classroomId);
            console.log(`Socket ${socket.id} joined room ${classroomId}`);
        });

        socket.on('leaveRoom', (classroomId) => {
            socket.leave(classroomId);
            console.log(`Socket ${socket.id} left room ${classroomId}`);
        });

        socket.on('sendMessage', async (message) => {
            try {
                // Determine if sender is a Teacher or Parent and fetch their name
                let senderName;
                const teacher = await Teacher.findById(message.sender);
                if (teacher) {
                    senderName = `${teacher.firstName} ${teacher.lastName}`;
                } else {
                    const parent = await Parent.findById(message.sender);
                    if (parent) {
                        senderName = `${parent.firstName} ${parent.lastName}`;
                    } else {
                        senderName = 'Unknown'; // Fallback if no match
                    }
                }
                
                if (message.isGroupMessage) {
                    io.to(message.classroom).emit('receiveMessage', message);
                    // Emit notification for new message
                    io.to(message.classroom).emit('newMessage', {
                        senderName: senderName,
                        message: message.content,
                        classroom: message.classroom
                    });
                } else {
                    io.to(message.receiver).emit('receiveMessage', message);
                    io.to(message.sender).emit('receiveMessage', message);
                    // Emit notifications for private messages
                    io.to(message.receiver).emit('newMessage', {
                        senderName: senderName,
                        message: message.content,
                        private: true
                    });
                    io.to(message.sender).emit('newMessage', {
                        senderName: senderName,
                        message: message.content,
                        private: true
                    });
                    console.log('DM sent to sender:', message.sender, 'and receiver:', message.receiver);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Fallback to ID if database query fails
                const fallbackSenderName = message.senderName || message.sender || 'Unknown';
                if (message.isGroupMessage) {
                    io.to(message.classroom).emit('newMessage', {
                        senderName: fallbackSenderName,
                        message: message.content,
                        classroom: message.classroom
                    });
                } else {
                    io.to(message.receiver).emit('newMessage', {
                        senderName: fallbackSenderName,
                        message: message.content,
                        private: true
                    });
                    io.to(message.sender).emit('newMessage', {
                        senderName: fallbackSenderName,
                        message: message.content,
                        private: true
                    });
                }
            }
        });

        // Event notifications
        socket.on('createEvent', (event) => {
            io.to(event.classroom).emit('newEvent', event);
        });

        socket.on('updateEvent', (event) => {
            io.to(event.classroom).emit('updatedEvent', event);
        });

        // Report notifications
        socket.on('createReport', (report) => {
            io.to(report.classroom).emit('newReport', report);
        });

        socket.on('updateReport', (report) => {
            io.to(report.classroom).emit('updatedReport', report);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

module.exports = initializeSocket;
