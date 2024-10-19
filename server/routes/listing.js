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
      category, // Corrected spelling here
      type,
      streetAddress,
      aptSuit, // Corrected spelling here
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

router.get("/search/:search",async(req,res)=>
{
  const {search}=req.params
  try {
    let listings=[]

    if(search==="all")
    {
      listings=await Listing.find().populate("creator")
    }
    else{
      listings=await Listing.find({
        $or:[
          {category:{$regex:search,$options:"i"}},
          {title:{$regex:search,$options:"i"}},
        ]
      }).populate("creator")
    }
    res.status(200).json(listings)
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch Listing", error: err.message });
    console.log(err);
    
  }
})




router.get("/:listingId",async(req,res)=>{
  try {
     const {listingId}=req.params 
     console.log(listingId)
    // const listing=await Listing.findById(listingId)
     const listing = await Listing.findById(listingId).populate('creator', 'firstname lastname profileimagePath'); // Select only the required fields


     res.status(202).json(listing)
    // res.status(202).json(listing2)

  } catch (err) {
    res.status(404).json({message:"Listing can not found",error:err.message})
  }
})



module.exports = router;

//router.get("/:listingId")
 