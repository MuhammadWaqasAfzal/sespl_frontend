import React, { useState } from 'react';
import './PaymentModal.css';
import { BASE_URL } from '../../../../utils/constants';

export default function PaymentModal({ onClose, onSave, projectId }) {
  const [formData, setFormData] = useState({
    amount: '',
    cheque_no: '',
    cheque_name: '',
    date_on_cheque: '',
    bank: '',
    branch: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { amount, cheque_no, cheque_name, date_on_cheque, bank, branch } = formData;

    if (!amount || !cheque_no || !cheque_name || !date_on_cheque || !bank || !branch) {
      setError('All fields are required.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(`${BASE_URL}/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, project_id: projectId,date: today, }),
      });

      const data = await res.json();
      if (res.status === 201 || data.statusCode === 201) {
        onClose();
        onSave();
      } else {
        setError(data.message || 'Failed to add payment.');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('An error occurred while adding payment.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Payment</h2>

        <label>Amount (Rs.):</label>
        <input type="number" name="amount" placeholder="e.g., 500.00" value={formData.amount} onChange={handleChange} />

        <label>Cheque No:</label>
        <input type="text" name="cheque_no" placeholder="Cheque number" value={formData.cheque_no} onChange={handleChange} />

        <label>Cheque Name:</label>
        <input type="text" name="cheque_name" placeholder="Cheque name" value={formData.cheque_name} onChange={handleChange} />

        <label>Date:</label>
        <input type="date" name="date_on_cheque" value={formData.date_on_cheque} onChange={handleChange} />

        <label>Bank:</label>
        <input type="text" name="bank" placeholder="Bank name" value={formData.bank} onChange={handleChange} />

        <label>Branch:</label>
        <input type="text" name="branch" placeholder="Branch name" value={formData.branch} onChange={handleChange} />

        {error && <p className="error-message">{error}</p>}

        <div className="modal-buttons">
          <button className="add-button" onClick={handleSubmit}>Save</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
