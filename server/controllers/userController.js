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
/*ADD LISTING TO WISHLIST */
exports.toggleWishlistItem = async (req, res) => {
    try {
        const { userId, listingId } = req.params
    
        // Check if the user and listing exist
        const user = await User.findById(userId);
        const listing = await Listing.findById(listingId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        if (!listing) {
          return res.status(404).json({ message: "Listing not found" });
        }
    
        // Vérifier si le listingId est déjà dans la wishlist
        // Note: Nous recherchons maintenant le listingId directement ou l'objet avec cet ID
        const isInWishlist = user.wishList.some(item => 
            (typeof item === 'string' && item === listingId) || 
            (item._id && item._id.toString() === listingId)
        );
      
        if (isInWishlist) {
          // Option 1: si wishList contient des chaînes (IDs)
          user.wishList = user.wishList.filter(item => 
            (typeof item === 'string' && item !== listingId) || 
            (item._id && item._id.toString() !== listingId)
          );
          await user.save();
          res.status(200).json({ 
            message: "Listing removed from wishlist", 
            wishlist: user.wishList 
          });
        } else {
          // Option 2: stocker seulement l'ID (recommandé)
          user.wishList.push(listingId);
          await user.save();
          res.status(200).json({ 
            message: "Listing added to wishlist",  
            wishlist: user.wishList 
          });
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
};
