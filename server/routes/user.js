const router = require("express").Router();

const Booking = require("../Models/Booking");
const User = require("../Models/user");
const Listing = require("../Models/Listing");

router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(200).json(trips);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find trips!", error: err.message });
  }
});

router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId).populate("creator");

    const favouriteListing = user.wishList.find(
      (item) => item._id.toString() === listing
    );
    if (favouriteListing) {
      user.wishList = user.wishList.filter(
        (item) => item._id.toString() !== listingId
      );
      await user.save();
      res
        .status(200)
        .json({
          message: "Listing is removed from wishlist",
          wishList: user.wishList,
        });
    } else {
      user.wishList.push(listing);
      await user.save();
      res
        .status(200)
        .json({
          message: "Listing is added to wishlist",
          wishList: user.wishList,
        });
    }
  } catch (err) {
    console.log(err)
    res.status(404).json({error: err.message})
  }
});

router.get("/:userId/properties", async (req, res) => {
    try {
      const { userId } = req.params;
      const properties = await Listing.find({ creator: userId }).populate(
        "creator"
      );
      res.status(200).json(properties);
    } catch (err) {
      console.log(err);
      res
        .status(404)
        .json({ message: "Can not find properties!", error: err.message });
    }
  });

  router.get("/:userId/reservations", async (req, res) => {
    try {
      const { userId } = req.params;
      const reservations= await Booking.find({ hostId: userId }).populate(
        "customerId hostId listingId"
      );
      res.status(200).json(reservations);
    } catch (err) {
      console.log(err);
      res
        .status(404)
        .json({ message: "Can not find reservations!", error: err.message });
    }
  });

module.exports = router;
