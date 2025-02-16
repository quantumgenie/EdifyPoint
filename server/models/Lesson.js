const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  videoUrl: { 
    type: String, 
    required: true 
  },
  quiz: [{
    question: { 
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
          // Ensure correctAnswer is a valid index in options array
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
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
