import React, { useState } from "react";
import "./Auth.css";

/**
 * Login screen for user authentication.
 * PUBLIC_INTERFACE
 */
export default function Login({ onLogin, onGoToRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await onLogin(form.username, form.password);
    setLoading(false);
  }
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      <label>
        Username
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          value={form.username}
          onChange={handleChange}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={handleChange}
        />
      </label>
      <button className="btn-auth" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <div className="auth-switch">
        <span>New here?</span>{" "}
        <button type="button" className="link" onClick={onGoToRegister}>
          Register
        </button>
      </div>
    </form>
  );
}
