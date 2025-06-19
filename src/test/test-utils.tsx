/**
 * Custom test utilities for rendering React components with all providers.
 *
 * Usage:
 *   import { render } from './test-utils';
 *   render(<MyComponent />);
 *
 * This wraps components in MemoryRouter and LanguageProvider.
 */

import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../contexts/LanguageContext";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </MemoryRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
