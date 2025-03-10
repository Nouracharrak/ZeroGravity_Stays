import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  listings: [],
  tripList: [],
  wishList: []
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state._id = action.payload.user._id;
      state.token = action.payload.token;
      
      // Persistez dans localStorage également
      try {
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('userId', action.payload.user._id);
        console.log("Token et userId stockés dans localStorage via Redux");
      } catch (e) {
        console.error("Erreur de stockage local dans Redux:", e);
      }
    },
    logout: (state) => {
      state.user = null;
      state._id = null;
      state.token = null;
      state.tripList = [];
      
      // Nettoyez localStorage
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        console.log("Token et userId supprimés de localStorage");
      } catch (e) {
        console.error("Erreur lors du nettoyage du stockage local:", e);
      }
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings;
    },
    setTripList: (state, action) => {
      if (state.user) {
        state.user.tripList = action.payload;
      }
    },
    setWishList: (state, action) => {
      if (state.user) {
        state.user.wishList = action.payload;
      }
    },
    setPropertyList: (state, action) => {
      if (state.user) {
        state.user.propertyList = action.payload;
      }
    },
    setReservationList: (state, action) => {
      if (state.user) {
        state.user.reservationList = action.payload;
      }
    },
  },
});

export const { setLogin, setLogout, setListings, setTripList, setWishList, setPropertyList, setReservationList } = userSlice.actions;

export default userSlice.reducer;
