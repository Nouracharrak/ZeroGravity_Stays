const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
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
            unique: true 
        },
        password: {
            type: String,
            required: true
        },
        profileImagePath: {
            type: String,
            required: false,
            default: ""
        },
        tripList: {
            type: Array,
            default: [] // Correction ici
        },
        wishList: {
            type: Array,
            default: [] // Correction ici
        },
        propertyList: {
            type: Array,
            default: [] // Correction ici
        },
        reservationList: {
            type: Array,
            default: [] // Correction ici
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        verificationTokenExpires: Date
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
