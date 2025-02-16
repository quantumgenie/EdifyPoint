const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Student = require('../models/Student');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');

// Create a new report (teachers only)
router.post('/create/:classId/:studentId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      classId: req.params.classId,
      studentId: req.params.studentId
    });
    
    await report.save();
    const populatedReport = await Report.findById(report._id)
      .populate('studentId', 'firstName lastName')
      .populate('teacherId', 'firstName lastName title');
    
    res.status(201).json(populatedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all reports for a student in a class
router.get('/:classId/student/:studentId', authMiddleware, async (req, res) => {
  try {
    // If parent, verify they have access to this student
    if (req.user.role === 'parent') {
      const student = await Student.findById(req.params.studentId);
      if (!student || student.parentId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view these reports' });
      }
    }

    const reports = await Report.find({ 
      studentId: req.params.studentId,
      classId: req.params.classId
    })
    .populate('studentId', 'firstName lastName')
    .populate('teacherId', 'firstName lastName title')
    .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reports by type
router.get('/:classId/type/:type', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    if (!['Behavioral', 'Progress'].includes(req.params.type)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const reports = await Report.find({ 
      type: req.params.type,
      classId: req.params.classId
    })
      .populate('studentId', 'firstName lastName')
      .populate('teacherId', 'firstName lastName title')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reports for a date range
router.get('/:classId/range', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    let query = {
      'observedPeriod.start': { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      classId: req.params.classId
    };

    // If parent, only show their students' reports
    if (req.user.role === 'parent') {
      const students = await Student.find({ parentId: req.user.id });
      const studentIds = students.map(student => student._id);
      query.studentId = { $in: studentIds };
    }

    const reports = await Report.find(query)
      .populate('studentId', 'firstName lastName')
      .populate('teacherId', 'firstName lastName title')
      .sort({ 'observedPeriod.start': 1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific report
router.get('/:classId/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('studentId', 'firstName lastName')
      .populate('teacherId', 'firstName lastName title');
    
    if (!report || report.classId !== req.params.classId) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // If parent, verify they have access to this student's report
    if (req.user.role === 'parent') {
      const student = await Student.findById(report.studentId);
      if (!student || student.parentId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this report' });
      }
    }
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a report (teachers only)
router.put('/:classId/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report || report.classId !== req.params.classId) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get teacher record for the authenticated user
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Verify the teacher owns this report
    if (report.teacherId.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    // Validate date range if updating
    if (req.body.observedPeriod) {
      const startDate = req.body.observedPeriod.start || report.observedPeriod.start;
      const endDate = req.body.observedPeriod.end || report.observedPeriod.end;
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ message: 'End date must be after or equal to start date' });
      }
    }

    // Don't allow updating teacherId
    const { teacherId, ...updateData } = req.body;
    Object.assign(report, updateData);
    await report.save();
    
    const updatedReport = await Report.findById(report._id)
      .populate('studentId', 'firstName lastName')
      .populate('teacherId', 'firstName lastName title');
    
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a report (teachers only)
router.delete('/:classId/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report || report.classId !== req.params.classId) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get teacher record for the authenticated user
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Verify the teacher owns this report
    if (report.teacherId.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }
    
    await report.deleteOne();
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
