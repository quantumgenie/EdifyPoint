const { Server } = require('socket.io');

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

        socket.on('sendMessage', (message) => {
            if (message.isGroupMessage) {
                io.to(message.classroom).emit('receiveMessage', message);
            } else {
                socket.to(message.receiver).emit('receiveMessage', message);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

module.exports = initializeSocket;
