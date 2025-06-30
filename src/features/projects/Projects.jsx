import React, { useEffect, useState } from 'react';
import './Projects.css';
import '../../index.css';
import { BASE_URL } from '../../utils/constants';
import AddProjectModal from './AddProjectModal';
import { useNavigate } from 'react-router-dom';
import Helper from '../../utils/hepler';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientMap, setClientMap] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  function refreshClients() {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const map = {};
    clients.forEach(client => {
      map[client.id] = client.name;
    });
    setClientMap(map);
  }

const filteredProjects = projects.filter(project => {
  const name = (project.name || '').toLowerCase();
  const clientName = (clientMap[project.client_id] || '').toLowerCase();
  const unit = (project.unit_name || '').toLowerCase();
  const po = (project.po_number || '').toLowerCase();
  const term = searchTerm.trim().toLowerCase();

  return (
    name.includes(term) ||
    clientName.includes(term) ||
    unit.includes(term) ||
    po.includes(term)
  );
});

const [expenseBreakdown, setExpenseBreakdown] = useState([]);
const [costSummary, setCostSummary] = useState({
  total: 0,
  usedWithTax: 0,
  usedWithoutTax: 0
});

  

  useEffect(() => {
    refreshClients();
    getAllProjects();
  }, []);

  function getAllProjects() {
    fetch(`${BASE_URL}/project/getAll`,{headers})
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); // Handle JSON parse fail
          throw new Error(errorData.message || 'Failed to fetch projects');
        }
        return res.json();
      })
      .then(data => {
        setProjects(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
    });
  }

  if (loading) return <p className="loading">Loading projects...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1 className='heading'>All Projects</h1>
        {Helper.checkPermission('editProjects') && (
          <button className="add-project-button" onClick={() => { refreshClients(); setShowAddModal(true); }}>
            + Add Project
          </button>
        )}
      </div>

        <input
          type="text"
          placeholder="Search by name, client, unit_name or po_number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

      <div className="projects-table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Client</th>
              <th>City</th>
              <th>Unit Name</th>
              <th>Project Manager</th>
              <th>PO Number</th>
              
              {Helper.checkPermission('editProjects') && (<th>Action</th> )}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr key={project.id}
                onClick={(e) => {
                  if (e.target.tagName.toLowerCase() !== 'button') {
                    if( Helper.checkPermission('viewProjectDetail')){
                      navigate('/project-detail', { state: { project },replace: true });
                    }
                  }
                }}
                style={{ cursor: 'pointer' }}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{clientMap[project.client_id] || 'Unknown'}</td>
                <td>{project.city}</td>
                <td>{project.unit_name}</td>
                <td>{project.project_manager_name}</td>
                <td>{project.po_number}</td>
                {Helper.checkPermission('editProjects') && (
                  <td>
                    <button
                      onClick={() => {
                                setDeleteError('');
                                setProjectToDelete(project);
                              }}
                      title="Delete project"
                      className="icon-button delete"
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="8" className="no-data">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {projectToDelete && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete project <strong>{projectToDelete.name}</strong>?</p>
            {deleteError && <p className="error">{deleteError}</p>}
            <div className="modal-actionss">
              <button className="cancel-button"
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError('');
                  try {
                    const res = await fetch(`${BASE_URL}/project/delete/${projectToDelete.id}`, {
                      method: 'DELETE',
                      headers
                    });
                    if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.message || 'Failed to delete project');
                    }
                    setProjectToDelete(null);
                    getAllProjects();
                  } catch (err) {
                    setDeleteError(err.message);
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setProjectToDelete(null)} disabled={deleting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onSubmit={() => getAllProjects()}
          clients={Object.entries(clientMap).map(([id, name]) => ({ id, name }))}
        />
      )}
    </div>
  );
}
