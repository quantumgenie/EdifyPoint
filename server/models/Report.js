const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['Behavioral', 'Progress']
  },
  observedPeriod: {
    start: { 
      type: Date, 
      required: true 
    },
    end: { 
      type: Date, 
      required: true 
    }
  },
  details: { 
    type: String,
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  }
}, {
  timestamps: true
});

// Validate end date is after start date
reportSchema.pre('save', function(next) {
  if (this.observedPeriod.end <= this.observedPeriod.start) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);