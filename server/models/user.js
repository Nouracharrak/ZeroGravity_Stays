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
            default: [] 
        },
        wishList: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing'
        }],        
        propertyList: {
            type: Array,
            default: [] 
        },
        reservationList: {
            type: Array,
            default: [] 
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        verificationTokenExpires: Date,
        
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;

