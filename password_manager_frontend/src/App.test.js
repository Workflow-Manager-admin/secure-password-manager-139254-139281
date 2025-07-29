import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import App from "./App";

// Helper for fully mocking fetch by url/content
function mockFetchResponse(routes) {
  global.fetch = jest.fn((url, opts = {}) => {
    for (let route of routes) {
      if (url.includes(route.url)) {
        if (route.method && route.method !== (opts.method || "GET")) continue;
        return Promise.resolve({
          ok: typeof route.status === "undefined" ? true : route.status < 400,
          status: route.status || 200,
          json: () => Promise.resolve(route.json),
        });
      }
    }
    // fallback: 404
    return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
  });
  return global.fetch;
}

function setStorage(token, username) {
  Object.defineProperty(window, "localStorage", {
    value: (function () {
      let store = {};
      return {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => (store[k] = v),
        removeItem: (k) => delete store[k],
        clear: () => (store = {}),
      };
    })(),
    writable: true,
  });
  if (token) localStorage.setItem("token", token);
  if (username) localStorage.setItem("username", username);
}

// Mock clipboard
const clipboardMock = { writeText: jest.fn() };
Object.assign(navigator, { clipboard: clipboardMock });

describe("App Integration", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setStorage(null, null);
    clipboardMock.writeText.mockClear();
  });

  it("renders login screen, allows switching to registration", () => {
    render(<App />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("handles registration, success modal, navigation", async () => {
    mockFetchResponse([
      { url: "/auth/register", method: "POST", json: {}, status: 200 },
    ]);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "bob", name: "username" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pw", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
    await waitFor(() => expect(screen.getByText(/registration successful/i)).toBeInTheDocument());
    // Close modal
    fireEvent.click(screen.getByRole("button", { name: /ok/i }));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("logs in a user, fetches passwords, supports listing and detail navigation", async () => {
    mockFetchResponse([
      { url: "/auth/login", method: "POST", json: { access_token: "tok123" }, status: 200 },
      { url: "/passwords", json: { passwords: [
        { id: 9, title: "Youtube", username: "userY", password: "***masked***" }
      ] }, status: 200 },
      { url: "/passwords/9/reveal", json: { password: "unmaskedpw" }, status: 200 }
    ]);
    render(<App />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "jill", name: "username" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pw", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Youtube")).toBeInTheDocument();
    expect(screen.getByText("userY")).toBeInTheDocument();

    // Go to detail page
    fireEvent.click(screen.getByText("Youtube").closest(".pwlist-item"));
    expect(screen.getByText(/decrypting/i)).toBeInTheDocument();
    await screen.findByText(/•+/);

    // Reveal password, "Show" → "Hide"
    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(await screen.findByText("unmaskedpw")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(screen.getByText(/•+/)).toBeInTheDocument();

    // Copy
    fireEvent.click(screen.getByRole("button", { name: /^copy$/i }));
    expect(clipboardMock.writeText).toHaveBeenCalledWith("unmaskedpw");
  });

  it("handles add, edit, and delete password operations", async () => {
    // 1: Log in, see password list, go to Add Entry
    mockFetchResponse([
      { url: "/auth/login", method: "POST", json: { access_token: "tok456" }, status: 200 },
      { url: "/passwords", json: { passwords: [] }, status: 200 },
      { url: "/passwords", method: "POST", json: {}, status: 200 },
      { url: "/passwords/12", method: "PUT", json: {}, status: 200 },
      { url: "/passwords", json: { passwords: [ 
        { id: 12, title: "Twitter", username: "u", password: "***" } 
      ] }, status: 200 },
      { url: "/passwords/12/reveal", json: { password: "tw123" }, status: 200 },
      { url: "/passwords/12", method: "DELETE", json: {}, status: 200 },
      { url: "/passwords", json: { passwords: [] }, status: 200 }
    ]);
    render(<App />);
    // Login
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "jane", name: "username" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pw", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Add entry
    fireEvent.click(screen.getByText(/add entry/i));
    fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: "Twitter" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "tw123" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    await waitFor(() => expect(screen.getByText("Twitter")).toBeInTheDocument());

    // To detail, then edit
    fireEvent.click(screen.getByText("Twitter").closest(".pwlist-item"));
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByDisplayValue("Twitter")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^title/i), { target: { value: "Twitter 2" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await waitFor(() => expect(screen.getByText("Twitter")).toBeInTheDocument());

    // Delete
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() => screen.getByText(/delete entry/i));
    fireEvent.click(screen.getByRole("button", { name: /ok/i }));
    await waitFor(() => expect(screen.queryByText("Twitter")).not.toBeInTheDocument());
  });

  it("performs search/filter of passwords", async () => {
    mockFetchResponse([
      { url: "/auth/login", method: "POST", json: { access_token: "tok8" }, status: 200 },
      { url: "/passwords", json: { passwords: [ 
        { id: 8, title: "Amazon", username: "auser", password: "***" }, 
        { id: 9, title: "Google", username: "bob9", password: "***" } 
      ] }, status: 200 }
    ]);
    render(<App />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "bob", name: "username" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pw", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await screen.findByText("Amazon");
    await screen.findByText("Google");
    // Search for 'goo' hides Amazon
    fireEvent.change(screen.getByLabelText(/search passwords/i), { target: { value: "goo" } });
    expect(screen.queryByText("Amazon")).not.toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    // Remove filter
    fireEvent.change(screen.getByLabelText(/search passwords/i), { target: { value: "" } });
    expect(screen.getByText("Amazon")).toBeInTheDocument();
  });

  it("handles logout and route state", async () => {
    mockFetchResponse([
      { url: "/auth/login", method: "POST", json: { access_token: "tokextra" }, status: 200 },
      { url: "/passwords", json: { passwords: [ 
        { id: 44, title: "Netflix", username: "nuser", password: "***" }
      ] }, status: 200 }
    ]);
    render(<App />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "alex", name: "username" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pw", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await screen.findByText("Netflix");
    // Logout
    fireEvent.click(screen.getByText(/logout/i));
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});
