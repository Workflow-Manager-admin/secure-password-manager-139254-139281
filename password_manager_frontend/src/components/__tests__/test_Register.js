import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../Register";

describe("Register Component", () => {
  it("renders form with username and password fields and register button", () => {
    render(<Register onRegister={jest.fn()} onGoToLogin={jest.fn()} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });

  it("calls onRegister with username and password upon submit", async () => {
    const onRegister = jest.fn().mockResolvedValue();
    render(<Register onRegister={onRegister} onGoToLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "bob", name: "username" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pass123", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^register/i }));
    expect(onRegister).toHaveBeenCalledWith("bob", "pass123");
  });

  it("shows loading indicator and disables button while registering", async () => {
    const onRegister = jest.fn(() => new Promise(() => {}));
    render(<Register onRegister={onRegister} onGoToLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "jim", name: "username" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pw", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^register/i }));
    expect(screen.getByRole("button", { name: /registering/i })).toBeDisabled();
  });

  it("triggers onGoToLogin when switching to login", () => {
    const onGoToLogin = jest.fn();
    render(<Register onRegister={jest.fn()} onGoToLogin={onGoToLogin} />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(onGoToLogin).toHaveBeenCalled();
  });
});
