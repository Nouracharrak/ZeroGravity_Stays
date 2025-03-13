// src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import '../../styles/AdminLayout.scss';

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="admin-container">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`admin-content ${collapsed ? 'expanded' : ''}`}>
        <div className="admin-header">
          <button 
            className="toggle-sidebar" 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '>' : '<'}
          </button>
          <h1>Administration</h1>
        </div>
        <div className="admin-page">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
