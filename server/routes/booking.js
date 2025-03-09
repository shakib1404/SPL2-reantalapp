const express = require("express");
const Booking = require("../Models/Booking");

class BookingController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/create", this.createBooking.bind(this));
    }

    async createBooking(req, res) {
        try {
            const { customerId, hostId, listingId, bookingDate, totalPrice } = req.body;

            const newBooking = new Booking({
                customerId,
                hostId, 
                listingId,
                bookingDate,
                totalPrice,
            });

            await newBooking.save();

            res.status(200).json(newBooking);
        } catch (err) {
            res.status(400).json({ message: "Fail to create a new Booking!", error: err.message });
        }
    }
}

const bookingController = new BookingController();
module.exports = bookingController.router;
