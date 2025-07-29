import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import PasswordList from "./components/PasswordList";
import PasswordDetail from "./components/PasswordDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import Topbar from "./components/Topbar";
import Modal from "./components/Modal";
import "./App.css";

/**
 * The main App component manages authentication state, theme (dark/light),
 * routing between core screens, and holding main password state.
 * PUBLIC_INTERFACE
 */
function App() {
  // Theme management
  const [theme, setTheme] = useState("dark");

  // Auth state
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);     // JWT or similar
  const [username, setUsername] = useState(null);

  // View state
  const [currentPage, setCurrentPage] = useState("list"); // "list" | "detail" | "add" | "edit"
  const [selectedPassword, setSelectedPassword] = useState(null); // password object

  // Password entries
  const [passwords, setPasswords] = useState([]);
  const [search, setSearch] = useState("");

  // Modals/messages
  const [modal, setModal] = useState({ show: false, title: "", message: "", onConfirm: null });

  // FastAPI backend base URL (set to correct container if needed)
  const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  // Save theme to localStorage and update root on mount/theme change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    // Restore theme if present
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    // restore auth if previously logged in
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setIsAuth(true);
    }
  }, []);

  // Fetch passwords list (protected resource)
  const fetchPasswords = useCallback(async () => {
    if (!token) return;
    try {
      const resp = await fetch(`${API_BASE}/passwords`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 401) {
        handleLogout();
        return;
      }
      const data = await resp.json();
      setPasswords(data.passwords || []);
    } catch (err) {
      setModal({ show: true, title: "Error", message: "Could not load passwords.", onConfirm: () => setModal({ show: false }) });
    }
  }, [token, API_BASE]);

  useEffect(() => {
    if (isAuth) fetchPasswords();
  }, [isAuth, fetchPasswords]);

  // Theme toggling
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // -----------------------
  // Auth/Register handlers
  // -----------------------

  // PUBLIC_INTERFACE
  const handleLogin = async (username, password) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (resp.status === 401) {
        setModal({
          show: true,
          title: "Login Failed",
          message: "Invalid credentials.",
          onConfirm: () => setModal({ show: false }),
        });
        return;
      }
      const data = await resp.json();
      setToken(data.access_token);
      setUsername(username);
      setIsAuth(true);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", username);
      setCurrentPage("list");
    } catch {
      setModal({
        show: true,
        title: "Login Error",
        message: "Could not login.",
        onConfirm: () => setModal({ show: false }),
      });
    }
  };

  // PUBLIC_INTERFACE
  const handleRegister = async (username, password) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) {
        let errMsg = "Registration failed.";
        if (resp.status === 409) errMsg = "User already exists.";
        setModal({
          show: true,
          title: "Registration Failed",
          message: errMsg,
          onConfirm: () => setModal({ show: false }),
        });
        return;
      }
      setModal({
        show: true,
        title: "Success",
        message: "Registration successful! You can now log in.",
        onConfirm: () => setModal({ show: false }),
      });
      setCurrentPage("login");
    } catch {
      setModal({
        show: true,
        title: "Error",
        message: "Could not register.",
        onConfirm: () => setModal({ show: false }),
      });
    }
  };

  // PUBLIC_INTERFACE
  const handleLogout = () => {
    setIsAuth(false);
    setToken(null);
    setUsername(null);
    setPasswords([]);
    setSelectedPassword(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setCurrentPage("login");
  };

  // ---------------------------------
  // Password CRUD operations handlers
  // ---------------------------------

  // Add new password
  const handleAddPassword = async (passwordObj) => {
    try {
      const resp = await fetch(`${API_BASE}/passwords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordObj),
      });
      if (!resp.ok) throw new Error("Failed to add");
      await fetchPasswords();
      setCurrentPage("list");
    } catch {
      setModal({
        show: true,
        title: "Error",
        message: "Could not add password.",
        onConfirm: () => setModal({ show: false }),
      });
    }
  };
  // Edit password
  const handleEditPassword = async (id, updates) => {
    try {
      const resp = await fetch(`${API_BASE}/passwords/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!resp.ok) throw new Error("Failed to update");
      await fetchPasswords();
      setCurrentPage("list");
    } catch {
      setModal({
        show: true,
        title: "Error",
        message: "Could not update entry.",
        onConfirm: () => setModal({ show: false }),
      });
    }
  };
  // Delete password
  const handleDeletePassword = async (id) => {
    try {
      const resp = await fetch(`${API_BASE}/passwords/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to delete");
      await fetchPasswords();
      setCurrentPage("list");
    } catch {
      setModal({
        show: true,
        title: "Error",
        message: "Could not delete entry.",
        onConfirm: () => setModal({ show: false }),
      });
    }
  };

  // Only show detail page if selectedPassword is valid
  const showDetailPage = currentPage === "detail" && selectedPassword;

  // Password search filter
  const filteredPasswords = passwords.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.username && p.username.toLowerCase().includes(search.toLowerCase())) ||
      (p.note && p.note.toLowerCase().includes(search.toLowerCase()))
  );

  // Sidebar navigation actions
  const sideNavLinks = [
    {
      name: "All Passwords",
      icon: "🔑",
      action: () => {
        setCurrentPage("list");
        setSelectedPassword(null);
      },
      active: currentPage === "list",
    },
    {
      name: "Add Entry",
      icon: "➕",
      action: () => {
        setCurrentPage("add");
        setSelectedPassword(null);
      },
      active: currentPage === "add",
    },
    {
      name: "Logout",
      icon: "🚪",
      action: handleLogout,
      active: false,
    },
  ];

  // Main UI render
  return (
    <div className="app-outer">
      <div className="topbar-holder">
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          username={username}
          isAuth={isAuth}
        />
      </div>
      <div className="main-content">
        {isAuth ? (
          <>
            <Sidebar navLinks={sideNavLinks} />
            <div className="content-pane">
              {(currentPage === "list" || currentPage === "add" || showDetailPage || currentPage === "edit") && (
                <div>
                  {currentPage === "list" && (
                    <PasswordList
                      passwords={filteredPasswords}
                      onSelect={(pw) => {
                        setSelectedPassword(pw);
                        setCurrentPage("detail");
                      }}
                      search={search}
                      setSearch={setSearch}
                    />
                  )}
                  {showDetailPage && (
                    <PasswordDetail
                      password={selectedPassword}
                      onEdit={() => setCurrentPage("edit")}
                      onDelete={() =>
                        setModal({
                          show: true,
                          title: "Delete Entry",
                          message: "Are you sure you want to delete this entry?",
                          onConfirm: async () => {
                            setModal({ show: false });
                            await handleDeletePassword(selectedPassword.id);
                          },
                        })
                      }
                      onBack={() => setCurrentPage("list")}
                      token={token}
                      backendUrl={API_BASE}
                    />
                  )}
                  {currentPage === "add" && (
                    <PasswordDetail
                      mode="add"
                      onSave={handleAddPassword}
                      onBack={() => setCurrentPage("list")}
                    />
                  )}
                  {currentPage === "edit" && selectedPassword && (
                    <PasswordDetail
                      mode="edit"
                      password={selectedPassword}
                      onSave={async (updates) => {
                        await handleEditPassword(selectedPassword.id, updates);
                        setCurrentPage("list");
                        setSelectedPassword(null);
                      }}
                      onBack={() => setCurrentPage("list")}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-page">
            {currentPage === "register" ? (
              <Register
                onRegister={handleRegister}
                onGoToLogin={() => setCurrentPage("login")}
              />
            ) : (
              <Login
                onLogin={handleLogin}
                onGoToRegister={() => setCurrentPage("register")}
              />
            )}
          </div>
        )}
      </div>
      <Modal show={modal.show} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} />
    </div>
  );
}

export default App;
