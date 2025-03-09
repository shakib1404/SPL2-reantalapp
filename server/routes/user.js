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
        // Add a new route for cleaning up invalid listings
        this.router.post('/:userId/cleanup', this.cleanupInvalidListings.bind(this));
    }

    async getTrips(req, res) {
        try {
            const { userId } = req.params;
            let trips = await Booking.find({ customerId: userId }).populate(
                "customerId hostId listingId"
            );
            
            // Filter out trips with null listingId (listings that no longer exist)
            const validTrips = trips.filter(trip => trip.listingId !== null);
            
            // If we found trips with invalid listings, clean them up
            if (validTrips.length < trips.length) {
                const invalidTrips = trips.filter(trip => trip.listingId === null);
                // Remove invalid trips from database
                for (const trip of invalidTrips) {
                    await Booking.findByIdAndDelete(trip._id);
                }
                
                // Also update user's tripList if it exists
                const user = await User.findById(userId);
                if (user && user.tripList) {
                    const invalidIds = invalidTrips.map(trip => trip._id.toString());
                    user.tripList = user.tripList.filter(tripId => 
                        !invalidIds.includes(tripId.toString())
                    );
                    await user.save();
                }
                
                trips = validTrips;
            }
            
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
            
            if (!listing) {
                return res.status(404).json({ message: "Listing not found" });
            }

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
            let reservations = await Booking.find({ hostId: userId }).populate(
                "customerId hostId listingId"
            );
            
            // Filter out reservations with null listingId (listings that no longer exist)
            const validReservations = reservations.filter(reservation => reservation.listingId !== null);
            
            // If we found reservations with invalid listings, clean them up
            if (validReservations.length < reservations.length) {
                const invalidReservations = reservations.filter(reservation => reservation.listingId === null);
                // Remove invalid reservations from database
                for (const reservation of invalidReservations) {
                    await Booking.findByIdAndDelete(reservation._id);
                }
                
                // Also update user's reservationList if it exists
                const user = await User.findById(userId);
                if (user && user.reservationList) {
                    const invalidIds = invalidReservations.map(reservation => reservation._id.toString());
                    user.reservationList = user.reservationList.filter(reservationId => 
                        !invalidIds.includes(reservationId.toString())
                    );
                    await user.save();
                }
                
                reservations = validReservations;
            }
            
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

    // New method to clean up invalid listings from user's lists
    async cleanupInvalidListings(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            let cleanupReport = {
                wishList: { before: 0, after: 0, removed: [] },
                tripList: { before: 0, after: 0, removed: [] },
                reservationList: { before: 0, after: 0, removed: [] },
                propertyList: { before: 0, after: 0, removed: [] }
            };
            
            // Clean up wishList
            if (user.wishList && user.wishList.length > 0) {
                cleanupReport.wishList.before = user.wishList.length;
                const validWishlistItems = [];
                
                for (const item of user.wishList) {
                    const listingExists = await Listing.exists({ _id: item._id });
                    if (listingExists) {
                        validWishlistItems.push(item);
                    } else {
                        cleanupReport.wishList.removed.push(item._id.toString());
                    }
                }
                
                user.wishList = validWishlistItems;
                cleanupReport.wishList.after = user.wishList.length;
            }
            
            // Clean up tripList based on Booking entries
            if (user.tripList && user.tripList.length > 0) {
                cleanupReport.tripList.before = user.tripList.length;
                const validTripIds = [];
                
                for (const tripId of user.tripList) {
                    const booking = await Booking.findById(tripId).populate("listingId");
                    if (booking && booking.listingId) {
                        validTripIds.push(tripId);
                    } else {
                        // If booking exists but listing is null, delete the booking
                        if (booking) {
                            await Booking.findByIdAndDelete(booking._id);
                        }
                        cleanupReport.tripList.removed.push(tripId.toString());
                    }
                }
                
                user.tripList = validTripIds;
                cleanupReport.tripList.after = user.tripList.length;
            }
            
            // Clean up reservationList based on Booking entries
            if (user.reservationList && user.reservationList.length > 0) {
                cleanupReport.reservationList.before = user.reservationList.length;
                const validReservationIds = [];
                
                for (const reservationId of user.reservationList) {
                    const booking = await Booking.findById(reservationId).populate("listingId");
                    if (booking && booking.listingId) {
                        validReservationIds.push(reservationId);
                    } else {
                        // If booking exists but listing is null, delete the booking
                        if (booking) {
                            await Booking.findByIdAndDelete(booking._id);
                        }
                        cleanupReport.reservationList.removed.push(reservationId.toString());
                    }
                }
                
                user.reservationList = validReservationIds;
                cleanupReport.reservationList.after = user.reservationList.length;
            }
            
            // Clean up propertyList
            if (user.propertyList && user.propertyList.length > 0) {
                cleanupReport.propertyList.before = user.propertyList.length;
                const validPropertyIds = [];
                
                for (const propertyId of user.propertyList) {
                    const listingExists = await Listing.exists({ _id: propertyId });
                    if (listingExists) {
                        validPropertyIds.push(propertyId);
                    } else {
                        cleanupReport.propertyList.removed.push(propertyId.toString());
                    }
                }
                
                user.propertyList = validPropertyIds;
                cleanupReport.propertyList.after = user.propertyList.length;
            }
            
            // Save the updated user
            await user.save();
            
            res.status(200).json({
                message: "User lists cleaned up successfully",
                report: cleanupReport
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    }
}

const userController = new UserController();
module.exports = userController.router;