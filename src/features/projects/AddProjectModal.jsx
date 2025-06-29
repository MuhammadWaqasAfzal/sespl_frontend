import React, { useState } from 'react';
import './AddProjectModal.css';
import { BASE_URL } from '../../utils/constants';
import Helper from '../../utils/hepler';

export default function AddProjectModal({ onClose, onSubmit, clients }) {
  const [form, setForm] = useState({
    name: '',
    client_id: '',
    start_date: '',
    city: '',
    country: '',
    unit_name: '',
    project_manager_name: '',
    project_manager_contact: '',
    total_amount_with_out_tax: '',
    total_amount_with_tax: '',
    po_number: '',
    description: '',
  });

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['total_amount_with_out_tax', 'total_amount_with_tax', 'project_manager_contact'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'start_date', 'client_id', 'city', 'country', 'unit_name', 'description'];
    for (let field of requiredFields) {
      if (!form[field]?.toString().trim()) {
        const label = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        setError(`"${label}" is required.`);
        document.querySelector(`[name="${field}"]`)?.focus();
        return false;
      }
    }
    return true;
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'start_date', 'client_id', 'city', 'country', 'unit_name', 'description'];
    return requiredFields.every(field => form[field]?.toString().trim());
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const payload = { ...form, completed: 0 };

    try {
      const response = await fetch(`${BASE_URL}/project/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        onSubmit(data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Project</h2>
        {error && <p className="error">{error}</p>}

        <div className={`form-grid ${loading ? 'disabled' : ''}`}>
          <input type="text" name="name" placeholder="Project Name" value={form.name} onChange={handleChange} disabled={loading} />
          <select name="client_id" value={form.client_id} onChange={handleChange} disabled={loading}>
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} disabled={loading} />
          <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} disabled={loading} />
          <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} disabled={loading} />
          <input type="text" name="unit_name" placeholder="Unit Name" value={form.unit_name} onChange={handleChange} disabled={loading} />
          <input type="text" name="project_manager_name" placeholder="Project Manager" value={form.project_manager_name} onChange={handleChange} disabled={loading} />
          <input type="number" name="project_manager_contact" placeholder="Manager Contact" value={form.project_manager_contact} onChange={handleChange} disabled={loading} />
          <input type="number" name="total_amount_with_out_tax" placeholder="Amount (excl. tax)" value={form.total_amount_with_out_tax} onChange={handleChange} disabled={loading} />
          <input type="number" name="total_amount_with_tax" placeholder="Amount (incl. tax)" value={form.total_amount_with_tax} onChange={handleChange} disabled={loading} />
          <input type="text" name="po_number" placeholder="PO Number" value={form.po_number} onChange={handleChange} disabled={loading} />
          <textarea name="description" placeholder="Project Description" value={form.description} onChange={handleChange} disabled={loading}></textarea>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={loading || !isFormValid()}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button className="cancel-button" onClick={onClose} disabled={loading}>Cancel</button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Creating project...</p>
          </div>
        )}
      </div>
    </div>
  );
}
