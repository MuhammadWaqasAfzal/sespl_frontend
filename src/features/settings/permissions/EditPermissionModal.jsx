import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../../utils/constants';          // adjust path!
import '../permissions/AddPermissionModal.css';               // re-use styles

const FLAG_KEYS = [
  'login',
  'viewProjects',      'editProjects',
  'viewProjectDetail', 'editProjectDetail',
  'viewClients',       'editClients',
  'viewEmployees',     'editEmployees',
  'viewInventory',     'editInventory',
  'settings',
  'editPayments', 'editExpenses', 'editDocuments',
  'viewPermissions',   'editPermissions',
  'viewDesignations',  'editDesignations',
  'viewExpenseTypes',  'editExpenseTypes',
];

export default function EditPermissionModal({ isOpen, onClose, permission, onUpdated }) {
  const [perm, setPerm]   = useState(permission);
  const [err,  setErr]    = useState('');



  /* whenever modal opens or permission prop changes, sync local state */
  useEffect(() => {
    if (isOpen) {
      setPerm(permission);
      setErr('');
    }
  }, [isOpen, permission]);

  /* toggle a flag */
  const toggle = (e) =>
    setPerm((p) => ({ ...p, [e.target.name]: !p[e.target.name] }));

  /* change name */
  const setName = (e) =>
    setPerm((p) => ({ ...p, name: e.target.value }));

  /* PUT / update */
  const submit = async (e) => {
    e.preventDefault();
    if (!perm.name.trim()) return setErr('Permission name is required.');

    //const { "created_at","updated_at":_omit, ...result } = perm;
    const { created_at, updated_at, ...result } = perm;
    try {
      const res  = await fetch(`${BASE_URL}/permission/update/${perm.id}`, {
        method : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(result),
      });
      const data = await res.json();

      if (res.status === 200) {
        onUpdated();     // parent refetch or mutate list
        onClose();
      } else if (res.status === 409) {
        setErr('Name already exists.');
      } else {
        setErr(data.message || 'Update failed.');
      }
    } catch (ex) {
      console.error(ex);
      setErr('Network error, please try again.');
    }
  };

  if (!isOpen || !perm) return null;

  const label = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Permission – {permission.name}</h2>

        {err && <div className="apm-error">{err}</div>}

        <form onSubmit={submit}>
          <div className="apm-input">
            <input
              type="text"
              value={perm.name}
              onChange={setName}
              placeholder="Permission Name"
            />
          </div>

          <div className="apm-grid">
            {FLAG_KEYS.map((key) => (
              <label key={key} className="apm-checkbox">
                <input
                  type="checkbox"
                  name={key}
                  checked={!!perm[key]}
                  onChange={toggle}
                />
                <span className="check" />
                {label(key)}
              </label>
            ))}
          </div>

          <div className="apm-actions">
            <button type="button" className="apm-btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="apm-btn save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
