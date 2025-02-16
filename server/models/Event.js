const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    enum: ['pink', 'mint', 'orange'],
    default: 'pink'
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  }
}, {
  timestamps: true
});

// Add validation to ensure end time is after start time
eventSchema.pre('save', function(next) {
  const startDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.startTime}`);
  const endDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.endTime}`);
  
  if (endDateTime <= startDateTime) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Event', eventSchema);