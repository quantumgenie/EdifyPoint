const express = require("express")
require('dotenv').config();
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// initialize app
const app = express();

// middleware
const corsOptions = {
    origin: ["http://localhost:5173"],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// use auth routes
app.use(authRoutes);

// connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


// add protected route
app.get("/api/auth/verify", authMiddleware, (req, res) => {
    res.json({ message: "Token is valid", user: req.user });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log (`Server started on port ${PORT}`);
});