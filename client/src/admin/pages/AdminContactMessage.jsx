// src/pages/admin/AdminContactMessages.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminDataTable from '../../admin/components/AdminDataTable';
import '../../styles/AadminContactMessages.scss';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URL.BACK_LINK}/admin/contact-messages`);
        
        if (response.data.success) {
          setMessages(response.data.data);
        } else {
          throw new Error(response.data.message || 'Erreur lors de la récupération des messages');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les messages de contact');
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);
  
  // Filtrer les messages
  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Définition des colonnes
  const columns = [
    { 
      header: 'Expéditeur', 
      accessor: 'name',
      render: (_, message) => (
        <div>
          <div><strong>{message.name}</strong></div>
          <div>{message.email}</div>
        </div>
      )
    },
    { 
      header: 'Sujet', 
      accessor: 'subject',
      render: (subject) => subject || 'Sans sujet'
    },
    { 
      header: 'Message', 
      accessor: 'message',
      render: (message) => message.length > 100 ? message.substr(0, 100) + '...' : message
    },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    { 
      header: 'Statut', 
      accessor: 'status',
      render: (status) => (
        <span className={`status-badge ${status}`}>
          {status === 'new' ? 'Nouveau' : status === 'read' ? 'Lu' : 'Répondu'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (_, message) => (
        <div className="action-buttons">
          {message.status === 'new' && (
            <button onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(message._id, 'read');
            }}>
              ✓ Marquer comme lu
            </button>
          )}
          {message.status === 'read' && (
            <button onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(message._id, 'replied');
            }}>
              📨 Marquer comme répondu
            </button>
          )}
          {message.status === 'replied' && (
            <button onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(message._id, 'read');
            }}>
              👁️ Marquer comme lu
            </button>
          )}
        </div>
      )
    }
  ];
  
  const handleMarkAsRead = async (messageId, newStatus) => {
    try {
      const response = await axios.put(`${URL.BACK_LINK}/admin/contact-messages/${messageId}/status`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
        setMessages(messages.map(message => 
          message._id === messageId 
            ? { ...message, status: newStatus }
            : message
        ));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Impossible de mettre à jour le statut: ' + (err.response?.data?.message || err.message));
    }
  };
  
  const handleMessageClick = (message) => {
    // Afficher les détails du message
    const newWindow = window.open('', '_blank', 'width=600,height=400');
    newWindow.document.write(`
      <html>
        <head>
          <title>Message de ${message.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h2 { color: #333; }
            .details { margin-bottom: 20px; }
            .label { font-weight: bold; }
            .message-content { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>Message de contact</h2>
          <div class="details">
            <div><span class="label">De:</span> ${message.name} (${message.email})</div>
            <div><span class="label">Date:</span> ${new Date(message.createdAt).toLocaleString()}</div>
            <div><span class="label">Sujet:</span> ${message.subject || 'Sans sujet'}</div>
          </div>
          <div class="label">Message:</div>
          <div class="message-content">${message.message}</div>
        </body>
      </html>
    `);
    
    // Si le message est nouveau, le marquer comme lu
    if (message.status === 'new') {
      handleMarkAsRead(message._id, 'read');
    }
  };
  
  if (loading) return <div className="loading">Chargement des messages...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="admin-contact-messages">
      <div className="page-header">
        <h2>Messages de Contact</h2>
      </div>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Rechercher dans les messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <AdminDataTable
        columns={columns}
        data={filteredMessages}
        onRowClick={handleMessageClick}
      />
    </div>
  );
};

export default AdminContactMessages;

