import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminGallery from "../pages/admin/Gallery";

describe("AdminGallery", () => {
  it("should render without crashing", () => {
    const instance = AdminGallery();
    expect(instance).toBeDefined();
  });
});
