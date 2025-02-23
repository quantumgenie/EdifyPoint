const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new module (teachers only)
router.post('/create', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const module = new Module({
      name: req.body.name,
      color: req.body.color,
      classroomId: req.body.classroomId
    });
    await module.save();
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all modules for a classroom
router.get('/:classroomId', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({ classroomId: req.params.classroomId })
      .sort({ createdAt: 1 });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific module with its lessons
router.get('/:moduleId/details', authMiddleware, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const lessons = await Lesson.find({ moduleId: req.params.moduleId })
      .sort({ order: 1 });
    
    res.json({
      module,
      lessons
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a module (teachers only)
router.put('/:moduleId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (req.body.name) module.name = req.body.name;
    if (req.body.color) module.color = req.body.color;

    await module.save();
    res.json(module);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a module (teachers only)
router.delete('/:moduleId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Delete all lessons associated with this module
    await Lesson.deleteMany({ moduleId: req.params.moduleId });
    await module.remove();
    
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;