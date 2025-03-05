const User = require('../models/user');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const ContactUs = require('../models/ContactUs');

// Gestion des utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Ne pas inclure le champ mot de passe
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs.', error: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l’utilisateur.', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Erreur lors de la création de l’utilisateur.', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        }
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Erreur lors de la mise à jour de l’utilisateur.', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        }
        res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l’utilisateur.', error: error.message });
    }
};

// Gestion des réservations
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('customerId hostId listingId');
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des réservations.', error: error.message });
    }
};

exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('customerId hostId listingId');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Réservation non trouvée.' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la réservation.', error: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Réservation non trouvée.' });
        }
        res.status(200).json({ success: true, data: updatedBooking });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Erreur lors de la mise à jour de la réservation.', error: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ success: false, message: 'Réservation non trouvée.' });
        }
        res.status(200).json({ success: true, message: 'Réservation supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la réservation.', error: error.message });
    }
};

// Gestion des annonces
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Listing.find().populate('creator');
        res.status(200).json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des propriétés.', error: error.message });
    }
};

exports.getProperty = async (req, res) => {
    try {
        const property = await Listing.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Propriété non trouvée.' });
        }
        res.status(200).json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la propriété.', error: error.message });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const newProperty = new Listing(req.body);
        await newProperty.save();
        res.status(201).json({ success: true, data: newProperty });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Erreur lors de la création de la propriété.', error: error.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const updatedProperty = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProperty) {
            return res.status(404).json({ success: false, message: 'Propriété non trouvée.' });
        }
        res.status(200).json({ success: true, data: updatedProperty });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Erreur lors de la mise à jour de la propriété.', error: error.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const deletedProperty = await Listing.findByIdAndDelete(req.params.id);
        if (!deletedProperty) {
            return res.status(404).json({ success: false, message: 'Propriété non trouvée.' });
        }
        res.status(200).json({ success: true, message: 'Propriété supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la propriété.', error: error.message });
    }
};

// Gestion des messages de contact
exports.getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactUs.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des messages de contact.', error: error.message });
    }
};

exports.updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['new', 'read', 'replied'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Statut invalide' });
        }

        const updatedMessage = await ContactUs.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedMessage) {
            return res.status(404).json({ success: false, message: 'Message non trouvé.' });
        }

        res.status(200).json({ success: true, data: updatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du message de contact.', error: error.message });
    }
};
