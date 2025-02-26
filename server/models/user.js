const mongoose = require ('mongoose')
const UserSchema = new mongoose.Schema (
    {
        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        email:{
            type:String,
            required: true,
            unique:true 
        },

        password:{
            type:String,
            required: true
        },
        profileImagePath: {
            type: String,
            default:""
        },
        tripList:{
            type: Array,
            dfault: []
        },
        wishList:{
            type: Array,
            dfault: []
        },
        propertyList:{
            type: Array,
            dfault: []
        },
        reservationList:{
            type: Array,
            dfault: []
        },
    },
    {timestamps: true}
)

const User = mongoose.model ('User', UserSchema)
module.exports = User