// src/pages/Home.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Projects   from '../projects/Projects.jsx';
import Clients    from '../clients/Client.jsx';
import Employees  from '../employees/Employee.jsx';
import Settings   from '../settings/Settings.jsx';
import Dashboard  from '../dashboard/dashboard.jsx';
import Inventory  from '../inventory/Inventory.jsx';
import Helper     from '../../utils/hepler.js';
import './Home.css';                     // ←  make sure path is correct

/* ───────────────── menu definition ───────────────── */
const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects',  label: 'Projects'  },
  { key: 'clients',   label: 'Clients'   },
  { key: 'employees', label: 'Employees' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'settings',  label: 'Settings'  },
];

/* map keys to components */
const COMPONENT_MAP = {
  dashboard: <Dashboard />,
  projects : <Projects  />,
  clients  : <Clients   />,
  employees: <Employees />,
  inventory: <Inventory />,
  settings : <Settings  />,
};

/* key → permission flag */
const PERM_MAP = {
  dashboard : 'login',
  projects  : 'viewProjects',
  clients   : 'viewClients',
  employees : 'viewEmployees',
  inventory : 'viewInventory',
  settings  : 'settings',
};

/* ───────────────── component ───────────────── */
export default function Home() {
  /* filter menu by permission */
  const allowedMenu = useMemo(
    () => MENU_ITEMS.filter(({ key }) =>
      PERM_MAP[key] ? Helper.checkPermission(PERM_MAP[key]) : true),
    []
  );

  /* selected tab */
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem('selectedTab');
    return allowedMenu.some(m => m.key === saved)
      ? saved
      : allowedMenu[0]?.key ?? '';
  });

  /* drawer state (mobile) */
  const [open, setOpen] = useState(false);
  const closeDrawer = () => setOpen(false);

  /* keep selected valid if permissions change (rare) */
  useEffect(() => {
    if (!allowedMenu.some(m => m.key === selected) && allowedMenu.length) {
      setSelected(allowedMenu[0].key);
    }
  }, [allowedMenu, selected]);

  /* ───────────────── render ───────────────── */
  return (
    <div className="home-container">
      {/* hamburger (visible via CSS only on ≤768 px) */}
      <button
        className={`hamburger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
      </button>

      {/* sidebar */}
      <nav className={`side-menu ${open ? 'open' : ''}`} role="tablist">
        <ul>
          {allowedMenu.map(({ key, label }) => (
            <li
              key={key}
              role="tab"
              aria-selected={selected === key}
              className={selected === key ? 'selected' : ''}
              tabIndex={0}
              onClick={() => {
                setSelected(key);
                sessionStorage.setItem('selectedTab', key);
                closeDrawer();           // close drawer on mobile tap
              }}
              onKeyDown={e => e.key === 'Enter' && setSelected(key)}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>

      {/* main panel */}
      <main className="main-content">
        {COMPONENT_MAP[selected] ?? <p>Not authorised.</p>}
      </main>
    </div>
  );
}
