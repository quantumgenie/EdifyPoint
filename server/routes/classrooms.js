const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const { authMiddleware, verifyTeacher } = require('../middleware/auth');
const Student = require('../models/Student');


// Testing 
router.get('/test', (req, res) => {
    res.json({ message: 'Classroom routes are working' });
  });
  

// Create a new classroom (teachers only)
router.post('/', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const classroom = new Classroom({
      ...req.body,
      teacherId: req.user.id
    });
    await classroom.save();
    res.status(201).json(classroom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all classrooms for a teacher with student count
router.get('/teacher', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    console.log('Fetching classrooms for teacher:', req.user.id);
    
    const classrooms = await Classroom.find({ teacherId: req.user.id })
      .populate('students', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log('Found classrooms:', classrooms);

    const classroomsWithCount = classrooms.map(classroom => ({
      _id: classroom._id,
      name: classroom.name,
      school: classroom.school,
      studentCount: classroom.students.length,
      createdAt: classroom.createdAt
    }));

    res.json(classroomsWithCount);
  } catch (err) {
    console.error('Error in /teacher route:', err);
    res.status(500).json({ 
      message: 'Error fetching classrooms',
      error: err.message 
    });
  }
});

// Get a single classroom with populated data for messaging
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('teacherId', '_id firstName lastName')
            .populate({
                path: 'students',
                populate: {
                    path: 'parent',
                    select: '_id firstName lastName'
                }
            });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Transform teacherId to teacher for frontend consistency
        const responseData = classroom.toObject();
        responseData.teacher = responseData.teacherId;
        delete responseData.teacherId;

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific classroom by ID with detailed data
router.get('/:id/details', authMiddleware, verifyTeacher, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('students')
            .populate('teacherId', '_id firstName lastName')
            .exec();
        
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Transform teacherId to teacher for frontend consistency
        const responseData = classroom.toObject();
        responseData.teacher = responseData.teacherId;
        delete responseData.teacherId;

        res.json(responseData);
    } catch (err) {
        console.error('Error fetching classroom:', err);
        res.status(500).json({ message: 'Error fetching classroom', error: err.message });
    }
});

// Update a classroom (teachers only)
router.put('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ 
      _id: req.params.id,
      teacherId: req.user.id 
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or unauthorized' });
    }

    Object.assign(classroom, req.body);
    await classroom.save();
    res.json(classroom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add students to a classroom
router.post('/:id/students', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ 
      _id: req.params.id,
      teacherId: req.user.id 
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or unauthorized' });
    }

    const { studentIds } = req.body;
    classroom.students = [...new Set([...classroom.students, ...studentIds])];
    await classroom.save();
    
    res.json(classroom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove students from a classroom
router.delete('/:id/students', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const classroom = await Classroom.findOne({ 
      _id: req.params.id,
      teacherId: req.user.id 
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or unauthorized' });
    }

    const { studentIds } = req.body;
    classroom.students = classroom.students.filter(
      student => !studentIds.includes(student.toString())
    );
    await classroom.save();
    
    res.json(classroom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a classroom
router.delete('/:id', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndDelete({ 
      _id: req.params.id,
      teacherId: req.user.id 
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or unauthorized' });
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this route to handle adding students
router.put('/:id/students', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const { newStudents } = req.body;
    const classroomId = req.params.id;

    // Create student documents
    const studentDocs = newStudents.map(name => {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        firstName,
        lastName: lastName || '',
        teacherId: req.user.id,
        classroomId
      };
    });

    // Insert the students
    const createdStudents = await Student.insertMany(studentDocs);

    // Update the classroom with the new student IDs
    await Classroom.findByIdAndUpdate(
      classroomId,
      {
        $push: { students: { $each: createdStudents.map(student => student._id) } }
      }
    );

    res.json(createdStudents);
  } catch (err) {
    console.error('Error adding students:', err);
    res.status(500).json({ message: 'Error adding students', error: err.message });
  }
});

// Add this route to handle removing students
router.delete('/:classroomId/students/:studentId', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;

    // Remove student from classroom
    await Classroom.findByIdAndUpdate(classroomId, {
      $pull: { students: studentId }
    });

    // Delete the student document
    await Student.findByIdAndDelete(studentId);

    res.json({ message: 'Student removed successfully' });
  } catch (err) {
    console.error('Error removing student:', err);
    res.status(500).json({ message: 'Error removing student', error: err.message });
  }
});

// Add this route to handle restoring students
router.post('/:id/students/restore', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const { student } = req.body;
    const classroomId = req.params.id;

    // Create new student document with the original data
    const newStudent = new Student({
      firstName: student.firstName,
      lastName: student.lastName,
      teacherId: req.user.id,
      classroomId
    });

    // Save the student
    const savedStudent = await newStudent.save();

    // Update the classroom with the new student ID
    await Classroom.findByIdAndUpdate(
      classroomId,
      {
        $push: { students: savedStudent._id }
      }
    );

    res.json(savedStudent);
  } catch (err) {
    console.error('Error restoring student:', err);
    res.status(500).json({ message: 'Error restoring student', error: err.message });
  }
});

// Get students with their parent relationships for a classroom
router.get('/:id/students/parents', authMiddleware, verifyTeacher, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate({
        path: 'students',
        select: '_id firstName lastName parentId'
      });
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json(classroom.students);
  } catch (err) {
    console.error('Error fetching student-parent relationships:', err);
    res.status(500).json({ message: 'Error fetching student-parent relationships', error: err.message });
  }
});

module.exports = router; 