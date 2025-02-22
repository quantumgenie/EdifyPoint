const express = require("express")
require('dotenv').config();
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware/auth");

// initialize app
const app = express();

// import routes
const reportRoutes = require('./routes/reports');
const lessonRoutes = require('./routes/lessons');
const authRoutes = require("./routes/auth");
const classroomRoutes = require('./routes/classrooms');
const studentRoutes = require('./routes/students');
const moduleRoutes = require('./routes/modules');
const eventRoutes = require('./routes/events');
const parentRoutes = require('./routes/parents');

// middleware
const corsOptions = {
    origin: ["http://localhost:5173"],
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

// add protected route
app.get("/api/auth/verify", authMiddleware, (req, res) => {
    res.json({ message: "Token is valid", user: req.user });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
