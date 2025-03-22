const express = require("express")
require('dotenv').config();
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const { authMiddleware } = require("./middleware/auth");
const http = require('http');
const initializeSocket = require('./socket');

// initialize app
const app = express();
const server = http.createServer(app);

// import routes
const reportRoutes = require('./routes/reports');
const lessonRoutes = require('./routes/lessons');
const authRoutes = require("./routes/auth");
const classroomRoutes = require('./routes/classrooms');
const studentRoutes = require('./routes/students');
const moduleRoutes = require('./routes/modules');
const eventRoutes = require('./routes/events');
const parentRoutes = require('./routes/parents');
const messageRoutes = require('./routes/messages');

// middleware
const corsOptions = {
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// use auth routes
app.use('/api/auth', authRoutes);

// connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// route middleware
app.use('/api/lessons', lessonRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/classroom/events', eventRoutes);
app.use('/api/classroom/reports', reportRoutes); 
app.use('/api/parents', parentRoutes);
app.use('/api/messages', messageRoutes);

// add protected route
app.get("/api/auth/verify", authMiddleware, (req, res) => {
    res.json({ message: "Token is valid", user: req.user });
});

// Initialize Socket.IO using the existing module
const io = initializeSocket(server);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
