const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Timetable = require('../models/Timetable');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Get full timetable
router.get('/', auth, async (req, res) => {
  try {
    const timetable = await Timetable.find({ userId: req.user._id }).sort({ time: 1 });

    // Group by day
    const grouped = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], 
      Friday: [], Saturday: [], Sunday: []
    };

    timetable.forEach(item => {
      grouped[item.day].push({
        _id: item._id,
        time: item.time,
        subject: item.subject,
        color: item.color
      });
    });

    res.json({ success: true, timetable: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add timetable entry
router.post('/', auth, [
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 100 }),
  body('color').optional().isHexColor(),
  validate
], async (req, res) => {
  try {
    const { day, time, subject, color = '#3B82F6' } = req.body;

    const entry = new Timetable({
      userId: req.user._id,
      day,
      time,
      subject,
      color
    });

    await entry.save();

    res.status(201).json({
      success: true,
      entry: {
        _id: entry._id,
        day: entry.day,
        time: entry.time,
        subject: entry.subject,
        color: entry.color
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Time slot already exists for this day' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update timetable entry
router.put('/:id', auth, [
  body('day').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  body('time').optional().trim().notEmpty(),
  body('subject').optional().trim().notEmpty().isLength({ max: 100 }),
  body('color').optional().isHexColor(),
  validate
], async (req, res) => {
  try {
    const updates = {};
    if (req.body.day) updates.day = req.body.day;
    if (req.body.time) updates.time = req.body.time;
    if (req.body.subject) updates.subject = req.body.subject;
    if (req.body.color) updates.color = req.body.color;

    const entry = await Timetable.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({
      success: true,
      entry: {
        _id: entry._id,
        day: entry.day,
        time: entry.time,
        subject: entry.subject,
        color: entry.color
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Time slot already exists for this day' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete timetable entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Timetable.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
