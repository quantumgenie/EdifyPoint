const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new lesson (teachers only)
router.post('/:moduleId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    // Verify module exists
    const module = await Module.findById(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get the current highest order number
    const highestOrder = await Lesson.findOne({ moduleId: req.params.moduleId })
      .sort({ order: -1 })
      .select('order');
    
    const order = highestOrder ? highestOrder.order + 1 : 1;

    const lesson = new Lesson({
      ...req.body,
      moduleId: req.params.moduleId,
      order
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all lessons for a module
router.get('/module/:moduleId', authMiddleware, async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId })
      .sort({ order: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific lesson
router.get('/:lessonId', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('moduleId', 'name');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a lesson (teachers only)
router.put('/:lessonId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    Object.assign(lesson, req.body);
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a lesson (teachers only)
router.delete('/:lessonId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update order of remaining lessons
    await Lesson.updateMany(
      { 
        moduleId: lesson.moduleId,
        order: { $gt: lesson.order }
      },
      { $inc: { order: -1 } }
    );
    // Delete lesson
    await Lesson.deleteOne({ _id: req.params.lessonId });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    console.error('Error deleting lesson:', err);
    res.status(500).json({ message: err.message });
  }
});

// Reorder lessons within a module (teachers only)
router.post('/reorder/:moduleId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const { lessonIds } = req.body;
    
    // Verify all lessons exist and belong to the module
    const lessons = await Lesson.find({
      _id: { $in: lessonIds },
      moduleId: req.params.moduleId
    });

    if (lessons.length !== lessonIds.length) {
      return res.status(400).json({ 
        message: 'Invalid lesson IDs or lessons do not belong to the module' 
      });
    }

    // Update order for each lesson
    const updates = lessonIds.map((lessonId, index) => ({
      updateOne: {
        filter: { _id: lessonId },
        update: { $set: { order: index + 1 } }
      }
    }));

    await Lesson.bulkWrite(updates);
    res.json({ message: 'Lessons reordered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get quiz attempts for a student
router.get('/:lessonId/attempts/:studentId', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const attempts = lesson.quizAttempts.filter(
      attempt => attempt.studentId.toString() === req.params.studentId
    ).sort((a, b) => b.attemptDate - a.attemptDate);

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a quiz attempt
router.post('/:lessonId/submit-quiz', authMiddleware, async (req, res) => {
  try {
    const { studentId, answers } = req.body;
    const lesson = await Lesson.findById(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (!lesson.quiz || lesson.quiz.length === 0) {
      return res.status(400).json({ message: 'This lesson has no quiz' });
    }

    if (answers.length !== lesson.quiz.length) {
      return res.status(400).json({ message: 'Invalid number of answers' });
    }

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === lesson.quiz[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / lesson.quiz.length) * 100);

    // Create new attempt
    const attempt = {
      studentId,
      score,
      answers,
      attemptDate: new Date()
    };

    lesson.quizAttempts.push(attempt);
    await lesson.save();

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
