const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: [{
    type: Number,
    required: true
  }],
  attemptDate: {
    type: Date,
    default: Date.now
  }
});

const lessonSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  videoUrl: { 
    type: String,
    required: false 
  },
  quiz: [{
    text: { 
      type: String, 
      required: true 
    },
    options: [{ 
      type: String, 
      required: true 
    }],
    correctAnswer: { 
      type: Number, 
      required: true,
      validate: {
        validator: function(value) {
          return value >= 0 && value < this.options.length;
        },
        message: 'Correct answer index must be within the options array bounds'
      }
    }
  }],
  moduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module',
    required: true 
  },
  order: {
    type: Number,
    required: true
  },
  quizAttempts: [quizAttemptSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
