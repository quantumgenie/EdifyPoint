const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new lesson (teachers only)
router.post('/', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    // Validate quiz structure
    if (req.body.quiz) {
      for (const question of req.body.quiz) {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            message: 'Each quiz question must have at least 2 options' 
          });
        }
        if (question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            message: 'Correct answer index must be within options array bounds' 
          });
        }
      }
    }

    const lesson = new Lesson(req.body);
    await lesson.save();
    
    const populatedLesson = await Lesson.findById(lesson._id)
      .populate('moduleId', 'title');
    
    res.status(201).json(populatedLesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all lessons for a module
router.get('/module/:moduleId', authMiddleware, async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId })
      .populate('moduleId', 'title')
      .sort({ createdAt: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific lesson
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('moduleId', 'title');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a lesson's quiz without correct answers
router.get('/:id/quiz', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Remove correct answers from quiz
    const quiz = lesson.quiz.map(({ question, options }) => ({
      question,
      options
    }));
    
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit quiz answers
router.post('/:id/quiz/submit', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const userAnswers = req.body.answers;
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Calculate score
    const results = lesson.quiz.map((question, index) => ({
      correct: userAnswers[index] === question.correctAnswer,
      correctAnswer: question.correctAnswer
    }));

    const score = results.filter(r => r.correct).length;
    const total = lesson.quiz.length;

    res.json({
      score,
      total,
      percentage: (score / total) * 100,
      results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a lesson (teachers only)
router.put('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Validate quiz structure if updating quiz
    if (req.body.quiz) {
      for (const question of req.body.quiz) {
        if (!question.options || question.options.length < 2) {
          return res.status(400).json({ 
            message: 'Each quiz question must have at least 2 options' 
          });
        }
        if (question.correctAnswer >= question.options.length) {
          return res.status(400).json({ 
            message: 'Correct answer index must be within options array bounds' 
          });
        }
      }
    }

    Object.assign(lesson, req.body);
    await lesson.save();
    
    const updatedLesson = await Lesson.findById(lesson._id)
      .populate('moduleId', 'title');
    
    res.json(updatedLesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a lesson (teachers only)
router.delete('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
