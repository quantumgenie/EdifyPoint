const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const { authMiddleware } = require("../middleware/auth");

// Teacher Registration
router.post("/teacher/register", async (req, res) => {
  try {
    const { title, firstName, lastName, email, password } = req.body;

    // Check if teacher already exists
    let teacher = await Teacher.findOne({ email });
    if (teacher) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    teacher = new Teacher({
      title,
      firstName,
      lastName,
      email,
      password,
    });

    await teacher.save();

    const payload = {
      user: {
        id: teacher.id,
        role: 'teacher',
        firstName: teacher.firstName,
        lastName: teacher.lastName
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Parent Registration
router.post("/parent/register", async (req, res) => {
  try {
    const { title, firstName, lastName, email, password } = req.body;

    // Check if parent already exists
    let parent = await Parent.findOne({ email });
    if (parent) {
      return res.status(400).json({ message: "Parent already exists" });
    }

    parent = new Parent({
      title,
      firstName,
      lastName,
      email,
      password,
    });

    await parent.save();

    const payload = {
      user: {
        id: parent.id,
        role: 'parent',
        firstName: parent.firstName,
        lastName: parent.lastName
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login (handles both Teacher and Parent)
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Determine which model to use based on role
    const Model = role === 'teacher' ? Teacher : Parent;
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: role,
        firstName: user.firstName,
        lastName: user.lastName
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            role: role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify token and get user info
router.get("/verify", authMiddleware, (req, res) => {
  res.json({ 
    isValid: true,
    user: req.user 
  });
});

// protected dashboard route
router.get("/api/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Welcome to the dashboard, ${req.user.firstName}!`,
  });
});

module.exports = router;