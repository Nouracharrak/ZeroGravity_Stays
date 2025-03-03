const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },
    email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
     message: {
    type: String,
    required: true,
    trim: true
  },
     status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ContactUs = mongoose.model('ContactUs', contactSchema);

module.exports = ContactUs;
