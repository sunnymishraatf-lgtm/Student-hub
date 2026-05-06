const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Note = require('../models/Note');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Get all notes with optional search
router.get('/', auth, async (req, res) => {
  try {
    const { search, subject } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name profilePic')
      .sort({ uploadDate: -1 });

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload new note
router.post('/', auth, upload.single('file'), [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 100 }),
  validate
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { title, subject } = req.body;

    // Determine file type
    let fileType = 'other';
    if (req.file.mimetype.includes('pdf')) fileType = 'pdf';
    else if (req.file.mimetype.includes('image')) fileType = 'image';
    else if (req.file.mimetype.includes('word') || req.file.mimetype.includes('doc')) fileType = 'doc';

    const note = new Note({
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
      title,
      subject,
      fileURL: req.file.path,
      fileType
    });

    await note.save();

    const populatedNote = await Note.findById(note._id)
      .populate('uploadedBy', 'name profilePic');

    res.status(201).json({ success: true, note: populatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete note (only uploader or admin can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    // Delete from Cloudinary
    const { cloudinary } = require('../middleware/upload');
    if (note.fileURL) {
      const publicId = note.fileURL.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`studysync-notes/${publicId}`);
    }

    await note.deleteOne();

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
