import React, { useState, useEffect } from 'react';
import './AddExpenseModal.css';
import { BASE_URL } from '../../../../utils/constants';

export default function AddExpenseModal({ projectId, onClose, onSave }) {
  const [expenses, setExpenses] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const localExpenses = localStorage.getItem('expenses');
    const localDesignations = localStorage.getItem('designations');
    
    if (localExpenses) {
      try {
        const parsed = JSON.parse(localExpenses);
        setExpenses(parsed);
      } catch (e) {
        console.error('Failed to parse localStorage expenses:', e);
      }
    }

    if (localDesignations) {
      try {
        const parsed = JSON.parse(localDesignations);
        setDesignations(parsed);
      } catch (e) {
        console.error('Failed to parse localStorage designations:', e);
      }
    }
  }, []);

  const selectedExpense = expenses.find(exp => exp.id.toString() === selectedExpenseId);
  const isWagesExpense = selectedExpense?.type?.toLowerCase().includes('wages') ||
                          selectedExpense?.type?.toLowerCase().includes('pays') ||
                          selectedExpense?.type?.toLowerCase().includes('wage')
                          selectedExpense?.type?.toLowerCase().includes('pay') ;

  const handleSubmit = async () => {
    if (!selectedExpenseId || !description || !date || !amount || (isWagesExpense && !selectedDesignation)) {
      setError('All required fields must be filled.');
      return;
    }

    const payload = {
      project_id: projectId,
      expense_id: parseInt(selectedExpenseId),
      description,
      date,
      amount: parseFloat(amount),
      ...(isWagesExpense && { designation_id: parseInt(selectedDesignation)}),
    };

    try {
      const res = await fetch(`${BASE_URL}/projectExpense/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.status === 201 || data.statusCode === 201) {
        onClose();
        onSave();
      } else {
        setError(data.message || 'Failed to add expense.');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('An error occurred while creating the expense.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Expense</h2>

        <label>Expense Type:</label>
        <select
          value={selectedExpenseId}
          onChange={(e) => setSelectedExpenseId(e.target.value)}
        >
          <option value="">-- Select Expense Type --</option>
          {expenses.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.type}
            </option>
          ))}
        </select>

        {isWagesExpense && (
          <>
            <label>Designation:</label>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              >
              <option value="">-- Select Designation --</option>
              {designations.map((des) => (
                <option key={des.id} value={des.id}>
                  {des.title}
                </option>
              ))}
            </select>

          </>
        )}

        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Office supplies"
        />

        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Amount (Rs.):</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 250.75"
        />

        {error && <p className="error-message">{error}</p>}

        <div className="modal-buttons">
          <button className="add-button" onClick={handleSubmit}>Save</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
