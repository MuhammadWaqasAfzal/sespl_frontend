
import React, { useState, useEffect } from 'react';
import './AddPermissionModal.css';

function AddPermissionModal({ isOpen, onClose, onSave }) {
  const defaultPermissionData = {
    name: '',
    read_employees: false,
    create_employees: false,
    update_employees: false,
    delete_employees: false,
    read_sites: false,
    create_sites: false,
    update_sites: false,
    delete_sites: false,
    read_shifts: false,
    create_shifts: false,
    update_shifts: false,
    delete_shifts: false,
    assign_shifts: false,
    checkin_shifts: false,
    checkout_shifts: false,
    accounts: false,
  };

  const [permissionData, setPermissionData] = useState(defaultPermissionData);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPermissionData(defaultPermissionData);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name } = e.target;
    setPermissionData((prevData) => ({
      ...prevData,
      [name]: !prevData[name],
    }));
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setPermissionData((prevData) => ({
      ...prevData,
      name: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!permissionData.name) {
      setErrorMessage('Permission name is required!');
      return;
    }

    fetch('http://localhost:5000/api/permission/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permissionData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === 'Permission set created successfully.') {
          onSave();
          onClose();
        } else {
          setErrorMessage(data.message || 'Failed to create permission.');
        }
      })
      .catch((err) => {
        console.error('Error creating permission:', err);
        setErrorMessage('An error occurred while creating permission.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Permission</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="form-group">
          <label>Permission Name</label>
          <input
            type="text"
            name="name"
            placeholder="Permission Name"
            value={permissionData.name}
            onChange={handleNameChange}
            aria-label="Permission Name"
          />
        </div>

        <div className="permission-list">
          {Object.keys(permissionData).map(
            (key) =>
              key !== 'name' && (
                <div key={key} className="checkbox-group">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      name={key}
                      checked={permissionData[key]}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                </div>
              )
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddPermissionModal;
