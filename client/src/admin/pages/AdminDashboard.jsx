// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.scss';
import URL from "../../constants/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    bookings: 0,
    contactMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URL.BACK_LINK}/admin/dashboard`);
        
        // La réponse est structurée avec { success: true, data: {...} }
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          throw new Error(response.data.message || 'Erreur lors de la récupération des statistiques');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les statistiques');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) return <div className="loading">Chargement des statistiques...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="admin-dashboard">
      <h2>Tableau de bord d'administration</h2>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Utilisateurs</h3>
          <div className="stat">{stats.users}</div>
          <span>Utilisateurs inscrits</span>
        </div>
        
        <div className="stat-card">
          <h3>Propriétés</h3>
          <div className="stat">{stats.properties}</div>
          <span>Propriétés listées</span>
        </div>
        
        <div className="stat-card">
          <h3>Réservations</h3>
          <div className="stat">{stats.bookings}</div>
          <span>Réservations totales</span>
        </div>

        <div className="stat-card">
          <h3>Messages</h3>
          <div className="stat">{stats.contactMessages}</div>
          <span>Messages de contact</span>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;