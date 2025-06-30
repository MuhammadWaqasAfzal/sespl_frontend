import React, { useEffect, useState } from 'react';
import './Client.css';
import { BASE_URL } from '../../utils/constants';
import AddClientModal from './addClient/AddClientModal';
import EditClientModal from './editClient/EditClientModal';
import Helper from '../../utils/hepler';

export default function Client() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [clientToEdit, setClientToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
  client.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
  client.email.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );


  function fetchClients() {
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/client/getAll`,{headers})
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch clients');
        return res.json();
      })
      .then((data) => {
        localStorage.removeItem('clients');
        localStorage.setItem('clients', JSON.stringify(data.data));
        setClients(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    const id = clientToDelete.id;

    try {
      const res = await fetch(`${BASE_URL}/client/delete/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete client');
      }
      setClientToDelete(null);
      fetchClients(); // Only update UI after confirmation
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="loading">Loading clients...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1 className="heading">All Clients</h1>

        {Helper.checkPermission('editClients') && (
          <button className="add-client-button" onClick={() => setShowAddModal(true)}>
            + Add Client
          </button>
        )}
      </div>

      <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />


      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Comments</th>
              <th>Created At</th>

              {Helper.checkPermission('editClients') && (
                <th>Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No clients found.</td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.contact}</td>
                  <td>{client.address}</td>
                  <td>{client.comments}</td>
                  <td>{formatDate(client.created_at)}</td>
                  
                  {Helper.checkPermission('editClients') && (
                    <td>
                      <button 
                      className="icon-button edit"
                        onClick={() => setClientToEdit(client)}
                      
                        aria-label={`Edit client ${client.name}`}
                        title="Edit client"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {setClientToDelete(client); setDeleteError('');}}
                        className="icon-button delete"
                        aria-label={`Delete client ${client.name}`}
                        title="Delete client"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {clientToDelete && (
        <div className="modal-overlays">
          <div className="modal confirm-modals">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete client{' '}
              <strong>{clientToDelete.name}</strong>?
            </p>
            {deleteError && <p className="error">{deleteError}</p>}
            <div className="modal-actionss">
              <button className="cancel-button" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setClientToDelete(null)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (newClient) => {
            try {
              const res = await fetch(`${BASE_URL}/client/create`, {
                method: 'POST',
                headers,
                body: JSON.stringify(newClient),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message);
              fetchClients();
            } catch (err) {
              alert(err.message);
            }
          }}
        />
      )}

      {clientToEdit && (
        <EditClientModal
          client={clientToEdit}
          onClose={() => setClientToEdit(null)}
          refreshClients={fetchClients}
        />
      )}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date) ? 'Invalid date' : date.toLocaleDateString();
}
