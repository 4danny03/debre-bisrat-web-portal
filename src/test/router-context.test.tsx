import { render, screen } from "./test-utils";
import { describe, it, expect } from "vitest";
import { useLocation } from "react-router-dom";

function LocationDisplay() {
  const location = useLocation();
  return <div>Path: {location.pathname}</div>;
}

describe("Router context", () => {
  it("provides router context", () => {
    render(<LocationDisplay />);
    expect(screen.getByText("Path: /"));
  });
});
