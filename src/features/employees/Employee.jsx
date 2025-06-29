// Employee.jsx
import React, { useEffect, useState } from 'react';
import './Employee.css';
import { BASE_URL } from '../../utils/constants';
import AddEmployeeModal from './addEmployees/AddEmployeeModal';
import EditEmployeeModal from './editEmployees/editEmployee';
import Helper from '../../utils/hepler';    
import'../../index.css'

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [designations, setDesignations] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
    
  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  useEffect(() => {
   getAllEmployees();
   getDesignations();
   getPermissions();
  }, []);

  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setShowEditModal(true);
  };

  function getDesignations(){
    const storedDesignations = localStorage.getItem('designations');
    if (storedDesignations) {
      setDesignations(JSON.parse(storedDesignations));
    }
  }
  // Get designation title from designation_id
  const getDesignationTitle = (id) => {
    const found = designations.find((d) => d.id === id);
    return found ? found.title : `ID: ${id}`;
  };

  function getPermissions(){
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
    }
  }

  function getAllEmployees(){
 fetch(`${BASE_URL}/employee/getAll`,{headers})
      .then((res) => res.json())
      .then((data) => {
      
        if (data.statusCode === 200) {
          setEmployees(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch employees:', err));
  }

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    fetch(`${BASE_URL}/employee/delete/${id}`, {
      method: 'DELETE',headers
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        } else {
          alert(data.message);
        }
      })
      .catch((err) => {
        console.error('Failed to delete employee:', err);
        alert('Error occurred while deleting employee.');
      });
  };

  

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="employee-container">
      <div className="employee-header">
       <h2 className="heading">Employees</h2>
        {Helper.checkPermission('editEmployees') && (
        <button className="add-btn" 
                onClick={() => setShowAddModal(true)}
                >
          + Add New Employee
        </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>CNIC</th>
              <th>Designation ID</th>
              <th>Contact</th>
              <th>Address</th>
              <th>City</th>
              <th>Country</th>
              {Helper.checkPermission('editEmployees') && ( <th>Actions</th>)}
            </tr>
          </thead>
          
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                  <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.cnic}</td>
                <td>{getDesignationTitle(emp.designation_id)}</td>
                <td>{emp.contact}</td>
                <td>{emp.address}</td>
                <td>{emp.city}</td>
                <td>{emp.country}</td>
                {Helper.checkPermission('editEmployees') && (
                <td>
                
                  <button 
                    className="icon-button edit"
                    
                      onClick={() => handleEdit(emp)}
                      aria-label={`Edit client ${emp.name}`}
                      title="Edit client"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="icon-button delete"
                      aria-label={`Delete client ${emp.name}`}
                      title="Delete client"
                    >
                      🗑️
                    </button>
                    
                </td>
                )}
              </tr>
            ))}
              {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="10" className="no-data">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
  <AddEmployeeModal
    onClose={() => setShowAddModal(false)}
    designations={designations}
    permissions={permissions}
    onEmployeeAdded={() => {
      getAllEmployees();
      setShowAddModal(false);
    }}
  />
)}

{showEditModal && selectedEmployee && (
  <EditEmployeeModal
    onClose={() => setShowEditModal(false)}
    onEmployeeUpdated={getAllEmployees}
    designations={designations}
    permissions={permissions}
    employee={selectedEmployee}
  />
)}

    </div>
  );
};

export default Employee;
