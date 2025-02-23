const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  color: {
    type: String,
    default: '#1a73e8' // Default blue color
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