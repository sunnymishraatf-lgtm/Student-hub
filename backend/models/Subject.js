const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  totalClasses: {
    type: Number,
    default: 0,
    min: 0
  },
  attendedClasses: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate attendance percentage
subjectSchema.methods.getPercentage = function() {
  if (this.totalClasses === 0) return 0;
  return ((this.attendedClasses / this.totalClasses) * 100).toFixed(2);
};

// Calculate max classes that can be missed while staying above 75%
subjectSchema.methods.getMaxBunks = function() {
  if (this.totalClasses === 0) return 0;
  const percentage = this.attendedClasses / this.totalClasses;
  if (percentage < 0.75) return 0;

  const maxBunks = Math.floor((this.attendedClasses - 0.75 * this.totalClasses) / 0.75);
  return Math.max(0, maxBunks);
};

// Calculate classes needed to recover to 75%
subjectSchema.methods.getClassesNeeded = function() {
  if (this.totalClasses === 0) return 0;
  const percentage = this.attendedClasses / this.totalClasses;
  if (percentage >= 0.75) return 0;

  let attended = this.attendedClasses;
  let total = this.totalClasses;
  let needed = 0;

  while ((attended / total) < 0.75) {
    attended += 1;
    total += 1;
    needed += 1;

    // Safety limit
    if (needed > 1000) break;
  }

  return needed;
};

// Simulate next class attendance
subjectSchema.methods.simulateAttend = function() {
  const newTotal = this.totalClasses + 1;
  const newAttended = this.attendedClasses + 1;
  return {
    totalClasses: newTotal,
    attendedClasses: newAttended,
    percentage: ((newAttended / newTotal) * 100).toFixed(2)
  };
};

// Simulate next class miss
subjectSchema.methods.simulateMiss = function() {
  const newTotal = this.totalClasses + 1;
  const newAttended = this.attendedClasses;
  return {
    totalClasses: newTotal,
    attendedClasses: newAttended,
    percentage: ((newAttended / newTotal) * 100).toFixed(2)
  };
};

module.exports = mongoose.model('Subject', subjectSchema);
