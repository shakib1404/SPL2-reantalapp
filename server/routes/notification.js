const express = require('express');
const Notification = require('../Models/notification');
const router = express.Router();

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ userId })
      .sort({ timestamp: -1 }); // Sort by most recent
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  const { userId, senderId, listingId, message } = req.body;

  try {
    const newNotification = new Notification({
      userId,
      senderId,
      listingId,
      message,
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark a notification as read
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json(updatedNotification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all notifications for a user
router.delete('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await Notification.deleteMany({ userId });
    res.status(200).json({ message: 'All notifications deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

module.exports = router;
