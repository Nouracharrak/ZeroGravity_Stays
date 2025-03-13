// src/pages/admin/AdminListings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDataTable from '../../admin/components/AdminDataTable';
import '../../styles/AdminListings.scss';
import URL from '../../constants/api';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URL.BACK_LINK}/admin/properties`);
        
        if (response.data.success) {
          setProperties(response.data.data);
        } else {
          throw new Error(response.data.message || 'Erreur lors de la récupération des propriétés');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les propriétés');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);
  
  // Filtrer les propriétés
  const filteredProperties = properties.filter(property => 
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Définition des colonnes pour le tableau
  const columns = [
    { 
      header: 'Propriété', 
      accessor: 'title',
      render: (_, property) => (
        <div className="property-cell">
          <img 
            src={property.images?.[0] || '/default-property.jpg'} 
            alt={property.title} 
          />
          <div>
            <span className="title">{property.title}</span>
            <span className="location">{property.city}, {property.country}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Propriétaire', 
      accessor: 'creator',
      render: (creator) => (
        creator ? <span>{creator.firstName} {creator.lastName}</span> : <span>Inconnu</span>
      )
    },
    { 
      header: 'Prix', 
      accessor: 'price',
      render: (price) => `${price}€ / nuit`
    },
    { 
      header: 'Statut', 
      accessor: 'status',
      render: (status) => (
        <span className={`status-badge ${status || 'active'}`}>
          {status || 'active'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (_, property) => (
        <div className="action-buttons">
          <button onClick={(e) => {
            e.stopPropagation();
            handleEditProperty(property._id);
          }}>
            ✏️
          </button>
          <button onClick={(e) => {
            e.stopPropagation();
            handleDeleteProperty(property._id);
          }}>
            🗑️
          </button>
        </div>
      )
    },
  ];
  
  const handleEditProperty = (propertyId) => {
    navigate(`/admin/properties/edit/${propertyId}`);
  };
  
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${URL.BACK_LINK}/admin/properties/${propertyId}`);
      
      if (response.data.success) {
        setProperties(properties.filter(property => property._id !== propertyId));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Impossible de supprimer cette propriété: ' + (err.response?.data?.message || err.message));
    }
  };
  
  const handlePropertyClick = (property) => {
    navigate(`/admin/properties/${property._id}`);
  };
  
  if (loading) return <div className="loading">Chargement des propriétés...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="admin-properties">
      <div className="page-header">
        <h2>Gestion des Propriétés</h2>
        <button onClick={() => navigate('/admin/properties/new')}>
          + Ajouter
        </button>
      </div>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Rechercher une propriété..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <AdminDataTable
        columns={columns}
        data={filteredProperties}
        onRowClick={handlePropertyClick}
      />
    </div>
  );
};

export default AdminProperties;
