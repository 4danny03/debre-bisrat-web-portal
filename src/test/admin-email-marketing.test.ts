import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminEmailMarketing from "../pages/admin/EmailMarketing";

describe("AdminEmailMarketing", () => {
  it("should render without crashing", () => {
    const instance = AdminEmailMarketing();
    expect(instance).toBeDefined();
  });
});
