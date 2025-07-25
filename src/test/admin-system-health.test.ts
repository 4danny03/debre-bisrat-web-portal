import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminSystemHealth from "../pages/admin/SystemHealth";

describe("AdminSystemHealth", () => {
  it("should render without crashing", () => {
    const instance = AdminSystemHealth();
    expect(instance).toBeDefined();
  });
});
