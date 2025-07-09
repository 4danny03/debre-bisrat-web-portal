import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminPrayerRequests from "../pages/admin/PrayerRequests";

describe("AdminPrayerRequests", () => {
  it("should render without crashing", () => {
    const instance = AdminPrayerRequests();
    expect(instance).toBeDefined();
  });
});
