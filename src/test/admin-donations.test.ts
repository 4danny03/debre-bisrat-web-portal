import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminDonations from "../pages/admin/Donations";

describe("AdminDonations", () => {
  it("should render without crashing", () => {
    const instance = AdminDonations();
    expect(instance).toBeDefined();
  });
});
