import React, { useState, useEffect } from 'react';
import './settings.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import AddPermissionModal from './permissions/AddPermissionModal';
import EditPermissionModal from './permissions/EditPermissionModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import { BASE_URL } from '../../utils/constants';
import Helper from '../../utils/hepler'


function Settings() {
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [user, setUser] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [designationVisible, setDesignationVisible] = useState(false);
  const [newDesignation, setNewDesignation] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [expenseVisible, setExpenseVisible] = useState(false);
  const [newExpenseType, setNewExpenseType] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permToEdit,    setPermToEdit]    = useState(null);

  const company_id = Helper.getCompanyId();
      const headers = {
        'Content-Type': 'application/json',
        company_id,
      };

    useEffect(() => {
    const cachedExpenses = localStorage.getItem('expenses');
    if (cachedExpenses) {
      setExpenses(JSON.parse(cachedExpenses));
    }

    fetch(`${BASE_URL}/expense/getAll`,{ headers })
      .then(res => res.json())
      .then(data => {
        setExpenses(data.data);
        localStorage.setItem('expenses', JSON.stringify(data.data));
      })
      .catch(err => console.error('Failed to fetch expenses:', err));
  }, []);

  const handleAddExpense = () => {
  if (!newExpenseType.trim()) {
    alert("Expense type cannot be empty.");
    return;
  }

  fetch(`${BASE_URL}/expense/create`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ type: newExpenseType.trim() }),
  })
    .then(res => res.json())
    .then(data => {
      const updatedExpenses = [...expenses, { id: data.data.id, type: data.data.type }];
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setNewExpenseType('');
    })
    .catch((err) => {
      console.error('Failed to add expense:', err);
      alert('Error occurred while adding expense type.');
    });
};

const handleDeleteExpense = (id) => {
  if (window.confirm("Are you sure you want to delete this expense type?")) {
    fetch(`${BASE_URL}/expense/delete/${id}`, {
      method: 'DELETE',
      headers: headers,
    })
      .then((res) => res.json().then(data => ({ status: res.status, data })))
      .then(({ status,data }) => {
        if (status === 200) {
          const updated = expenses.filter(e => e.id !== id);
          setExpenses(updated);
          localStorage.setItem('expenses', JSON.stringify(updated));
          alert("Expense type deleted successfully.");
        } 
        else if (status === 409) {
           alert(data.message);
        }
        else{
            alert("Failed to delete expense type.");
        }
      })
      .catch((err) => {
        console.error("Failed to delete expense type:", err);
        alert("An error occurred while deleting the expense type.");
      });
  }
};



  useEffect(() => {
  const cached = localStorage.getItem('designations');
  if (cached) {
    setDesignations(JSON.parse(cached));
  }
  fetchDesignations();
  }, []);


  const fetchDesignations = () => {
  fetch(`${BASE_URL}/designation/getAll`,{ headers })
    .then(res => res.json())
    .then(data => {
      if (data.statusCode === 200) {
        setDesignations(data.data);
        localStorage.setItem('designations', JSON.stringify(data.data));
      } else {
        console.error('Failed to fetch designations:', data.message);
      }
    })
    .catch(err => console.error('Failed to fetch designations:', err));
};


