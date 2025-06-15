import React, { useState, useMemo, useEffect } from 'react';
import Projects   from '../projects/Projects.jsx';
import Clients    from '../clients/Client.jsx';
import Employees  from '../employees/Employee.jsx';
import Settings   from '../settings/Settings.jsx';
import Dashboard  from '../dashboard/dashboard.jsx';
import Inventory  from '../inventory/Inventory.jsx';
import Helper from '../../utils/hepler.js';   // ← NEW
import './Home.css';

/* ─────────────── menu & component maps ─────────────── */

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects',  label: 'Projects'  },
  { key: 'clients',   label: 'Clients'   },
  { key: 'employees', label: 'Employees' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'settings',  label: 'Settings'  },
];

const COMPONENT_MAP = {
  dashboard: <Dashboard />,
  projects:  <Projects  />,
  clients:   <Clients   />,
  employees: <Employees />,
  inventory: <Inventory />,
  settings:  <Settings  />,
};

/* key → permission field */
const PERM_MAP = {
  dashboard:  'login',
  projects:   'viewProjects',
  clients:    'viewClients',
  employees:  'viewEmployees',
  inventory:  'viewInventory',
  settings:   'settings',
};

export default function Home() {
  /* 1️⃣  build the menu the user is allowed to see */
  const allowedMenu = useMemo(
    () =>
      MENU_ITEMS.filter(({ key }) => {
        const permField = PERM_MAP[key];
        return permField ? Helper.checkPermission(permField) : true;
      }),
    [],
  );

  /* 2️⃣  decide which tab to show first */
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem('selectedTab');
    return allowedMenu.some((m) => m.key === saved)
      ? saved
      : allowedMenu[0]?.key ?? '';
  });

  /* 3️⃣  keep selected tab valid if permissions change (unlikely) */
  useEffect(() => {
    if (!allowedMenu.some((m) => m.key === selected) && allowedMenu.length) {
      setSelected(allowedMenu[0].key);
      sessionStorage.setItem('selectedTab', allowedMenu[0].key);
    }
  }, [allowedMenu, selected]);

  /* 4️⃣  render */
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
        {COMPONENT_MAP[selected] ?? <p>Not authorised.</p>}
      </main>
    </div>
  );
}

