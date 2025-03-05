import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Payments from './pages/Payments';
import Messages from './pages/Messages';

const AdminApp = () => {
  // Vérification simple d'authentification admin (à remplacer par votre logique)
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  if (!isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="listings" element={<Listings />} />
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
