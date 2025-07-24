import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminSettings from "../pages/admin/Settings";

describe("AdminSettings", () => {
  it("should render without crashing", () => {
    const instance = AdminSettings();
    expect(instance).toBeDefined();
  });
});
