import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminEvents from "../pages/admin/Events";

describe("AdminEvents", () => {
  it("should render without crashing", () => {
    const instance = AdminEvents();
    expect(instance).toBeDefined();
  });
});
