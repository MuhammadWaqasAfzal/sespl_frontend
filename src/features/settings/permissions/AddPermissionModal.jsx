import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../utils/constants';
import './AddPermissionModal.css';
import Helper from '../../../utils/hepler';
import Loader from '../../../utils/Loader'; 

const DEFAULT_PERM = {
  name: '',
  login: true,
  viewProjects: true,
  editProjects: true,
  viewProjectDetail: true,
  editProjectDetail: true,
  viewClients: true,
  editClients: true,
  viewEmployees: true,
  editEmployees: true,
  viewInventory: true,
  editInventory: true,
  settings: true,
  editPayments: true,
  editExpenses: true,
  editDocuments: true,
  viewPermissions: true,
  editPermissions: true,
  viewDesignations: true,
  editDesignations: true,
  viewExpenseTypes: true,
  editExpenseTypes: true,
};

export default function AddPermissionModal({ isOpen, onClose, onSave }) {
  const [perm, setPerm] = useState(DEFAULT_PERM);
  const [err, setErr] = useState('');
  const [isSaving, setIsSaving] = useState(false); // ✅ loader state

  useEffect(() => {
    if (isOpen) {
      setPerm(DEFAULT_PERM);
      setErr('');
    }
  }, [isOpen]);

  const toggle = (e) =>
    setPerm((p) => ({ ...p, [e.target.name]: !p[e.target.name] }));

  const setName = (e) =>
    setPerm((p) => ({ ...p, name: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!perm.name.trim()) return setErr('Permission name is required');

    setIsSaving(true); // ✅ show loader
    try {
      const res = await fetch(`${BASE_URL}/permission/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'company_id': Helper.getCompanyId(),
        },
        body: JSON.stringify(perm),
      });

      const data = await res.json();

      if (res.status === 201) {
        onSave();
        onClose();
      } else {
        setErr(data.message || 'Failed to create permission.');
      }
    } catch (ex) {
      console.error(ex);
      setErr('Network error. Please try again.');
    } finally {
      setIsSaving(false); // ✅ hide loader
    }
  };

  if (!isOpen) return null;

  const label = (key) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Permission</h2>

        {err && <div className="apm-error">{err}</div>}

        {isSaving ? (
          <div className="loader-wrapper">
            <Loader />
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="apm-input">
              <input
                type="text"
                placeholder="Permission Name"
                value={perm.name}
                onChange={setName}
              />
            </div>

            <div className="apm-grid">
              {Object.keys(perm)
                .filter((k) => k !== 'name')
                .map((key) => (
                  <label key={key} className="apm-checkbox">
                    <input
                      type="checkbox"
                      name={key}
                      checked={perm[key]}
                      onChange={toggle}
                    />
                    <span className="check" />
                    {label(key)}
                  </label>
                ))}
            </div>

            <div className="apm-actions">
              <button
                type="button"
                className="apm-btn cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="apm-btn save">
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
