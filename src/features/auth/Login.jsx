import React, { useState } from 'react';
import './Login.css';
import { BASE_URL } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Helper from '../../utils/hepler';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    setEmail(e.target.value.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return toast.error('Email is required');
    if (!validateEmail(email)) return toast.error('Invalid email format');
    if (!password) return toast.error('Password is required');

    setLoading(true);

    try {
      // Login API
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const user = await response.json();

      if (!response.ok) {
        return toast.error(user.message || 'Login failed');
      }

      // Store user
      localStorage.setItem('user', JSON.stringify(user.data));
      localStorage.setItem('isLoggedIn', 'true');

      const company_id = Helper.getCompanyId();
      const headers = {
        'Content-Type': 'application/json',
        company_id,
      };

      // Designations
      const desigRes = await fetch(`${BASE_URL}/designation/getAll`, { headers });
      if (desigRes.ok) {
        const data = await desigRes.json();
        localStorage.setItem('designations', JSON.stringify(data.data));
      } else {
        toast.error('Failed to fetch designations');
      }

      // Permissions
      const permRes = await fetch(`${BASE_URL}/permission/getAll`, { headers });
      if (permRes.ok) {
        const data = await permRes.json();
        localStorage.setItem('permissions', JSON.stringify(data.data));
      } else {
        toast.error('Failed to fetch permissions');
      }

      // Clients
      const clientRes = await fetch(`${BASE_URL}/client/getAll`, { headers });
      if (clientRes.ok) {
        const data = await clientRes.json();
        localStorage.setItem('clients', JSON.stringify(data.data));
      } else {
        toast.error('Failed to fetch clients');
      }

      // Expenses (non-blocking)
      fetch(`${BASE_URL}/expense/getAll`, { headers })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem('expenses', JSON.stringify(data.data));
        })
        .catch((err) => console.error('Failed to fetch expenses:', err));

      sessionStorage.setItem('selectedTab', 'dashboard');
      navigate('/home');
    } catch (error) {
      toast.error(error?.message || 'Something went wrong');
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
