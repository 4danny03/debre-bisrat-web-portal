import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminLogin from "../pages/admin/Login";

describe("AdminLogin", () => {
  it("should render without crashing", () => {
    const instance = AdminLogin();
    expect(instance).toBeDefined();
  });
});
