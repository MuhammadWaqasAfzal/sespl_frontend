// src/components/Employee/EditEmployeeModal.js
import React, { useState } from 'react';
import './editEmployee.css'; // Reuse the same styling
import { BASE_URL } from '../../../utils/constants';
import Helper from '../../../utils/hepler';

const EditEmployeeModal = ({ onClose, onEmployeeUpdated, designations, permissions, employee }) => {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    cnic: employee.cnic,
    designation_id: employee.designation_id,
    contact: employee.contact,
    address: employee.address,
    city: employee.city,
    country: employee.country,
    permission_id: employee.permission_id,
  });

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };


  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const key in formData) {
      if (!formData[key]) {
        return setError('All fields are required.');
      }
    }

    if (!validateEmail(formData.email)) {
      return setError('Please enter a valid email address.');
    }

    fetch(`${BASE_URL}/employee/update/${employee.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          onEmployeeUpdated();
          onClose();
        } else {
          setError(data.message || 'Failed to update employee.');
        }
      })
      .catch(() => {
        setError('An error occurred while updating the employee.');
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Employee</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="employee-form" autoComplete="off">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          <input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="CNIC" />

          <select name="designation_id" value={formData.designation_id} onChange={handleChange}>
            <option value="">Select Designation</option>
            {designations.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>

          <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
          <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />

          <select name="permission_id" value={formData.permission_id} onChange={handleChange}>
            <option value="">Select Permission</option>
            {permissions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="modal-actions">
            <button type="submit" className="save-btn">Update</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
