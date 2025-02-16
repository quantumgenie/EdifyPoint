const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new module (teachers only)
router.post('/', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const module = new Module(req.body);
    await module.save();
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all modules for a specific class
router.get('/class/:classId', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({ classId: req.params.classId })
      .sort({ createdAt: -1 });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific module
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('classId', 'name school');
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a module (teachers only)
router.put('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    Object.assign(module, req.body);
    await module.save();
    
    res.json(module);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a module (teachers only)
router.delete('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await module.deleteOne();
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 