const express = require('express');
const router = express.Router();
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Get all parents
router.get('/', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const parents = await Parent.find()
      .select('_id title firstName lastName email') // Don't send password
      .sort({ lastName: 1, firstName: 1 });
    
    res.json(parents);
  } catch (err) {
    console.error('Error fetching parents:', err);
    res.status(500).json({ message: 'Error fetching parents', error: err.message });
  }
});

// Get a specific parent
router.get('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .select('_id title firstName lastName email'); // Don't send password
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.json(parent);
  } catch (err) {
    console.error('Error fetching parent:', err);
    res.status(500).json({ message: 'Error fetching parent', error: err.message });
  }
});

// Update parent-student association
router.put('/students/:studentId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const { parentId } = req.body;
    const { studentId } = req.params;

    // Verify the student belongs to this teacher
    const student = await Student.findOne({
      _id: studentId,
      teacherId: req.user.id
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If parentId is provided, verify the parent belongs to this teacher
    if (parentId) {
      const parent = await Parent.findOne({
        _id: parentId,
        teacherId: req.user.id
      });

      if (!parent) {
        return res.status(404).json({ message: 'Parent not found' });
      }
    }

    // Update the student's parent
    student.parentId = parentId || null;
    await student.save();

    res.json(student);
  } catch (err) {
    console.error('Error updating parent-student association:', err);
    res.status(500).json({ 
      message: 'Error updating parent-student association', 
      error: err.message 
    });
  }
});

module.exports = router; 