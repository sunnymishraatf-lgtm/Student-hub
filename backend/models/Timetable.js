const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  time: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate time slots per day per user
timetableSchema.index({ userId: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
