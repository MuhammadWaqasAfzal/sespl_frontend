import React, { useState } from 'react';
import Projects from '../projects/Projects.jsx';
import Clients from '../clients/Client.jsx';
import Employees from '../employees/Employee.jsx';
import Settings from '../settings/Settings.jsx';
import Dashboard from '../dashboard/dashboard.jsx';
import './Home.css';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects', label: 'Projects' },
  { key: 'clients', label: 'Clients' },
  { key: 'employees', label: 'Employees' },
  { key: 'settings', label: 'Settings' },
];

const componentMap = {
  dashboard: <Dashboard/>,
  projects: <Projects/>,
  clients: <Clients/>,
  employees: <Employees/>,
  settings: <Settings/>,

};

export default function Home() {
  //const [selected, setSelected] = useState('dashboard');
  
  const [selected, setSelected] = useState(() => {
    return sessionStorage.getItem('selectedTab') || 'dashboard';
  });

  return (
    <div className="home-container">
      <nav className="side-menu" role="tablist">
        <ul>
          {menuItems.map(({ key, label }) => (
            <li
              key={key}
              role="tab"
              tabIndex={0}
              aria-selected={selected === key}
              className={selected === key ? 'selected' : ''}
              onClick={() => {
                setSelected(key);
                sessionStorage.setItem('selectedTab', key);
              }}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(key)}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        {componentMap[selected] || <Projects />}
      </main>
    </div>
  );
}
