const express = require("express");
const multer = require("multer");
const Listing = require("../Models/Listing");

class ListingController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/create", this.uploadPhotos().array("listingPhotos"), this.createListing.bind(this));
        this.router.get("/", this.getListings.bind(this));
        this.router.get("/search/:search", this.searchListings.bind(this));
        this.router.get("/:listingId", this.getListingById.bind(this));
        this.router.delete("/:listingId", this.deleteListing.bind(this));
        this.router.put("/update/:listingId", this.uploadPhotos().array("listingPhotos"), this.updateListing.bind(this));
    }

    uploadPhotos() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => cb(null, "public/uploads/"),
            filename: (req, file, cb) => cb(null, file.originalname),
        });
        return multer({ storage });
    }

    async createListing(req, res) {
        try {
            const {
                creator,
                category,
                type,
                streetAddress,
                aptSuit,
                city,
                province,
                country,
                guestCount,
                bathroomCount,
                bedroomCount,
                bedCount,
                amenities,
                title,
                description,
                highlight,
                highlightdescription,
                price,
                latitude,
                longitude,
            } = req.body;

            const listingPhotos = req.files;

            if (!listingPhotos) return res.status(400).send("No file uploaded");

            const listingPhotoPaths = listingPhotos.map((file) => file.path);

            const newListing = new Listing({
                creator,
                category,
                type,
                streetAddress,
                aptSuit,
                city,
                province,
                country,
                guestCount,
                bathroomCount,
                bedroomCount,
                bedCount,
                amenities,
                listingPhotoPaths,
                title,
                description,
                highlight,
                highlightdescription,
                price,
                latitude,
                longitude,
            });

            await newListing.save();

            res.status(200).json(newListing);
        } catch (err) {
            res.status(409).json({ message: "Fail to create Listing", error: err.message });
        }
    }

    async getListings(req, res) {
        try {
            const qCategory = req.query.category;
            const listings = qCategory
                ? await Listing.find({ category: qCategory }).populate("creator")
                : await Listing.find().populate("creator");

            res.status(200).json(listings);
        } catch (err) {
            res.status(404).json({ message: "Fail to fetch Listing", error: err.message });
        }
    }

    async searchListings(req, res) {
        try {
            const { search } = req.params;
            const listings = search === "all"
                ? await Listing.find().populate("creator")
                : await Listing.find({
                      $or: [
                          { category: { $regex: search, $options: "i" } },
                          { title: { $regex: search, $options: "i" } },
                      ],
                  }).populate("creator");

            res.status(200).json(listings);
        } catch (err) {
            res.status(404).json({ message: "Fail to fetch Listing", error: err.message });
        }
    }

    async getListingById(req, res) {
        try {
            const { listingId } = req.params;
            const listing = await Listing.findById(listingId).populate("creator", "firstname lastname profileimagePath");

            if (!listing) return res.status(404).json({ message: "Listing not found" });

            res.status(202).json(listing);
        } catch (err) {
            res.status(404).json({ message: "Listing cannot be found", error: err.message });
        }
    }

    async deleteListing(req, res) {
        try {
            const { listingId } = req.params;
            const deletedListing = await Listing.findByIdAndDelete(listingId);

            if (!deletedListing) return res.status(404).json({ message: "Listing not found" });

            res.status(200).json({ message: "Listing deleted successfully", deletedListing });
        } catch (err) {
            res.status(500).json({ message: "Failed to delete listing", error: err.message });
        }
    }

    async updateListing(req, res) {
        try {
            const { listingId } = req.params;
            const {
                creator,
                category,
                type,
                streetAddress,
                aptSuit,
                city,
                province,
                country,
                guestCount,
                bathroomCount,
                bedroomCount,
                bedCount,
                amenities,
                title,
                description,
                highlight,
                highlightdescription,
                price,
                latitude,
                longitude,
            } = req.body;

            const listingPhotos = req.files;
            const listingPhotoPaths = listingPhotos?.length
                ? listingPhotos.map((file) => file.path)
                : undefined;

            const updatedListing = await Listing.findByIdAndUpdate(
                listingId,
                {
                    creator,
                    category,
                    type,
                    streetAddress,
                    aptSuit,
                    city,
                    province,
                    country,
                    guestCount,
                    bathroomCount,
                    bedroomCount,
                    bedCount,
                    amenities,
                    title,
                    description,
                    highlight,
                    highlightdescription,
                    price,
                    latitude,
                    longitude,
                    listingPhotoPaths,
                },
                { new: true }
            );

            if (!updatedListing) return res.status(404).json({ message: "Listing not found" });

            res.status(200).json(updatedListing);
        } catch (err) {
            res.status(500).json({ message: "Failed to update listing", error: err.message });
        }
    }
}

const listingController = new ListingController();
module.exports = listingController.router;
