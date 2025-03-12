const Booking = require('../models/Booking.js');
const User = require('../models/user.js');
const Listing = require('../models/Listing.js');

// Créer une réservation
exports.createBooking = async (req, res) => {
    try {
        const { customerId, hostId, listingId, startDate, endDate, totalPrice } = req.body;

        // Validation des champs requis
        if (!customerId || !hostId || !listingId || !startDate || !endDate || !totalPrice) {
            return res.status(400).json({ message: "Tous les champs sont nécessaires" });
        }

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
            return res.status(404).json({ message: "Utilisateur non trouvé" });
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
            message: "Réservation créée et voyage ajouté avec succès",
            booking: savedBooking,
            user: user
        });

    } catch (err) {
        res.status(500).json({ message: 'Échec de la création de la réservation', error: err.message });
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
        res.status(500).json({ message: 'Échec de la récupération des réservations', error: err.message });
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
            return res.status(404).json({ message: "Réservation non trouvée" });
        }
        
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Échec de la récupération de la réservation', error: err.message });
    }
};

// Mettre à jour une réservation
exports.updateBooking = async (req, res) => {
    try {
        const { customerId, hostId, listingId, startDate, endDate, totalPrice } = req.body;

        // Vérification des dates réservées
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
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Échec de la mise à jour de la réservation', error: err.message });
    }
};

// Supprimer une réservation
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Réservation non trouvée" });
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

        res.status(200).json({ message: "Réservation supprimée avec succès" });
    } catch (err) {
        res.status(500).json({ message: 'Échec de la suppression de la réservation', error: err.message });
    }
};

// / Récupérer les voyages d'un utilisateur
    exports.getUserTrips = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Récupération des voyages pour l'utilisateur:", userId);
        
        // Récupérer toutes les réservations pour cet utilisateur
        const bookings = await Booking.find({ customerId: userId });
        
        if (bookings.length === 0) {
            return res.status(200).json([]); // Retourner un tableau vide si pas de réservations
        }
        
        // Extraire tous les IDs de propriétés des réservations
        const listingIds = bookings.map(booking => booking.listingId);
        
        // Récupérer toutes les propriétés correspondantes
        const listings = await Listing.find({ _id: { $in: listingIds } });
        
        // Créer un Map pour faciliter la recherche des propriétés par ID
        const listingMap = new Map(listings.map(listing => [listing._id.toString(), listing]));
        
        // Fusionner les données
        const mergedData = bookings.map(booking => {
            const listingId = booking.listingId.toString();
            const listing = listingMap.get(listingId);
            
            // Si on ne trouve pas la propriété correspondante
            if (!listing) {
                return {
                    ...booking.toObject(),
                    listingDetails: null // Indiquer que les détails manquent
                };
            }
            
            return {
                ...booking.toObject(),
                listingDetails: listing.toObject() // Mettre les détails dans un sous-objet
            };
        });
        
        res.status(200).json(mergedData); // Utiliser 200 au lieu de 202
    } catch (err) {
        console.error("Erreur lors de la récupération des voyages:", err);
        res.status(500).json({ error: err.message }); // Utiliser 500 au lieu de 404 pour une erreur serveur
    }
};
/* GET RESERVATIONS RECEIVED BY HOST */
exports.getUserReservations = async (req, res) => {
    try {
        const { hostId } = req.params; // Changé de userId à hostId pour correspondre à la route
        
        // Validation du paramètre
        if (!hostId) {
            return res.status(400).json({ message: 'ID hôte manquant' });
        }

        // Recherche des réservations où l'utilisateur est l'hôte
        const reservations = await Booking.find({ hostId: hostId })
            .populate({
                path: "listingId",
                select: "_id city province country category listingPhotosPaths price"
            })
            .populate({
                path: "customerId", 
                select: "_id firstName lastName email"
            });

        console.log(`Réservations trouvées pour l'hôte ${hostId}:`, reservations.length);
        
        res.status(200).json(reservations);
    } catch (err) {
        console.error("Erreur lors de la récupération des réservations:", err);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des réservations', 
            error: err.message 
        });
    }
};