const handleAddDesignation = () => {
  if (!newDesignation.trim()) {
    alert("Designation title cannot be empty.");
    return;
  }

  fetch(`${BASE_URL}/designation/create`, {
    method: 'POST',
    headers:headers ,
    body: JSON.stringify({ title: newDesignation.trim() }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode !== 201) {
        alert(data.message || "Failed to add designation.");
        return;
      }

      const newItem = data.data;

      const updatedDesignations = [...designations, newItem];
      setDesignations(updatedDesignations);
      localStorage.setItem('designations', JSON.stringify(updatedDesignations));
      setNewDesignation('');
      alert("Designation added successfully.");
    })
    .catch((err) => {
      console.error('Failed to add designation:', err);
      alert('Error occurred while adding designation.');
    });
};


  const handleDeleteDesignation = (id) => {
      if (window.confirm("Are you sure you want to delete this designation?")) {
        fetch(`${BASE_URL}/designation/delete/${id}`, {
          method: 'DELETE',
          headers:headers,
        })
          .then((res) => res.json().then(data => ({ status: res.status, data })))
          .then(({ status, data }) => {
            if (status === 200) {
              const updated = designations.filter(d => d.id !== id);
              setDesignations(updated);
              localStorage.setItem('designations', JSON.stringify(updated)); // ✅ update localStorage
              alert("Designation deleted successfully.");
            } else {
              alert(data.message);
            }
          })
          .catch((err) => {
            console.error("Failed to delete designation:", err);
            alert("An error occurred while deleting the designation.");
          });
      }
  };


  useEffect(() => {
      const obj = JSON.parse(localStorage.getItem('user') || '');
      setUser(obj);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/permission/getAll`,{ headers })
      .then((res) => res.json())
      .then((data) => setPermissions(data.data))
      .catch((err) => console.error('Failed to fetch permissions:', err));
  }, []);

  const handleAddPermissionClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };



  const refreshPermissions = () => {
  fetch(`${BASE_URL}/permission/getAll`,{ headers })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        setPermissions(data.data);
        localStorage.setItem('permissions', JSON.stringify(data.data));
      } else {
        alert(data.message || 'Failed to refresh permissions');
      }
    })
    .catch((err) => {
      console.error('Failed to refresh permissions:', err);
      alert('Error occurred while refreshing permissions.');
    });
};

  const handleDeletePermissionClick = (permission) => {
    setPermissionToDelete(permission);
    setIsDeleteModalOpen(true);
  };

  const handleDeletePermission = () => {
   
    if (permissionToDelete) {
      fetch(`${BASE_URL}/permission/delete/${permissionToDelete.id}`, {
        method: 'DELETE',
        headers: headers,
      })
        .then((res) => res.json().then(data => ({ status: res.status, data })))
        .then(({ status, data }) => {
          if (status === 200) {
            setPermissions(permissions.filter((perm) => perm.name !== permissionToDelete.name));
            setIsDeleteModalOpen(false);
            alert(`Deleted successfully`);
            refreshPermissions();
          } else if (status === 400 && data.permissions) {
            alert("Bad request");
          } else {
            alert('Failed to delete permission. Please try again.');
          }
        })
        .catch((err) => {
          console.error('Failed to delete permission:', err);
          alert('Error occurred while deleting permission.');
        });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setPermissionToDelete(null);
  };

  return (
    <div className="settings-page">
      <h1 className='heading'>Settings</h1>



      {/* permissions */}

      {Helper.checkPermission('viewPermissions') && (
        <div  className="settings-section">
          <div
            className="settings-section-header"
            onClick={() => setPermissionsVisible(!permissionsVisible)}
          >
            <h3>🔐 Permissions</h3>
            <span>{permissionsVisible ? '▲' : '▼'}</span>
          </div>
          {permissionsVisible && (
            <div className="permissions-content">
              {Helper.checkPermission('editPermissions') && (
                <button className='test' onClick={handleAddPermissionClick}>
                  Add Permission
                </button>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table className="permissions-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Login</th>
                      <th>View Projects</th>
                      <th>Edit Projects</th>

                      <th>View ProjectDetail</th>
                      <th>Edit ProjectDetail</th>

                      <th>View Clients</th>
                      <th>Edit Clients</th>

                      <th>View Employees</th>
                      <th>Edit Employees</th>

                      <th>View Inventory</th>
                      <th>Edit Inventory</th>

                      <th>Settings</th>

                      <th>Edit Payments</th>
                      <th>Edit Expenses</th>
                      <th>Edit Documents</th>

                      <th>View Permissions</th>
                      <th>Edit Permissions</th>

                      <th>View Designations</th>
                      <th>Edit Designations</th>

                      <th>View ExpenseTypes</th>
                      <th>Edit ExpenseTypes</th>

                    
                      {Helper.checkPermission('editPermissions') && (
                       <th>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm, index) => (
                      <tr key={index}>
                        <td>{perm.name}</td>
                        <td>{perm.login ? '✅' : '❌'}</td>
                        <td>{perm.viewProjects ? '✅' : '❌'}</td>
                        <td>{perm.editProjects ? '✅' : '❌'}</td>

                        <td>{perm.viewProjectDetail ? '✅' : '❌'}</td>
                        <td>{perm.editProjectDetail ? '✅' : '❌'}</td>

                        <td>{perm.viewClients ? '✅' : '❌'}</td>
                        <td>{perm.editClients ? '✅' : '❌'}</td>

                        <td>{perm.viewEmployees ? '✅' : '❌'}</td>
                        <td>{perm.editEmployees ? '✅' : '❌'}</td>

                        <td>{perm.viewInventory ? '✅' : '❌'}</td>
                        <td>{perm.editInventory ? '✅' : '❌'}</td>

                        <td>{perm.settings ? '✅' : '❌'}</td>

                        <td>{perm.editPayments ? '✅' : '❌'}</td>
                        <td>{perm.editExpenses ? '✅' : '❌'}</td>
                        <td>{perm.editDocuments ? '✅' : '❌'}</td>

                        <td>{perm.viewPermissions ? '✅' : '❌'}</td>
                        <td>{perm.editPermissions ? '✅' : '❌'}</td>

                        <td>{perm.viewDesignations ? '✅' : '❌'}</td>
                        <td>{perm.editDesignations ? '✅' : '❌'}</td>

                        <td>{perm.viewExpenseTypes ? '✅' : '❌'}</td>
                        <td>{perm.editExpenseTypes ? '✅' : '❌'}</td>
                    
  
                        {Helper.checkPermission('editPermissions') && (
                          <td>
                            <div className="action-buttons">
                              <button
                                className="small-btn edit"
                                onClick={() => {
                                  setPermToEdit(perm);      // ← store row object
                                  setEditModalOpen(true);   // ← open modal
                                }}>
                                    <FaEdit />
                              </button>
                              <button
                                className="small-btn delete"
                                onClick={() => handleDeletePermissionClick(perm)}
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

{/* profile */}
      <div className="settings-section">
        <div
          className="settings-section-header"
          onClick={() => setProfileVisible(!profileVisible)}
        >
          <h3>👤 Profile Information</h3>
          <span>{profileVisible ? '▲' : '▼'}</span>
        </div>


      {profileVisible && user && (
  <div className="profile-content styled-profile">
    <div className="profile-row">
      <span className="label">Full Name:</span>
      <span className="value">{user.name} </span>
    </div>
    <div className="profile-row">
      <span className="label">Designation:</span>
      <span className="value">{user.designation}</span>
    </div>
    <div className="profile-row">
      <span className="label">Email:</span>
      <span className="value">{user.email}</span>
    </div>
    {(user.designation || '').toLowerCase() !== 'company' && (
      <div className="profile-row">
        <span className="label">Contact Number:</span>
        <span className="value">{user.contact}</span>
      </div>
    )}
  </div>
)}
      </div>

{/* designations */}

      {Helper.checkPermission('viewDesignations') && (
        <div className="settings-section">
          <div
            className="settings-section-header"
            onClick={() => setDesignationVisible(!designationVisible)}
          >
            <h3>🏷️ Designations</h3>
            <span>{designationVisible ? '▲' : '▼'}</span>
          </div>
          {designationVisible && (
            <div className="designations-content">

              {Helper.checkPermission('editDesignations') && (
                <div className="designation-form">
                  <input
                    type="text"
                    value={newDesignation}
                    placeholder="Enter new designation"
                    onChange={(e) => setNewDesignation(e.target.value)}
                  />
                  <button  onClick={handleAddDesignation}>
                    Add Designation
                  </button>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="designations-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>

                      {Helper.checkPermission('editDesignations') && (
                        <th>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {designations.map((desig) => (
                      <tr key={desig.id}>
                        <td>{desig.id}</td>
                        <td>{desig.title}</td>

                        {Helper.checkPermission('editDesignations') && (
                          <td>
                            <div className="action-buttons">
                              {/* <button className="small-btn edit">
                                <FaEdit />
                              </button> */}
                              <button className="small-btn delete"  onClick={() => handleDeleteDesignation(desig.id)} >
                                <FaTrashAlt />
                              </button>
                            </div>
                        </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* expenseTypes */}
      {Helper.checkPermission('viewExpenseTypes') && (
        <div className="settings-section">
          <div
            className="settings-section-header"
            onClick={() => setExpenseVisible(!expenseVisible)}
          >
            <h3>💸 Expense Types</h3>
            <span>{expenseVisible ? '▲' : '▼'}</span>
          </div>
          {expenseVisible && (
            <div className="designations-content">
              {Helper.checkPermission('editExpenseTypes') && (
                <div className="designation-form">
                  <input
                    type="text"
                    value={newExpenseType}
                    placeholder="Enter new expense type"
                    onChange={(e) => setNewExpenseType(e.target.value)}
                  />
                  <button  onClick={handleAddExpense}>
                    Add Expense Type
                  </button>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="designations-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>

                      {Helper.checkPermission('editExpenseTypes') && (
                        <th>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>{exp.id}</td>
                        <td>{exp.type}</td>

                        {Helper.checkPermission('editExpenseTypes') && (
                          <td>
                            <div className="action-buttons">
                              <button
                                className="small-btn delete"
                                onClick={() => handleDeleteExpense(exp.id)}
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}


     

      <AddPermissionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={refreshPermissions}
      />

      <EditPermissionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        permission={permToEdit}
        onUpdated={refreshPermissions}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeletePermission}
        permissionName={permissionToDelete ? permissionToDelete.name : ''}
      />
    </div>
  );
}

export default Settings;
