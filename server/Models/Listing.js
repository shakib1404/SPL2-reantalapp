const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    streetAddress: {
        type: String,
        required: true,
    },
    aptSuit: {
        type: String,
        default: ''
    },
    thana: {
        type: String,
        required: true,
    },
    postcode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    guestCount: {
        type: Number,
        required: true,
    },
    bathroomCount: {
        type: Number,
        required: true,
    },
    bedroomCount: {
        type: Number,
        required: true,
    },
    bedCount: {
        type: Number,
        required: true,
    },
    amenities: {
        type: [String],
        default: []
    },
    listingPhotoPaths: {
        type: [String],
        default: []
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    highlight: {
        type: String,
        required: true,
    },
    highlightdescription: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Listing", ListingSchema);