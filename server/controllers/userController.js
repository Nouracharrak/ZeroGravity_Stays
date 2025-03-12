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
        const { userId, listingId } = req.params;
        
        // Vérifiez que les params sont valides avant de continuer
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(listingId)) {
            return res.status(400).json({ message: "Invalid user or listing ID format" });
        }
    
        // Récupérer l'utilisateur avec sa liste de souhaits
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Vérifier si le listing existe
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        
        // S'assurer que wishList est initialisée
        if (!user.wishList) {
            user.wishList = [];
        }
        
        // Convertir tous les éléments en chaînes pour une comparaison cohérente
        const wishListIds = user.wishList.map(item => 
            typeof item === 'string' ? item : item.toString()
        );
        
        // Vérifier si le listing est dans la wishlist
        const index = wishListIds.indexOf(listingId.toString());
        
        if (index !== -1) {
            // Supprimer de la wishlist
            user.wishList.splice(index, 1);
            console.log(`Removed listing ${listingId} from wishlist`);
        } else {
            // Ajouter à la wishlist
            user.wishList.push(listingId);
            console.log(`Added listing ${listingId} to wishlist`);
        }
        
        // Sauvegarder les changements
        await user.save();
        
        // Assurez-vous de renvoyer au client une liste cohérente d'IDs
        const updatedWishList = user.wishList.map(item => 
            typeof item === 'string' ? item : item.toString()
        );
        
        console.log("Updated wishlist:", updatedWishList);
        
        // Renvoyer la wishlist mise à jour
        res.status(200).json({
            message: index !== -1 ? "Listing removed from wishlist" : "Listing added to wishlist",
            wishlist: updatedWishList
        });
        
    } catch (err) {
        console.error("Error toggling wishlist item:", err);
        res.status(500).json({ error: err.message });
    }
};
