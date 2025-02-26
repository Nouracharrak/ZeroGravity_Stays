const express = require("express");
const router = require("express").Router();
const Booking = require('../models/Booking.js');
const Listing = require('../models/Listing.js');
const User = require ('../models/user.js')


// Get All users
router.get('/', async (req, res) => {
    try {
        // On récupère tous les utilisateurs
        const users = await User.find();
        res.status(200).json(users); // Retourne la liste au format JSON
    } catch (err) {
        res.status(500).json({ error: err.message }); // En cas d'erreur
    }
});
// Get User By Id
router.get('/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

//   Modify a use
router.put('/:userId', async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Delete a user
router.delete('/:userId', async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.userId);
      res.status(204).json({ message: 'Utilisateur supprimé.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  
  

// Get the trip list for a user
router.get("/:userId/trips", async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Récupérer les réservations de l'utilisateur
        const bookings = await Booking.find({ customerId: userId });

        // Récupérer les détails du listing pour chaque réservation
        const tripsWithDetails = await Promise.all(bookings.map(async (booking) => {
            const listingDetails = await Listing.findById(booking.listingId);  // Trouver le listing avec l'ID
            return {
                ...booking.toObject(),
                listingDetails: listingDetails || {}  // Ajouter les détails du listing
            };
        }));

        res.status(200).json(tripsWithDetails);  // Répondre avec les voyages et leurs détails
    } catch (err) {
        res.status(404).json({ message: 'Cannot find the trips!', error: err.message });
    }
});
  // add Listing to wishList
router.patch('/:userId/:listingId', async (req, res) => {
    try {
        const { userId, listingId } = req.params;
        const user = await User.findById(userId);
        const listing = await Listing.findById(listingId);

        // Correction de la condition dans `find`
        const favoriteListing = user.wishList.find((item) => item._id.toString() === listingId);

        if (favoriteListing) {
            // Correction de `wishList` au lieu de `wishlist`
            user.wishList = user.wishList.filter((item) => item._id.toString() !== listingId);
            await user.save();
            res.status(200).json({ message: "Listing is removed from your wishList", wishList: user.wishList });
        } else {
            user.wishList.push(listing);
            await user.save();
            res.status(200).json({ message: "Listing is added to your wishList", wishList: user.wishList });
        }
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});
    // add listing to property
    router.get("/:userId/properties", async (req, res) => {
        try {
            const { userId } = req.params;
            
            // Récupérer les properties de l'utilisateur
            const properties = await Listing.find({ creator: userId }).populate("creator")
            res.status(200).json(properties); 
        } catch (err) {
            res.status(404).json({ message: 'Cannot find the properties!', error: err.message });
        }
    });
    // add Reservation
    // Récupérer les réservations pour un utilisateur en tant qu'hôte (hostId)
router.get("/:userId/reservations", async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Récupérer les réservations où l'utilisateur est l'hôte (hostId)
        const reservations = await Booking.find({ hostId: userId })
            .populate("customerId hostId listingId"); // Peupler les informations du client et du listing
        
        res.status(200).json(reservations); // Renvoyer les réservations
    } catch (err) {
        res.status(404).json({ message: 'Cannot find the reservations!', error: err.message });
    }
});



module.exports = router;
