import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PasswordList from "../PasswordList";

const sampleData = [
  { id: 1, title: "Gmail", username: "bob@gmail.com" },
  { id: 2, title: "Github", username: "gitbob" },
];

describe("PasswordList Component", () => {
  it("renders list of password entries with title and username", () => {
    render(
      <PasswordList
        passwords={sampleData}
        onSelect={jest.fn()}
        search=""
        setSearch={jest.fn()}
      />
    );
    expect(screen.getByText("Gmail")).toBeInTheDocument();
    expect(screen.getByText("Github")).toBeInTheDocument();
    expect(screen.getByText("bob@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("gitbob")).toBeInTheDocument();
  });

  it("shows empty state if no passwords", () => {
    render(<PasswordList passwords={[]} onSelect={jest.fn()} search="" setSearch={jest.fn()} />);
    expect(screen.getByText(/no passwords found/i)).toBeInTheDocument();
  });

  it("search input reflects value, calls setSearch", () => {
    const setSearch = jest.fn();
    render(<PasswordList passwords={sampleData} onSelect={jest.fn()} search="gi" setSearch={setSearch} />);
    const inp = screen.getByLabelText(/search passwords/i);
    expect(inp.value).toBe("gi");
    fireEvent.change(inp, { target: { value: "foo" } });
    expect(setSearch).toHaveBeenCalledWith("foo");
  });

  it("calls onSelect with password object when an item is clicked", () => {
    const onSelect = jest.fn();
    render(<PasswordList passwords={sampleData} onSelect={onSelect} search="" setSearch={jest.fn()} />);
    fireEvent.click(screen.getByText("Gmail").closest(".pwlist-item"));
    expect(onSelect).toHaveBeenCalledWith(sampleData[0]);
  });

  it("count displays properly for plural and singular", () => {
    const { rerender } = render(
      <PasswordList passwords={sampleData} onSelect={jest.fn()} search="" setSearch={jest.fn()} />
    );
    expect(screen.getByText(/2 items/i)).toBeInTheDocument();
    rerender(
      <PasswordList passwords={[sampleData[0]]} onSelect={jest.fn()} search="" setSearch={jest.fn()} />
    );
    expect(screen.getByText(/1 item$/i)).toBeInTheDocument();
  });
});
