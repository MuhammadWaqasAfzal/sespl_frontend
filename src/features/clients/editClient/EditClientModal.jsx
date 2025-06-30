// src/components/Clients/EditClientModal.js
import React, { useState } from 'react';
import './EditClientModal.css';
import { BASE_URL } from '../../../utils/constants';
import Helper from '../../../utils/hepler';

export default function EditClientModal({ client, onClose, refreshClients }) {
  const [formData, setFormData] = useState({ ...client });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

const handleSubmit = async () => {
  if (!formData.name || !formData.email) {
    setError('Client name and email are required');
    return;
  }

  // ✅ Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError('Please enter a valid email address.');
    return;
  }

  // ✅ Validate contact number (optional: length 7-15 digits)
  const contactRegex = /^[0-9]{7,15}$/;
  if (formData.contact && !contactRegex.test(formData.contact)) {
    setError('Please enter a valid contact number (digits only, 7–15 characters).');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const res = await fetch(`${BASE_URL}/client/update/${client.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update client');

    // On success
    refreshClients();
    onClose();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <h3>Edit Client</h3>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Client Name"
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
        />
        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Contact Number"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <textarea
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          placeholder="Comments"
        />

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Client'}
          </button>
          <button className="cancel-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
