const Booking = require('../models/Booking.js');
const User = require('../models/user.js');

// Créer une réservation
exports.createBooking = async (req, res) => {
    try {
        const { customerId, hostId, listingId, startDate, endDate, totalPrice } = req.body;

        // Vérifier si les dates sont déjà réservées
        const existingBooking = await Booking.findOne({
            listingId,
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
                { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Les dates sont déjà réservées" });
        }

        // Créer la réservation
        const newBooking = new Booking({
            customerId,
            hostId,
            listingId,
            startDate,
            endDate,
            totalPrice
        });

        // Sauvegarder la réservation dans la base de données
        const savedBooking = await newBooking.save();

        // Récupérer l'utilisateur par son ID pour ajouter le voyage à la liste
        const user = await User.findById(customerId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ajouter la réservation au tripList de l'utilisateur
        const newTrip = {
            listingId,
            startDate,
            endDate,
            totalPrice
        };

        // Ajouter le voyage à la liste de l'utilisateur
        user.tripList.push(newTrip);

        // Ajouter l'ID de la réservation à la liste de réservations de l'utilisateur
        user.reservationList.push(savedBooking._id);

        // Sauvegarder l'utilisateur avec les listes mises à jour
        await user.save();

        // Répondre avec la réservation et l'utilisateur mis à jour
        res.status(201).json({
            message: "Booking created and trip added successfully",
            booking: savedBooking,
            user: user
        });

    } catch (err) {
        res.status(400).json({ message: 'Failed to create a new booking', error: err.message });
    }
};

// Récupérer toutes les réservations
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customerId', '_id name email')
            .populate('hostId', '_id name email')
            .populate('listingId', '_id title');
        
        res.status(200).json(bookings);
    } catch (err) {
        res.status(400).json({ message: 'Failed to retrieve bookings', error: err.message });
    }
};

// Récupérer une réservation par son ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customerId', '_id name email')
            .populate('hostId', '_id name email')
            .populate('listingId', '_id title');
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        
        res.status(200).json(booking);
    } catch (err) {
        res.status(400).json({ message: 'Failed to retrieve booking', error: err.message });
    }
};

// Mettre à jour une réservation
exports.updateBooking = async (req, res) => {
    try {
        const { customerId, hostId, listingId, startDate, endDate, totalPrice } = req.body;

        // Vérifier si les dates sont déjà réservées
        const existingBooking = await Booking.findOne({
            listingId,
            _id: { $ne: req.params.id },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
                { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
                { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Les dates sont déjà réservées" });
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, {
            customerId,
            hostId,
            listingId,
            startDate,
            endDate,
            totalPrice
        }, { new: true });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update booking', error: err.message });
    }
};

// Supprimer une réservation
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Récupérer l'utilisateur pour supprimer le voyage de la liste
        const user = await User.findById(booking.customerId);
        if (user) {
            // Supprimer le voyage de la liste de l'utilisateur
            user.tripList = user.tripList.filter(trip => trip.listingId.toString() !== booking.listingId.toString());

            // Supprimer l'ID de la réservation de la liste de réservations de l'utilisateur
            user.reservationList = user.reservationList.filter(rid => rid.toString() !== booking._id.toString());

            // Sauvegarder l'utilisateur avec les listes mises à jour
            await user.save();
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: 'Failed to delete booking', error: err.message });
    }
};
