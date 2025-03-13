// middleware/admin.js
const User = require('../models/user');

const adminAuth = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est connecté (middleware 'auth' devrait être appelé avant)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé: veuillez vous connecter' 
      });
    }
    
    // Vérifier si l'utilisateur est un admin - soit par isAdmin soit par role
    // Dépendant de votre modèle User
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé: privilèges administrateur requis' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

module.exports = adminAuth;
