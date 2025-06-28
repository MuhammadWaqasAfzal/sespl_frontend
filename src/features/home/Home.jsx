import React, { useState, useMemo, useEffect } from 'react';
import Projects   from '../projects/Projects.jsx';
import Clients    from '../clients/Client.jsx';
import Employees  from '../employees/Employee.jsx';
import Settings   from '../settings/Settings.jsx';
import Dashboard  from '../dashboard/dashboard.jsx';
import Inventory  from '../inventory/Inventory.jsx';
import Helper from '../../utils/hepler.js';
import './Home.css';

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects',  label: 'Projects'  },
  { key: 'clients',   label: 'Clients'   },
  { key: 'employees', label: 'Employees' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'settings',  label: 'Settings'  },
  { key: 'logout',    label: 'Logout'    },  // 🚀 Added logout
];

const COMPONENT_MAP = {
  dashboard: <Dashboard />,
  projects:  <Projects  />,
  clients:   <Clients   />,
  employees: <Employees />,
  inventory: <Inventory />,
  settings:  <Settings  />,
};

const PERM_MAP = {
  dashboard:  'login',
  projects:   'viewProjects',
  clients:    'viewClients',
  employees:  'viewEmployees',
  inventory:  'viewInventory',
  settings:   'settings',
};

export default function Home() {
  const allowedMenu = useMemo(() =>
    MENU_ITEMS.filter(({ key }) => {
      if (key === 'logout') return true;  // Allow logout for all
      const permField = PERM_MAP[key];
      return permField ? Helper.checkPermission(permField) : true;
    }), []);

  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem('selectedTab');
    return allowedMenu.some((m) => m.key === saved)
      ? saved
      : allowedMenu[0]?.key ?? '';
  });

  useEffect(() => {
    if (!allowedMenu.some((m) => m.key === selected) && allowedMenu.length) {
      setSelected(allowedMenu[0].key);
      sessionStorage.setItem('selectedTab', allowedMenu[0].key);
    }
  }, [allowedMenu, selected]);

  const handleLogout = () => {
   const confirm = window.confirm("Are you sure you want to logout?");
          if (confirm) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
          }
  };

  return (
    <div className="home-container">
      <nav className="side-menu" role="tablist">
        <ul>
          {allowedMenu.map(({ key, label }) => (
            <li
              key={key}
              role="tab"
              tabIndex={0}
              aria-selected={selected === key}
              className={`${selected === key ? 'selected' : ''} ${key === 'logout' ? 'logout' : ''}`}
              onClick={() => {
                if (key === 'logout') {
                  handleLogout();
                } else {
                  setSelected(key);
                  sessionStorage.setItem('selectedTab', key);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (key === 'logout') {
                    handleLogout();
                  } else {
                    setSelected(key);
                    sessionStorage.setItem('selectedTab', key);
                  }
                }
              }}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        {COMPONENT_MAP[selected] ?? <p>Not authorised.</p>}
      </main>
    </div>
  );
}
