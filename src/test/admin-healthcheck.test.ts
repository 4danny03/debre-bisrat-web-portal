import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminHealthCheck from "../pages/admin/HealthCheck";

describe("AdminHealthCheck", () => {
  it("should render without crashing", () => {
    const instance = AdminHealthCheck();
    expect(instance).toBeDefined();
  });
});
