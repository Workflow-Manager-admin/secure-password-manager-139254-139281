import React, { useState } from "react";
import "./Auth.css";

/**
 * Registration screen for new users.
 * PUBLIC_INTERFACE
 */
export default function Register({ onRegister, onGoToLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await onRegister(form.username, form.password);
    setLoading(false);
  }
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
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
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
        />
      </label>
      <button className="btn-auth" type="submit" disabled={loading}>
        {loading ? "Registering…" : "Register"}
      </button>
      <div className="auth-switch">
        <span>Already have an account?</span>{" "}
        <button type="button" className="link" onClick={onGoToLogin}>
          Sign In
        </button>
      </div>
    </form>
  );
}
