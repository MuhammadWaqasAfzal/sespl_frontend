// src/components/Clients/AddClientModal.js
import React, { useState } from 'react';
import './AddClientModal.css';
import Helper from '../../../utils/hepler';


export default function AddClientModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
     email: '',
      contact: '',
    address: '',
    city: '',
    comments: ''
  });

  const [error, setError] = useState('');

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email } = formData;
    if (!name || !email) {
      setError('Company name and email are required.');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <h3 className='heading'>Add New Client</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            name="name"
            placeholder="Client Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="number"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="comments"
            placeholder="Comments"
            value={formData.comments}
            onChange={handleChange}
          ></textarea>
          <div className="modal-actionss">
           
           
             <button className='add' type="submit">Add Client</button>
              <button className = "cancel-button" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
