import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminUsers from "../pages/admin/Users";

describe("AdminUsers", () => {
  it("should render without crashing", () => {
    const instance = AdminUsers();
    expect(instance).toBeDefined();
  });
});
