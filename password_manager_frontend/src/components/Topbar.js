import React from "react";
import "./Topbar.css";

/**
 * Topbar for the application with the app title, theme toggle, user info.
 * PUBLIC_INTERFACE
 */
export default function Topbar({ theme, toggleTheme, username, isAuth }) {
  return (
    <header className="topbar">
      <span className="topbar-brand">Password Manager</span>
      <span className="topbar-actions">
        {isAuth && (
          <span className="topbar-user">
            <span className="user-icon">🧑‍💻</span>
            {username}
          </span>
        )}
        <button
          className="theme-btn"
          aria-label="Toggle dark/light theme"
          onClick={toggleTheme}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </span>
    </header>
  );
}
