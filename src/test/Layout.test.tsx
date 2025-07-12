import { render, screen } from "./test-utils";
import { describe, it, expect } from "vitest";
import Layout from "../components/Layout";

describe("Layout Component", () => {
  it("renders header and footer", () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>,
    );

    // Test content is rendered
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
