import React from 'react';
import './ConfirmDeleteModal.css'; // Create a CSS file for styling the modal

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, permissionName }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-delete-modal">
      <div className="modal-content">
        <h3>Are you sure you want to delete the permission: {permissionName}?</h3>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
