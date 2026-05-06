const express = require('express');
const { auth } = require('../middleware/auth');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const router = express.Router();

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    const timetables = await Timetable.find({ userId: req.user._id }).sort({ time: 1 });

    // Calculate overall attendance
    let totalClasses = 0;
    let totalAttended = 0;
    let lowAttendanceSubjects = [];

    subjects.forEach(subject => {
      totalClasses += subject.totalClasses;
      totalAttended += subject.attendedClasses;

      const percentage = subject.totalClasses > 0 
        ? (subject.attendedClasses / subject.totalClasses) * 100 
        : 0;

      if (percentage < 75) {
        lowAttendanceSubjects.push({
          name: subject.subjectName,
          percentage: percentage.toFixed(2)
        });
      }
    });

    const overallPercentage = totalClasses > 0 
      ? ((totalAttended / totalClasses) * 100).toFixed(2) 
      : 0;

    // Get today's timetable
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todayTimetable = timetables.filter(t => t.day === today);

    res.json({
      success: true,
      stats: {
        totalSubjects: subjects.length,
        overallPercentage: parseFloat(overallPercentage),
        lowAttendanceSubjects,
        todayTimetable,
        today
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
