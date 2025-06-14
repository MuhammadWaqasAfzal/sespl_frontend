import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';

export default function ExpensesSection({ expenses, expenseTypes, designations, onAdd, onDelete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="dropdown-section">
      <div className="dropdown-section-header" onClick={() => setVisible(!visible)}>
        <h3>🔐 Expenses</h3>
        <span>{visible ? '▲' : '▼'}</span>
      </div>
      {visible && (
        <div className="section-box">
          <h2>Project Expenses</h2>
          <div className="header-buttons">
            <button onClick={onAdd}>Add New Expense</button>
          </div>
          {expenses.length === 0 ? (
            <p className="no-data">⚠️ No expenses found for this project.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Designation</th>
                  <th>Date</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={exp.id}>
                    <td>{index + 1}</td>
                    <td>£{parseFloat(exp.amount).toFixed(2)}</td>
                    <td>{exp.description}</td>
                    <td>{expenseTypes.find(type => type.id === exp.expense_id)?.type || 'Unknown'}</td>
                    <td>{designations.find(type => type.id === exp.designation_id)?.title || 'N/A'}</td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>{new Date(exp.created_at).toLocaleString()}</td>
                    <td>{new Date(exp.updated_at).toLocaleString()}</td>
                    <td>
                      <button className="small-btn delete" onClick={() => onDelete(exp.id)}>
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
