import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminTestimonials from "../pages/admin/Testimonials";

describe("AdminTestimonials", () => {
  it("should render without crashing", () => {
    const instance = AdminTestimonials();
    expect(instance).toBeDefined();
  });
});
