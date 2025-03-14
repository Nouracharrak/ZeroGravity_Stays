
const URL = {
// BOOKINGS
    FETCH_BOOKINGS: "https://zero-gravity-stays-bevn.vercel.app/bookings",
    CREATE_BOOKINGS: "https://zero-gravity-stays-bevn.vercel.app/bookings/create",
    UPDATE_BOOKINGS: "https://zero-gravity-stays-bevn.vercel.app/bookings",
    DELETE_BOOKINGS: "https://zero-gravity-stays-bevn.vercel.app/bookings",

// USER
    AUTHENTIFICATION: "https://zero-gravity-stays-bevn.vercel.app/auth/login",
    REGISTER: "https://zero-gravity-stays-bevn.vercel.app/auth/register",
    FORGOT_PASSWORD: "https://zero-gravity-stays-bevn.vercel.app/auth/forgot-password",
    RESET_PASSWORD: "https://zero-gravity-stays-bevn.vercel.app/auth/reset-password",
    RESEND_VERIFICATION: "https://zero-gravity-stays-bevn.vercel.app/auth/resend-verification",
    VERIFY_EMAIL: "https://zero-gravity-stays-bevn.vercel.app/auth/verify-email",
    FETCH_USERS: "https://zero-gravity-stays-bevn.vercel.app/users",
    UPDATE_USER: "https://zero-gravity-stays-bevn.vercel.app/users",
    DELETE_USER: "https://zero-gravity-stays-bevn.vercel.app/users",

    // PROFILE 
    FETCH_PROFILE: "https://zero-gravity-stays-bevn.vercel.app/users/profile/me",
    UPDATE_PROFILE: "https://zero-gravity-stays-bevn.vercel.app/users/profile/update",
    UPDATE_PASSWORD: "https://zero-gravity-stays-bevn.vercel.app/users/profile/password",
    UPDATE_PICTURE: "https://zero-gravity-stays-bevn.vercel.app/users/profile/picture",
    DELETE_PROFILE: "https://zero-gravity-stays-bevn.vercel.app/users/profile/delete",

// LISTING
    FETCH_LISTINGS: "https://zero-gravity-stays-bevn.vercel.app/properties",
    CREATE_LISTINGS: "https://zero-gravity-stays-bevn.vercel.app/properties/create",
    UPDATE_LISTINGS: "https://zero-gravity-stays-bevn.vercel.app/properties",
    DELETE_LISTINGS: "https://zero-gravity-stays-bevn.vercel.app/properties",
// Search
    SEARCH_LISTINGS: "https://zero-gravity-stays-bevn.vercel.app/properties/search",
// URL CLOUDINARY
    CLOUDINARY: "https://api.cloudinary.com/v1_1/drdw1wuks/image/upload",
// CONFIRMATION
    SEND_CONFIRMATION: "https://zero-gravity-stays-bevn.vercel.app/stripe/payment-success",
// URL BACK 
    BACK_LINK : "https://zero-gravity-stays-bevn.vercel.app"
    }





export default URL;