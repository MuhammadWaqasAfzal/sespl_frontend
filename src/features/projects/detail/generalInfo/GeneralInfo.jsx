import React, { useState } from 'react';
import Helper  from '../../../../utils/hepler'
export default function GeneralInfo({ project, onEdit }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="dropdown-section">
      <div
        className="dropdown-section-header"
        onClick={() => setVisible(!visible)}>
        <h3>🔐 General Info</h3>
        <span>{visible ? '▲' : '▼'}</span>
      </div>
      {visible && (
        <div className="section-box">
          {Helper.checkPermission('editProjectDetail') && (
            <div className="header-buttons">
              <button className="-button" onClick={onEdit}>✏️ Edit Project</button>
            </div>
          )}
          <h2>{project.name}</h2>
          <div className="project-info-grid">
            <div><strong>ID</strong> <span>{project.id}</span></div>
            <div><strong>Client ID</strong> <span>{project.client_id}</span></div>
            <div><strong>Start Date</strong> <span>{new Date(project.start_date).toLocaleDateString()}</span></div>
            <div><strong>End Date</strong> <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span></div>
            <div><strong>City</strong> <span>{project.city}</span></div>
            <div><strong>Country</strong> <span>{project.country}</span></div>
            <div><strong>Unit Name</strong> <span>{project.unit_name}</span></div>
            <div><strong>Project Manager</strong> <span>{project.project_manager_name}</span></div>
            <div><strong>Manager Contact</strong> <span>{project.project_manager_contact}</span></div>
            <div><strong>Amount (excl. tax)</strong><span> Rs {project.total_amount_with_out_tax}</span></div>
            <div><strong>Amount (incl. tax)</strong><span> Rs {project.total_amount_with_tax}</span></div>
            <div><strong>PO Number</strong> <span>{project.po_number}</span></div>
            <div><strong>Completed</strong> <span>{project.completed ? 'Yes' : 'No'}</span></div>
            <div className="full-width"><strong>Description:</strong> {project.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}