const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  school: { 
    type: String, 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher',
    required: true 
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema); 