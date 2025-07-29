import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import PasswordDetail from "../PasswordDetail";

const samplePassword = {
  id: 42,
  title: "Facebook",
  username: "userfb",
  password: "hunter2",
  note: "old password",
};

// Mock navigator.clipboard
const clipboardMock = { writeText: jest.fn() };
Object.assign(navigator, { clipboard: clipboardMock });

describe("PasswordDetail Component", () => {
  beforeEach(() => {
    clipboardMock.writeText.mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders add mode with blank editable form", () => {
    render(<PasswordDetail mode="add" onSave={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getByText(/add new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i).value).toBe("");
    expect(screen.getByLabelText(/password/i).value).toBe("");
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("renders edit mode populating form fields", () => {
    render(<PasswordDetail password={samplePassword} mode="edit" onSave={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getByDisplayValue("Facebook")).toBeInTheDocument();
    expect(screen.getByDisplayValue("userfb")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hunter2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("old password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  it("calls onSave with filled data on submit in add/edit", () => {
    const onSave = jest.fn();
    render(<PasswordDetail mode="add" onSave={onSave} onBack={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Test Site", name: "title" } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: "abc123", name: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: "Test Site", password: "abc123" }));
  });

  it("show/hide password toggling works and button label updates", () => {
    render(<PasswordDetail password={samplePassword} mode="edit" onSave={jest.fn()} onBack={jest.fn()} />);
    const btn = screen.getByRole("button", { name: /show/i });
    fireEvent.click(btn);
    expect(screen.getByRole("button", { name: /hide/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(screen.getByRole("button", { name: /show/i })).toBeInTheDocument();
  });

  it("copy to clipboard shows feedback and calls clipboard API", async () => {
    render(<PasswordDetail password={samplePassword} mode="edit" onSave={jest.fn()} onBack={jest.fn()} />);
    const copyBtn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyBtn);
    expect(clipboardMock.writeText).toHaveBeenCalledWith("hunter2");
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });

  it("renders view mode, toolbar, details and calls toolbar buttons", () => {
    const onEdit = jest.fn(), onDelete = jest.fn(), onBack = jest.fn();
    render(<PasswordDetail password={samplePassword} onEdit={onEdit} onDelete={onDelete} onBack={onBack} />);
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("userfb")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it("shows note as None if missing", () => {
    render(<PasswordDetail password={{ ...samplePassword, note: "" }} onEdit={jest.fn()} onDelete={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getByText(/none/i)).toBeInTheDocument();
  });

  it("masks password when not showing, reveals on click", () => {
    render(<PasswordDetail password={samplePassword} onEdit={jest.fn()} onDelete={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getByText(/•+/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(screen.getByText("hunter2")).toBeInTheDocument();
  });
});
