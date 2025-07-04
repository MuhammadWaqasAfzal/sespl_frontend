// src/components/Employee/AddEmployeeModal.js
import React, { useState } from 'react';
import './AddEmployeeModal.css';
import { BASE_URL } from '../../../utils/constants';
import Helper from '../../../utils/hepler';
import Loader from '../../../utils/Loader';

const AddEmployeeModal = ({ onClose, onEmployeeAdded, designations, permissions }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnic: '',
    designation_id: '',
    contact: '',
    address: '',
    city: '',
    country: '',
    password: '',
    confirmPassword: '',
    permission_id: '',
  });

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in formData) {
      if (!formData[key]) {
        return setError('All fields are required.');
      }
    }

    if (!validateEmail(formData.email)) {
      return setError('Please enter a valid email address.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    const payload = { ...formData };
    delete payload.confirmPassword;

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/employee/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.statusCode === 201) {
        onEmployeeAdded();
        onClose();
      } else {
        setError(data.message || 'Failed to add employee.');
      }
    } catch {
      setError('An error occurred while adding the employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New Employee</h3>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="employee-form" autoComplete="off">
          <input name="name" placeholder="Name" onChange={handleChange} autoComplete="off" />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} autoComplete="off" />
          <input name="cnic" placeholder="CNIC" onChange={handleChange} autoComplete="off" />

          <select name="designation_id" onChange={handleChange}>
            <option value="">Select Designation</option>
            {designations.map(d => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>

          <input name="contact" type='number' placeholder="Contact" onChange={handleChange} autoComplete="off" />
          <input name="address" placeholder="Address" onChange={handleChange} autoComplete="off" />
          <input name="city" placeholder="City" onChange={handleChange} autoComplete="off" />
          <input name="country" placeholder="Country" onChange={handleChange} autoComplete="off" />

          <select name="permission_id" onChange={handleChange}>
            <option value="">Select Permission</option>
            {permissions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input name="password" type="password" placeholder="Password" onChange={handleChange} autoComplete="new-password" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} autoComplete="new-password" />

          <div className="modal-actionss">
            <button type="submit" className="save-btn" disabled={loading}>Add</button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
        </form>

        {loading && (
          <div className="loading-overlay">
            <Loader />
            <p>Creating employee...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmployeeModal;
