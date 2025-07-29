import React, { useRef, useState } from "react";
import "./PasswordDetail.css";

/**
 * Details, add, and edit view for a password entry.
 * mode: "view" (default), "add", "edit" determined by props.
 * PUBLIC_INTERFACE
 */
export default function PasswordDetail({
  password,
  mode,
  onEdit,
  onDelete,
  onSave,
  onBack,
  token,
  backendUrl,
}) {
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isView = !isAdd && !isEdit;

  // For form handling
  const [form, setForm] = useState(isAdd ? { title: "", username: "", password: "", note: "" } : password || {});
  React.useEffect(() => {
    if (isEdit && password) setForm(password);
  }, [isEdit, password]);
  // State: show/hide password field
  const [showPwd, setShowPwd] = useState(false);
  // Copy feedback UI
  const [copyMsg, setCopyMsg] = useState("");

  // Handler
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Copy to clipboard utility
  const copyToClipboard = (val) => {
    if (!navigator || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(val)
      .then(() => {
        setCopyMsg("Copied!");
        setTimeout(() => setCopyMsg(""), 1200);
      })
      .catch(() => {
        setCopyMsg("Failed");
        setTimeout(() => setCopyMsg(""), 1200);
      });
  };

  // Reveal/Hide password for view mode
  function handleReveal() {
    setShowPwd((s) => !s);
    setCopyMsg("");
  }

  // Fetch decrypted password from backend if viewing (if field is masked or API returns only masked)
  const [realPassword, setRealPassword] = useState(null);
  const [fetchingReal, setFetchingReal] = useState(false);

  React.useEffect(() => {
    if (
      isView &&
      password &&
      password.id &&
      password.password &&
      password.password.startsWith("***") &&
      backendUrl &&
      token
    ) {
      // Backend returns masked, fetch real
      setFetchingReal(true);
      fetch(`${backendUrl}/passwords/${password.id}/reveal`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((resp) => resp.json())
        .then((data) => {
          setRealPassword(data.password); // assuming backend returns {password: "..."}
          setFetchingReal(false);
        })
        .catch(() => setFetchingReal(false));
    } else if (password && password.password) {
      setRealPassword(password.password);
    }
  }, [isView, password, backendUrl, token]);

  // Form submit handler (create or update)
  function handleSave(e) {
    e.preventDefault();
    if (!form.title || !form.password) return;
    onSave(form);
  }

  if (isAdd || isEdit) {
    return (
      <form className="pwdetail-form" onSubmit={handleSave}>
        <h2>{isAdd ? "Add New Password" : "Edit Password"}</h2>
        <div className="pwdetail-field">
          <label>
            Title <span>*</span>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Gmail"
              required
              autoFocus
            />
          </label>
        </div>
        <div className="pwdetail-field">
          <label>
            Username
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Your username or email"
            />
          </label>
        </div>
        <div className="pwdetail-field">
          <label>
            Password <span>*</span>
            <input
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="new-password"
            />
            <button type="button" className="form-btn" onClick={handleReveal}>
              {showPwd ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="form-btn"
              onClick={() => copyToClipboard(form.password)}
            >
              Copy
            </button>
            <span className="pwdetail-feedback">{copyMsg}</span>
          </label>
        </div>
        <div className="pwdetail-field">
          <label>
            Notes
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Any notes (optional)"
              rows="2"
            />
          </label>
        </div>
        <div className="pwdetail-actions">
          <button className="btn-main" type="submit">
            {isAdd ? "Add" : "Update"}
          </button>
          <button
            className="btn-cancel"
            type="button"
            onClick={onBack}
            tabIndex={0}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // View (default) mode
  if (isView && password) {
    return (
      <div className="pwdetail-view">
        <div className="pwdetail-toolbar">
          <button className="btn-back" onClick={onBack}>
            ← Back
          </button>
          <div className="spacer" />
          <button className="btn-edit" onClick={onEdit}>
            Edit
          </button>
          <button className="btn-del" onClick={onDelete}>
            Delete
          </button>
        </div>
        <div className="pwdetail-group">
          <div className="pwdetail-label">Title</div>
          <div className="pwdetail-value">{password.title}</div>
        </div>
        <div className="pwdetail-group">
          <div className="pwdetail-label">Username</div>
          <div className="pwdetail-value">{password.username || <span className="pwdetail-note">—</span>}</div>
        </div>
        <div className="pwdetail-group">
          <div className="pwdetail-label">Password</div>
          <div className="pwdetail-value">
            {fetchingReal ? (
              <span>Decrypting…</span>
            ) : (
              <>
                <span>
                  {showPwd
                    ? realPassword
                    : (realPassword && realPassword.replace(/./g, "•")) ||
                      ""}
                </span>
                <button className="form-btn" onClick={handleReveal}>
                  {showPwd ? "Hide" : "Show"}
                </button>
                <button
                  className="form-btn"
                  onClick={() => copyToClipboard(realPassword)}
                  disabled={!realPassword}
                >
                  Copy
                </button>
                <span className="pwdetail-feedback">{copyMsg}</span>
              </>
            )}
          </div>
        </div>
        <div className="pwdetail-group">
          <div className="pwdetail-label">Notes</div>
          <div className="pwdetail-value">
            {password.note ? password.note : <span className="pwdetail-note">None</span>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
