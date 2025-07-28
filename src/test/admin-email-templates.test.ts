import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminEmailTemplates from "../pages/admin/EmailTemplates";

describe("AdminEmailTemplates", () => {
  it("should render without crashing", () => {
    const instance = AdminEmailTemplates();
    expect(instance).toBeDefined();
  });
});
