import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import Dashboard from "../pages/admin/Dashboard";

describe("Dashboard", () => {
  it("should render without crashing", () => {
    const instance = Dashboard();
    expect(instance).toBeDefined();
  });
});
