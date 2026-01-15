const express = require("express");
const router = express.Router();
const Reminder = require("../models/Reminder");
const { protect } = require("../middleware/auth");

// All reminder routes require authentication
router.use(protect);

/**
 * Get reminders for the authenticated user only
 */
router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id })
      .populate("document", "title expiryDate")
      .sort({ reminderDate: 1 });

    res.status(200).json({ reminders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

/**
 * Mark reminder as read (only if owned by user)
 */
router.put("/:id/read", async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ message: "Failed to update reminder" });
  }
});

/**
 * Delete reminder (only if owned by user)
 */
router.delete("/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reminder" });
  }
});

module.exports = router;
