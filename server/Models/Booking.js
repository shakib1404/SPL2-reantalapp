const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true, // Only a single date for the booking
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0, // Ensure totalPrice is non-negative
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
