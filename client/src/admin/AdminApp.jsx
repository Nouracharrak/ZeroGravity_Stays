// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../admin/components/AdminLayout';
import AdminDashboard from '../admin/pages/AdminDashboard';
import AdminUsers from '../admin/pages/AdminUsers';
import AdminListings from '../admin/pages/AdminListings';
import AdminBookings from '../admin/pages/AdminBookings';
import ContactMessages from '../admin/pages/AdminContactMessage';

const AdminRoutes = () => {
  const user = useSelector(state => state.auth?.user);
  
  // Rediriger si l'utilisateur n'est pas admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/listings" element={<AdminListings />} />
        <Route path="/bookings" element={<AdminBookings />} />
        <Route path="/contactMessages" element={<ContactMessages />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;

