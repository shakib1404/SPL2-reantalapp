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
                thana,
                postcode,
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
                thana,
                postcode,
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
          const { searchTerm, bedroomCount, bathroomCount, minPrice, maxPrice } = req.query;
          
          // Build filter object
          let filter = {};
          
          // Add regex search for category and title if searchTerm exists
          if (searchTerm) {
            const searchRegex = new RegExp(searchTerm, 'i');
            filter.$or = [
              { category: searchRegex },
              { title: searchRegex }
            ];
          }
          
          // Add exact match filters
          if (bedroomCount) filter.bedroomCount = Number(bedroomCount);
          if (bathroomCount) filter.bathroomCount = Number(bathroomCount);
          
          // Price range filter
          if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
          }
          
          console.log("Applied Filters:", filter);
          
          // Get listings that match ALL filters including regex search
          const listings = await Listing.find(filter).populate("creator");
          
          res.status(200).json(listings);
        } catch (err) {
          console.error("Error fetching listings:", err.message);
          res.status(500).json({ 
            message: "Failed to fetch listings", 
            error: err.message 
          });
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
                thana,
                postcode,
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
                isBooked,
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
                    thana,
                    postcode,
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
                    isBooked,
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
