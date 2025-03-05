import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar,
  Typography, Box
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Home as ListingsIcon,
  BookOnline as BookingsIcon,
  Payment as PaymentsIcon,
  Message as MessagesIcon,
} from '@mui/icons-material';

const AdminNav = () => {
  const location = useLocation();

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Utilisateurs', icon: <UsersIcon />, path: '/admin/users' },
    { text: 'Annonces', icon: <ListingsIcon />, path: '/admin/listings' },
    { text: 'Réservations', icon: <BookingsIcon />, path: '/admin/bookings' },
    { text: 'Paiements', icon: <PaymentsIcon />, path: '/admin/payments' },
    { text: 'Messages', icon: <MessagesIcon />, path: '/admin/messages' },
  ];

  return (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default AdminNav;
