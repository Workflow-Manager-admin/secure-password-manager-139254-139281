import React from "react";
import "./PasswordList.css";

/**
 * PasswordList component displays a searchable, scrollable list of passwords.
 * PUBLIC_INTERFACE
 */
export default function PasswordList({ passwords, onSelect, search, setSearch }) {
  return (
    <div className="pwlist-outer">
      <div className="pwlist-toolbar">
        <input
          aria-label="Search passwords"
          className="pwlist-search"
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="pwlist-count">{passwords.length} item{passwords.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="pwlist-list">
        {passwords.length === 0 && (
          <div className="pwlist-empty">No passwords found.</div>
        )}
        {passwords.map((pw) => (
          <div
            className="pwlist-item"
            key={pw.id}
            tabIndex={0}
            onClick={() => onSelect(pw)}
          >
            <div className="pwlist-title">{pw.title}</div>
            <div className="pwlist-meta">
              {pw.username && <span className="pwlist-username">{pw.username}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
