import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import AdminBulkOperations from "../pages/admin/BulkOperations";

describe("AdminBulkOperations", () => {
  it("should render without crashing", () => {
    const instance = AdminBulkOperations();
    expect(instance).toBeDefined();
  });
});
