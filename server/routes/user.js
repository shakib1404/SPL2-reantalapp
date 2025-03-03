const express = require("express");
const Booking = require("../Models/Booking");
const User = require("../Models/user");
const Listing = require("../Models/Listing");

class UserController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/:userId/trips', this.getTrips.bind(this));
        this.router.patch('/:userId/:listingId', this.toggleWishlist.bind(this));
        this.router.get('/:userId/properties', this.getProperties.bind(this));
        this.router.get('/:userId/reservations', this.getReservations.bind(this));
        this.router.get('/:userId', this.getUserDetails.bind(this));
        this.router.delete('/:userId/:listingId', this.removeFromWishlist.bind(this));
    }

    async getTrips(req, res) {
        try {
            const { userId } = req.params;
            const trips = await Booking.find({ customerId: userId }).populate(
                "customerId hostId listingId"
            );
            res.status(200).json(trips);
        } catch (err) {
            console.log(err);
            res.status(404).json({ message: "Can not find trips!", error: err.message });
        }
    }

    async toggleWishlist(req, res) {
        try {
            const { userId, listingId } = req.params;
            const user = await User.findById(userId);
            const listing = await Listing.findById(listingId).populate("creator");

            const favouriteListing = user.wishList.find(
                (item) => item._id.toString() === listingId
            );
            if (favouriteListing) {
                user.wishList = user.wishList.filter(
                    (item) => item._id.toString() !== listingId
                );
                await user.save();
                res.status(200).json({
                    message: "Listing is removed from wishlist",
                    wishList: user.wishList,
                });
            } else {
                user.wishList.push(listing);
                await user.save();
                res.status(200).json({
                    message: "Listing is added to wishlist",
                    wishList: user.wishList,
                });
            }
        } catch (err) {
            console.log(err);
            res.status(404).json({ error: err.message });
        }
    }

    async getProperties(req, res) {
        try {
            const { userId } = req.params;
            const properties = await Listing.find({ creator: userId }).populate(
                "creator"
            );
            res.status(200).json(properties);
        } catch (err) {
            console.log(err);
            res.status(404).json({ message: "Can not find properties!", error: err.message });
        }
    }

    async getReservations(req, res) {
        try {
            const { userId } = req.params;
            const reservations = await Booking.find({ hostId: userId }).populate(
                "customerId hostId listingId"
            );
            res.status(200).json(reservations);
        } catch (err) {
            console.log(err);
            res.status(404).json({ message: "Can not find reservations!", error: err.message });
        }
    }

    async getUserDetails(req, res) {
        try {
            const user = await User.findById(req.params.userId);

            if (!user) return res.status(404).send({ error: 'User not found' });

            res.json({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                profileimagePath: user.profileimagePath,
                tripList: user.tripList,
                wishList: user.wishList,
                propertyList: user.propertyList,
                reservationList: user.reservationList,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        } catch (err) {
            res.status(500).send({ error: 'Server error' });
        }
    }

    async removeFromWishlist(req, res) {
        try {
            const { userId, listingId } = req.params;
            const user = await User.findById(userId);

            const favouriteListing = user.wishList.find(
                (item) => item._id.toString() === listingId
            );

            if (!favouriteListing) {
                return res.status(404).json({
                    message: "Listing not found in wishlist",
                    wishList: user.wishList,
                });
            }

            user.wishList = user.wishList.filter(
                (item) => item._id.toString() !== listingId
            );

            await user.save();

            res.status(200).json({
                message: "Listing removed from wishlist",
                wishList: user.wishList,
            });
        } catch (err) {
            console.log(err);
            res.status(404).json({ error: err.message });
        }
    }
}

const userController = new UserController();
module.exports = userController.router;
