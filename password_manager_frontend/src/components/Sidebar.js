import React from "react";
import "./Sidebar.css";

/**
 * Sidebar for navigation. Receives array of navLinks: {name, icon, action, active}
 * PUBLIC_INTERFACE
 */
export default function Sidebar({ navLinks }) {
  return (
    <nav className="sidebar">
      <h2 className="sidebar-title">🔐 Vault</h2>
      <ul className="sidebar-navlist">
        {navLinks.map((link, idx) => (
          <li
            className={`navitem${link.active ? " active" : ""}`}
            onClick={link.action}
            key={idx}
            tabIndex={0}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.name}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
