import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../Sidebar";

describe("Sidebar Component", () => {
  const navLinks = [
    { name: "All Passwords", icon: "🔑", action: jest.fn(), active: true },
    { name: "Add Entry", icon: "➕", action: jest.fn(), active: false },
    { name: "Logout", icon: "🚪", action: jest.fn(), active: false },
  ];

  it("renders each nav item, icon, and label", () => {
    render(<Sidebar navLinks={navLinks} />);
    expect(screen.getByText(/Vault/i)).toBeInTheDocument();
    navLinks.forEach(({ name, icon }) => {
      expect(screen.getByText(icon)).toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("sets 'active' class on active link and not on others", () => {
    render(<Sidebar navLinks={navLinks} />);
    const all = screen.getAllByRole("listitem");
    expect(all[0].className).toContain("active");
    expect(all[1].className).not.toContain("active");
    expect(all[2].className).not.toContain("active");
  });

  it("calls correct nav action on click", () => {
    render(<Sidebar navLinks={navLinks} />);
    const all = screen.getAllByRole("listitem");
    fireEvent.click(all[1]);
    expect(navLinks[1].action).toHaveBeenCalled();
  });

  it("each navitem and icon is focusable", () => {
    render(<Sidebar navLinks={navLinks} />);
    const all = screen.getAllByRole("listitem");
    all.forEach((li) => {
      expect(li.tabIndex).toBe(0);
    });
    navLinks.forEach(({ icon }) => {
      expect(screen.getByText(icon)).toBeInTheDocument();
    });
  });
});
