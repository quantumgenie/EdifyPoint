const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new student (teachers only)
router.post('/', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all students in a class
router.get('/class/:classroomId', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({ classroomId: req.params.classroomId })
      .populate('parentId', 'firstName lastName email')
      .sort({ lastName: 1, firstName: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get students for a parent
router.get('/parent', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({ parentId: req.user.id })
      .populate('classroomId', 'name school')
      .sort({ lastName: 1, firstName: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific student
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classroomId', 'name school')
      .populate('parentId', 'firstName lastName email');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user is authorized to view this student
    if (req.user.role === 'parent' && 
        student.parentId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this student' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a student (teachers only)
router.put('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    Object.assign(student, req.body);
    await student.save();
    
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Associate parent with student (teachers only)
router.put('/:id/parent', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const { parentId } = req.body;
    const studentId = req.params.id;

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { parentId },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (err) {
    console.error('Error updating student parent:', err);
    res.status(500).json({ message: 'Error updating student parent', error: err.message });
  }
});

// Remove parent link
router.delete('/:id/parent', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const studentId = req.params.id;
    
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $unset: { parentId: "" } },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (err) {
    console.error('Error removing parent link:', err);
    res.status(500).json({ message: 'Error removing parent link', error: err.message });
  }
});

// Delete a student (teachers only)
router.delete('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 