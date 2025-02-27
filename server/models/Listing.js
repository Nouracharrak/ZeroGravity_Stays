const mongoose = require('mongoose');
const ListingSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: mongoose.Types.ObjectId.isValid,
      message: 'Invalid creator ID format.',
    },
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
  aptSuite: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  province: {
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
  bedroomCount: {
    type: Number,
    required: true,
  },
  bedCount: {
    type: Number,
    required: true,
  },
  bathroomCount: {
    type: Number,
    required: true,
  },
  amenities: {
    type: [String],
    default: [],
  },
  
  // store photo URL
  listingPhotosPaths: [{ type: String }],
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
  highlightDesc: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Listing = mongoose.model('Listing', ListingSchema);
module.exports = Listing;

