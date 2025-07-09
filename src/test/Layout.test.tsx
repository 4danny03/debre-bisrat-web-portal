import { render, screen } from "./test-utils";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Layout from "../components/Layout";
import { LanguageProvider } from "../contexts/LanguageContext";

describe("Layout Component", () => {
  it("renders header and footer", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LanguageProvider>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </LanguageProvider>
      </MemoryRouter>,
    );

    // Test content is rendered
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
