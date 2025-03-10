const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: false, 
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing', 
    required: true,
  },
  message: {
    type: String, 
    required: true,
  },
  isRead: {
    type: Boolean, 
    default: false,
  },
  type: {
    type: String,
    enum: ['BOOKING_REQUEST', 'BOOKING_APPROVED', 'BOOKING_DECLINED', 'WISHLIST', 'GENERAL','PROPERTY_AVAILABLE'],
    required: true
  },
  timestamp: {
    type: Date, 
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
