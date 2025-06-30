import React, { useEffect, useState } from 'react';
import './Inventory.css';
import { BASE_URL } from '../../utils/constants';
import Helper from '../../utils/hepler';
import Loader from '../../utils/Loader';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const company_id = Helper.getCompanyId();
  const headers = {
    'Content-Type': 'application/json',
    company_id,
  };

  useEffect(() => {
    getAllInventory();
  }, []);

  const getAllInventory = () => {
    setLoading(true);
    fetch(`${BASE_URL}/inventory/getAll`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 200) {
          setInventory(data.data);
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error('Failed to fetch inventory:', err);
        alert('Error fetching inventory.');
      })
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    if (!name.trim() || quantity === '') {
      alert('Please enter both name and quantity.');
      return;
    }

    setLoading(true);
    fetch(`${BASE_URL}/inventory/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, quantity: parseInt(quantity, 10) })
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 201) {
          getAllInventory();
          setName('');
          setQuantity('');
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error('Failed to add inventory:', err);
        alert('Error adding inventory.');
      }).finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    fetch(`${BASE_URL}/inventory/delete/${id}`, {
      method: 'DELETE',
      headers
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 200) {
          setInventory(prev => prev.filter(item => item.id !== id));
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error('Failed to delete inventory:', err);
        alert('Error deleting inventory.');
      }).finally(() => setLoading(false));
  };

  const handleUpdate = () => {
    if (!editItem.name.trim() || editItem.quantity === '') {
      alert('Please fill out both fields.');
      return;
    }
    setLoading(true)
    fetch(`${BASE_URL}/inventory/update/${editItem.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: editItem.name,
        quantity: parseInt(editItem.quantity, 10)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 200) {
          getAllInventory();
          setEditItem(null);
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error('Failed to update inventory:', err);
        alert('Error updating inventory.');
      }) .finally(() => setLoading(false));
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Inventory Management</h2>

      <div className="top-controls">
        <input
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="inventory-inputs">
        <input
          type="text"
          placeholder="Enter item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          min="0"
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setQuantity(val >= 0 || e.target.value === '' ? e.target.value : '0');
          }}
          onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
        />
        <button onClick={handleAdd}>+ Add Inventory</button>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <button
                    className="icon-button edit"
                    onClick={() => setEditItem({ ...item })}
                    title="Edit Inventory"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="icon-button delete"
                    title="Delete Inventory"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">No inventory found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Inventory</h3>
            <input
              type="text"
              value={editItem.name}
              onChange={(e) =>
                setEditItem({ ...editItem, name: e.target.value })
              }
            />
            <input
              type="number"
              value={editItem.quantity}
              onChange={(e) =>
                setEditItem({ ...editItem, quantity: e.target.value })
              }
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <div className="modal-actions">
              <button onClick={handleUpdate}>Update</button>
              <button onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
