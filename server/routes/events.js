const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new event (teachers only)
router.post('/create/:classId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      classId: req.params.classId
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all events for a specific class
router.get('/:classId', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ classId: req.params.classId })
      .populate('classId', 'name school')
      .sort({ 'dateTime.start': 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get events for a date range
router.get('/range', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const events = await Event.find({
      'dateTime.start': { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('classId', 'name school')
    .sort({ 'dateTime.start': 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific event
router.get('/event/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('classId', 'name school');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an event (teachers only)
router.put('/event/update/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate date range if updating dates
    if (req.body.dateTime) {
      const startDate = req.body.dateTime.start || event.dateTime.start;
      const endDate = req.body.dateTime.end || event.dateTime.end;
      if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    Object.assign(event, req.body);
    await event.save();
    
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an event (teachers only)
router.delete('/:classId/:eventId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify that the event belongs to the specified class
    if (event.classId.toString() !== req.params.classId) {
      return res.status(403).json({ message: 'Event does not belong to this class' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;