const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

router.get('/', async (req, res) => {
  try {
    // TEMP: no auth yet
    const reminders = await Reminder
      .find()
      .populate('document', 'title expiryDate')
      .sort({ reminderDate: 1 });

    res.status(200).json({ reminders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

/**
 * Mark reminder as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reminder' });
  }
});

/**
 * Delete reminder
 */
router.delete('/:id', async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete reminder' });
  }
});

module.exports = router;
