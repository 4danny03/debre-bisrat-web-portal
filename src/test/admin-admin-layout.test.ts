import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminLayout from "../pages/admin/AdminLayout";

describe("AdminLayout", () => {
  it("should render without crashing", () => {
    const instance = AdminLayout();
    expect(instance).toBeDefined();
  });
});
