import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// Modifiez cette ligne
import { setLogout } from '../../redux/state';
import '../../styles/AdminSidebar.scss';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    // Et modifiez aussi cette ligne pour utiliser setLogout au lieu de logout
    dispatch(setLogout());
    navigate('/login');
  };
  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'Admin' : 'Admin Panel'}</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin" end>
          {collapsed ? '🏠' : 'Dashboard'}
        </NavLink>
        <NavLink to="/admin/users">
          {collapsed ? '👥' : 'Utilisateurs'}
        </NavLink>
        <NavLink to="/admin/properties">
          {collapsed ? '🏘️' : 'Propriétés'}
        </NavLink>
        <NavLink to="/admin/bookings">
          {collapsed ? '📅' : 'Réservations'}
        </NavLink>
        {/* Ajouter un lien pour les messages de contact */}
        <NavLink to="/admin/contact-messages">
          {collapsed ? '✉️' : 'Messages de contact'}
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          {collapsed ? '🚪' : 'Déconnexion'}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
