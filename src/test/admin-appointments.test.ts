import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminAppointments from "../pages/admin/Appointments";

describe("AdminAppointments", () => {
  it("should render without crashing", () => {
    const instance = AdminAppointments({});
    expect(instance).toBeDefined();
  });
});
