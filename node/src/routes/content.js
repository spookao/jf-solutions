const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');

// Public: Get content by key
router.get('/:key', async (req, res) => {
  try {
    const content = await Content.findOne({ key: req.params.key });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: Get all content
router.get('/', async (req, res) => {
  try {
    const contents = await Content.find();
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update or create content
router.post('/', auth, async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const content = await Content.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );
    res.json(content);
  } catch (error) {
    res.status(400).json({ message: 'Error updating content' });
  }
});

module.exports = router;
