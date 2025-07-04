import React, { useState } from 'react';
import './PaymentModal.css';
import { BASE_URL } from '../../../../utils/constants';
import Helper from '../../../../utils/hepler';
import Loader from '../../../../utils/Loader';  // adjust path if needed

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
  const [loading, setLoading] = useState(false);

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

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

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch(`${BASE_URL}/payment/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...formData, project_id: projectId, date: today }),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Payment</h2>

        {loading && <Loader />}

        <label>Amount (Rs.):</label>
        <input type="number" name="amount" placeholder="e.g., 500.00" value={formData.amount} onChange={handleChange} 
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) {
              e.preventDefault();
            }
          }} />

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
          <button className="add-button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button className="cancel-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
