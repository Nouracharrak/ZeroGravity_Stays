// src/pages/admin/AdminBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDataTable from '../../admin/components/AdminDataTable';
import '../../styles/AdminBookings.scss';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URL.BACK_LINK}/admin/bookings`);
        
        if (response.data.success) {
          setBookings(response.data.data);
        } else {
          throw new Error(response.data.message || 'Erreur lors de la récupération des réservations');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les réservations');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Filtrer les réservations
  const filteredBookings = bookings.filter(booking => {
    const customerName = booking.customerId ? 
      `${booking.customerId.firstName} ${booking.customerId.lastName}`.toLowerCase() : '';
    const listingTitle = booking.listingId ? booking.listingId.title?.toLowerCase() : '';
    
    return customerName.includes(searchTerm.toLowerCase()) || 
           listingTitle.includes(searchTerm.toLowerCase()) ||
           booking.status?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Définition des colonnes
  const columns = [
    { 
      header: 'Réservation #', 
      accessor: '_id',
      render: id => id.substring(id.length - 8)
    },
    { 
      header: 'Client', 
      accessor: 'customerId',
      render: (customer) => (
        customer ? `${customer.firstName} ${customer.lastName}` : 'Client inconnu'
      )
    },
    { 
      header: 'Propriété', 
      accessor: 'listingId',
      render: (listing) => (
        listing ? listing.title : 'Propriété inconnue'
      )
    },
    { 
      header: 'Dates', 
      accessor: 'checkInDate',
      render: (_, booking) => {
        const checkIn = new Date(booking.checkInDate).toLocaleDateString();
        const checkOut = new Date(booking.checkOutDate).toLocaleDateString();
        return `${checkIn} - ${checkOut}`;
      }
    },
    { 
      header: 'Total', 
      accessor: 'totalPrice',
      render: price => `${price}€`
    },
    { 
      header: 'Statut', 
      accessor: 'status',
      render: (status) => (
        <span className={`status-badge ${status}`}>
          {status}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (_, booking) => (
        <div className="action-buttons">
          <button onClick={(e) => {
            e.stopPropagation();
            handleViewBooking(booking._id);
          }}>
            👁️
          </button>
          <button onClick={(e) => {
            e.stopPropagation();
            handleUpdateBookingStatus(booking._id, booking.status === 'confirmed' ? 'pending' : 'confirmed');
          }}>
            {booking.status === 'confirmed' ? '❌' : '✅'}
          </button>
          <button onClick={(e) => {
            e.stopPropagation();
            handleDeleteBooking(booking._id);
          }}>
            🗑️
          </button>
        </div>
      )
    },
  ];
  
  const handleViewBooking = (bookingId) => {
    navigate(`/admin/bookings/${bookingId}`);
  };
  
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await axios.put(`${URL.BACK_LINK}/admin/bookings/${bookingId}`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Impossible de mettre à jour le statut: ' + (err.response?.data?.message || err.message));
    }
  };
  
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${URL.BACK_LINK}/admin/bookings/${bookingId}`);
      
      if (response.data.success) {
        setBookings(bookings.filter(booking => booking._id !== bookingId));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Impossible de supprimer cette réservation: ' + (err.response?.data?.message || err.message));
    }
  };
  
  const handleBookingClick = (booking) => {
    navigate(`/admin/bookings/${booking._id}`);
  };
  
  if (loading) return <div className="loading">Chargement des réservations...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="admin-bookings">
      <div className="page-header">
        <h2>Gestion des Réservations</h2>
      </div>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Rechercher une réservation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <AdminDataTable
        columns={columns}
        data={filteredBookings}
        onRowClick={handleBookingClick}
      />
    </div>
  );
};

export default AdminBookings;
