import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../Login";

describe("Login Component", () => {
  it("renders form with username and password fields and sign in button", () => {
    render(<Login onLogin={jest.fn()} onGoToRegister={jest.fn()} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/New here\?/i)).toBeInTheDocument();
  });

  it("calls onLogin with username and password upon submit", async () => {
    const onLogin = jest.fn().mockResolvedValue();
    render(<Login onLogin={onLogin} onGoToRegister={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "bob", name: "username" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pass123", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(onLogin).toHaveBeenCalledWith("bob", "pass123");
  });

  it("shows loading indicator and disables button while logging in", async () => {
    const onLogin = jest.fn(() => new Promise(() => {}));
    render(<Login onLogin={onLogin} onGoToRegister={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice", name: "username" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pass", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("triggers onGoToRegister when switching to register", () => {
    const onGoToRegister = jest.fn();
    render(<Login onLogin={jest.fn()} onGoToRegister={onGoToRegister} />);
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(onGoToRegister).toHaveBeenCalled();
  });
});
