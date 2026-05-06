const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Subject = require('../models/Subject');
const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Get all subjects for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const subjectsWithStats = subjects.map(subject => ({
      _id: subject._id,
      subjectName: subject.subjectName,
      totalClasses: subject.totalClasses,
      attendedClasses: subject.attendedClasses,
      percentage: parseFloat(subject.getPercentage()),
      maxBunks: subject.getMaxBunks(),
      classesNeeded: subject.getClassesNeeded(),
      status: parseFloat(subject.getPercentage()) >= 75 ? 'safe' : 'danger'
    }));

    res.json({ success: true, subjects: subjectsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new subject
router.post('/', auth, [
  body('subjectName').trim().notEmpty().withMessage('Subject name is required').isLength({ max: 100 }),
  body('totalClasses').optional().isInt({ min: 0 }).withMessage('Total classes must be a non-negative integer'),
  body('attendedClasses').optional().isInt({ min: 0 }).withMessage('Attended classes must be a non-negative integer'),
  validate
], async (req, res) => {
  try {
    const { subjectName, totalClasses = 0, attendedClasses = 0 } = req.body;

    // Check if subject already exists for this user
    const existingSubject = await Subject.findOne({ 
      userId: req.user._id, 
      subjectName: { $regex: new RegExp(`^${subjectName}$`, 'i') } 
    });

    if (existingSubject) {
      return res.status(400).json({ success: false, message: 'Subject already exists' });
    }

    const subject = new Subject({
      userId: req.user._id,
      subjectName,
      totalClasses,
      attendedClasses
    });

    await subject.save();

    res.status(201).json({
      success: true,
      subject: {
        _id: subject._id,
        subjectName: subject.subjectName,
        totalClasses: subject.totalClasses,
        attendedClasses: subject.attendedClasses,
        percentage: parseFloat(subject.getPercentage()),
        maxBunks: subject.getMaxBunks(),
        classesNeeded: subject.getClassesNeeded(),
        status: parseFloat(subject.getPercentage()) >= 75 ? 'safe' : 'danger'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update attendance
router.patch('/:id/attendance', auth, [
  body('attended').isBoolean().withMessage('Attended must be a boolean'),
  validate
], async (req, res) => {
  try {
    const { attended } = req.body;
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject.totalClasses += 1;
    if (attended) {
      subject.attendedClasses += 1;
    }

    await subject.save();

    res.json({
      success: true,
      subject: {
        _id: subject._id,
        subjectName: subject.subjectName,
        totalClasses: subject.totalClasses,
        attendedClasses: subject.attendedClasses,
        percentage: parseFloat(subject.getPercentage()),
        maxBunks: subject.getMaxBunks(),
        classesNeeded: subject.getClassesNeeded(),
        status: parseFloat(subject.getPercentage()) >= 75 ? 'safe' : 'danger'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update subject details
router.put('/:id', auth, [
  body('subjectName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('totalClasses').optional().isInt({ min: 0 }),
  body('attendedClasses').optional().isInt({ min: 0 }),
  validate
], async (req, res) => {
  try {
    const updates = {};
    if (req.body.subjectName) updates.subjectName = req.body.subjectName;
    if (req.body.totalClasses !== undefined) updates.totalClasses = req.body.totalClasses;
    if (req.body.attendedClasses !== undefined) updates.attendedClasses = req.body.attendedClasses;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({
      success: true,
      subject: {
        _id: subject._id,
        subjectName: subject.subjectName,
        totalClasses: subject.totalClasses,
        attendedClasses: subject.attendedClasses,
        percentage: parseFloat(subject.getPercentage()),
        maxBunks: subject.getMaxBunks(),
        classesNeeded: subject.getClassesNeeded(),
        status: parseFloat(subject.getPercentage()) >= 75 ? 'safe' : 'danger'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Simulate attendance (without saving)
router.post('/:id/simulate', auth, async (req, res) => {
  try {
    const { action } = req.body; // 'attend' or 'miss'
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    let simulation;
    if (action === 'attend') {
      simulation = subject.simulateAttend();
    } else if (action === 'miss') {
      simulation = subject.simulateMiss();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    res.json({
      success: true,
      simulation: {
        ...simulation,
        status: parseFloat(simulation.percentage) >= 75 ? 'safe' : 'danger'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
