import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';

export default function PaymentsSection({ payments, onAdd, onDelete }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="dropdown-section">
      <div className="dropdown-section-header" onClick={() => setVisible(!visible)}>
        <h3>🔐 Payments</h3>
        <span>{visible ? '▲' : '▼'}</span>
      </div>
      {visible && (
        <div className="section-box">
          <h2>Payment Schedule</h2>
          <div className="header-buttons">
            <button onClick={onAdd}>Add New Payment</button>
          </div>
          {payments.length === 0 ? (
            <p className="no-data">⚠️ No payments found for this project.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Cheque No</th>
                  <th>Cheque Name</th>
                  <th>Date on Cheque</th>
                  <th>Bank</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>£{p.amount}</td>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td>{p.cheque_no}</td>
                    <td>{p.cheque_name}</td>
                    <td>{new Date(p.date_on_cheque).toLocaleDateString()}</td>
                    <td>{p.bank}</td>
                    <td>{p.branch}</td>
                    <td>
                      <button className="small-btn delete" onClick={() => onDelete(p.id)}>
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
