// src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDataTable from '../../admin/components/AdminDataTable';
import '../../styles/AdminUsers.scss';
import URL from '../../constants/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${URL.BACK_LINK}/admin/users`);
          
          if (response.data.success) {
            setUsers(response.data.data);
          } else {
            throw new Error(response.data.message || 'Erreur lors de la récupération des utilisateurs');
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Erreur:', err);
          setError('Impossible de charger les utilisateurs');
          setLoading(false);
        }
      };
      
      fetchUsers();
    }, []);
    
    const handleEditUser = (userId) => {
      navigate(`/admin/users/edit/${userId}`);
    };
    
    const handleDeleteUser = async (userId) => {
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
      }
      
      try {
        const response = await axios.delete(`${URL.BACK_LINK}/admin/users/${userId}`);
        
        if (response.data.success) {
          setUsers(users.filter(user => user._id !== userId));
        } else {
          throw new Error(response.data.message);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Impossible de supprimer cet utilisateur: ' + (err.response?.data?.message || err.message));
      }
    };
    
    const handleUserClick = (user) => {
      navigate(`/admin/users/${user._id}`);
    };
    
    // Filtrer les utilisateurs par le terme de recherche
    const filteredUsers = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    // Définition des colonnes pour le tableau
    const columns = [
      { 
        header: 'Utilisateur', 
        accessor: 'name',
        render: (_, user) => (
          <div className="user-cell">
            <img 
              src={user.profilePic || '/default-avatar.png'} 
              alt={`${user.firstName} ${user.lastName}`} 
            />
            <div>
              <span className="name">{user.firstName} {user.lastName}</span>
              <span className="email">{user.email}</span>
            </div>
          </div>
        )
      },
      { header: 'Rôle', accessor: 'role' },
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
        header: 'Date d\'inscription', 
        accessor: 'createdAt',
        render: (date) => new Date(date).toLocaleDateString()
      },
      { 
        header: 'Actions', 
        accessor: 'actions',
        render: (_, user) => (
          <div className="action-buttons">
            <button onClick={(e) => {
              e.stopPropagation();
              handleEditUser(user._id);
            }}>
              ✏️
            </button>
            <button onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(user._id);
            }}>
              🗑️
            </button>
          </div>
        )
      },
    ];
    
    if (loading) return <div className="loading">Chargement des utilisateurs...</div>;
    if (error) return <div className="error">{error}</div>;
    
    return (
      <div className="admin-users">
        <div className="page-header">
          <h2>Gestion des Utilisateurs</h2>
          <button onClick={() => navigate('/admin/users/new')}>
            + Ajouter
          </button>
        </div>
        
        <div className="controls">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <AdminDataTable
          columns={columns}
          data={filteredUsers}
          onRowClick={handleUserClick}
        />
      </div>
    );
  };
  
  export default AdminUsers;

