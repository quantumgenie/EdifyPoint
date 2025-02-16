const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  classroomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Classroom',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Module', moduleSchema); 