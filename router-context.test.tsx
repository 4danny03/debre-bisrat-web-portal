import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, it, expect } from "vitest";

function LocationDisplay() {
  const location = useLocation();
  return <div>Path: {location.pathname}</div>;
}

describe("Root Router context", () => {
  it("provides router context", () => {
    render(
      <MemoryRouter initialEntries={["/test"]}>
        <LocationDisplay />
      </MemoryRouter>
    );
    expect(screen.getByText("Path: /test")).toBeInTheDocument();
  });
});
