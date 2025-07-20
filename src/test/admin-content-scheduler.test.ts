import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminContentScheduler from "../pages/admin/ContentScheduler";

describe("AdminContentScheduler", () => {
  it("should render without crashing", () => {
    const instance = AdminContentScheduler();
    expect(instance).toBeDefined();
  });
});
