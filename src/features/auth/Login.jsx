import React, { useState } from 'react';
import './Login.css';
import { BASE_URL } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Optionally add real-time validation logic here (without toasts)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!email) {
      toast.error('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
    if (!password) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        toast.error(errData.message || 'Login failed');
        return;
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user.data));
      localStorage.setItem('isLoggedIn', 'true'); 


      // Fetch designations
      const desigResponse = await fetch(`${BASE_URL}/designation/getAll`);
      if (!desigResponse.ok) {
        toast.error('Failed to fetch designations');
      } else {
        const designations = await desigResponse.json();
        localStorage.setItem('designations', JSON.stringify(designations.data));
      }

      // Fetch permissions
      const permResponse = await fetch(`${BASE_URL}/permission/getAll`);
      if (!permResponse.ok) {
        toast.error('Failed to fetch permissions');
      } else {
        const permissions = await permResponse.json();
        localStorage.setItem('permissions', JSON.stringify(permissions.data));
      }

      // Fetch clients
      const clientResponse = await fetch(`${BASE_URL}/client/getAll`);
      if (!clientResponse.ok) {
        toast.error('Failed to fetch clients');
      } else {
        const clients = await clientResponse.json();
        localStorage.setItem('clients', JSON.stringify(clients.data));
      }

      // Fetch Expense Types (non-blocking)
      fetch(`${BASE_URL}/expense/getAll`)
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('expenses', JSON.stringify(data.data));
        })
        .catch(err => console.error('Failed to fetch expenses:', err));

      sessionStorage.setItem('selectedTab', "dashboard");

      navigate('/home');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Login</h2>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar theme="colored" />
    </div>
  );
}
