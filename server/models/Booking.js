const mongoose = require('mongoose');

// Validation explicite pour les ObjectId
const BookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: 'Invalid customerId format',
      },
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: 'Invalid hostId format',
      },
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      validate: {
        validator: (v) => mongoose.Types.ObjectId.isValid(v),
        message: 'Invalid listingId format',
      },
    },
    startDate: {  
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    totalPrice: {  
      type: Number,
      required: true,
    },
  },
  { timestamps: true } 
);

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;
