const router = require("express").Router();
const multer = require("multer");
const user = require("../Models/user");
const Listing = require("../Models/Listing");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post("/create", upload.array("listingPhotos"), async (req, res) => {
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
      latitude, // Include latitude
      longitude, // Include longitude
    } = req.body;

    const listingPhotos = req.files;

    if (!listingPhotos) {
      return res.status(400).send("No file uploaded");
    }

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
      latitude, // Store latitude
      longitude, // Store longitude
    });

    await newListing.save();

    res.status(200).json(newListing);
  } catch (err) {
    res.status(409).json({ message: "Fail to create Listing", error: err.message });
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate("creator");
    } else {
      listings = await Listing.find().populate("creator");
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch Listing", error: err.message });
    console.log(err);
  }
});

router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  try {
    let listings = [];

    if (search === "all") {
      listings = await Listing.find().populate("creator");
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      }).populate("creator");
    }
    res.status(200).json(listings);
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch Listing", error: err.message });
    console.log(err);
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    console.log(listingId);
    const listing = await Listing.findById(listingId).populate('creator', 'firstname lastname profileimagePath'); // Select only the required fields

    res.status(202).json(listing);
  } catch (err) {
    res.status(404).json({ message: "Listing can not be found", error: err.message });
  }
});

router.delete("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(listingId);

    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ message: "Listing deleted successfully", deletedListing });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
});
router.put("/update/:listingId", upload.array("listingPhotos"), async (req, res) => {
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
      latitude, // Include latitude
      longitude, // Include longitude
    } = req.body;

    const listingPhotos = req.files;
    let listingPhotoPaths = [];

    if (listingPhotos.length > 0) {
      listingPhotoPaths = listingPhotos.map((file) => file.path);
    }

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
        latitude, // Store latitude
        longitude, // Store longitude
        listingPhotoPaths: listingPhotoPaths.length > 0 ? listingPhotoPaths : undefined, // Only update photos if new ones are uploaded
      },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(updatedListing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
    console.log(err);
  }
});


module.exports = router;
