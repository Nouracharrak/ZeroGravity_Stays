const User = require('../models/user.js');
const Booking = require('../models/Booking.js');
const Listing = require('../models/Listing.js');

// ===== Méthodes pour les opérations CRUD basiques =====

// Obtenir tous les utilisateurs (admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        res.status(500).json({ error: err.message });
    }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const specialRoutes = ["me", "update", "delete", "profile"];
        if (specialRoutes.includes(req.params.userId)) {
            return res.status(400).json({ message: "Route incorrecte" });
        }
        
        const user = await User.findById(req.params.userId).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        res.status(200).json(user);
    } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
        res.status(500).json({ error: err.message });
    }
};

// Mettre à jour un utilisateur par ID (admin)
exports.updateUser = async (req, res) => {
    try {
        const specialRoutes = ["me", "update", "delete", "profile"];
        if (specialRoutes.includes(req.params.userId)) {
            return res.status(400).json({ message: "Route incorrecte" });
        }
        
        const allowedFields = ['firstName', 'lastName', 'isActive', 'role', 'email'];
        const updateData = {};
        
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: updateData },
            { new: true }
        ).select("-password");
        
        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
        res.status(500).json({ error: err.message });
    }
};

// Supprimer un utilisateur par ID (admin)
exports.deleteUser = async (req, res) => {
    try {
        const specialRoutes = ["me", "update", "delete", "profile"];
        if (specialRoutes.includes(req.params.userId)) {
            return res.status(400).json({ message: "Route incorrecte" });
        }
        
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) {
        console.error("Erreur lors de la suppression de l'utilisateur:", err);
        res.status(500).json({ error: err.message });
    }
};

// ===== Méthodes pour les fonctionnalités spécifiques =====

// Récupérer les voyages d'un utilisateur
exports.getUserTrips = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ customerId: userId });

        const tripsWithDetails = await Promise.all(bookings.map(async (booking) => {
            const listingDetails = await Listing.findById(booking.listingId);
            return {
                ...booking.toObject(),
                listingDetails: listingDetails || {}
            };
        }));

        res.status(200).json(tripsWithDetails);
    } catch (err) {
        console.error("Erreur lors de la récupération des voyages:", err);
        res.status(404).json({ message: 'Cannot find the trips!', error: err.message });
    }
};

// Ajouter/retirer un hébergement de la liste de souhaits
exports.toggleWishlistItem = async (req, res) => {
    try {
      const { userId, listingId } = req.params;
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  
      // Vérification que listingId est bien une chaîne de caractères
      if (typeof listingId !== 'string') {
        return res.status(400).json({ message: "ID de listing invalide" });
      }
  
      const isInWishlist = user.wishList.some(id => id.toString() === listingId);
      if (isInWishlist) {
        user.wishList = user.wishList.filter(id => id.toString() !== listingId);
      } else {
        user.wishList.push(listingId);
      }
  
      await user.save();
      return res.status(200).json({ 
        message: isInWishlist ? "Listing retiré de la wishList" : "Listing ajouté à la wishList", 
        wishList: user.wishList 
      });
  
    } catch (err) {
      console.error("Erreur:", err);
      return res.status(500).json({ error: err.message });
    }
  };
  
// Récupérer les propriétés d'un utilisateur
exports.getUserProperties = async (req, res) => {
    try {
        const { userId } = req.params;
        const properties = await Listing.find({ creator: userId }).populate("creator");
        res.status(200).json(properties); 
    } catch (err) {
        console.error("Erreur lors de la récupération des propriétés:", err);
        res.status(404).json({ message: 'Cannot find the properties!', error: err.message });
    }
};

// Récupérer les réservations pour les propriétés de l'utilisateur (en tant qu'hôte)
exports.getUserReservations = async (req, res) => {
    try {
        const { userId } = req.params;
        const reservations = await Booking.find({ hostId: userId })
            .populate("customerId hostId listingId"); // Peupler les informations du client et du listing
        res.status(200).json(reservations);
    } catch (err) {
        console.error("Erreur lors de la récupération des réservations:", err);
        res.status(404).json({ message: 'Cannot find the reservations!', error: err.message });
    }
};
