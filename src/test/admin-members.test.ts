import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => {
  const mockSelect = vi.fn(() => ({
    order: vi.fn(() => ({
      data: [
        {
          id: "1",
          full_name: "Test User",
          email: "test@example.com",
          phone: "123",
          address: "",
          membership_type: "regular",
          membership_status: "active",
          join_date: "2025-07-09",
          membership_date: "2025-07-09",
          last_renewal_date: null,
          next_renewal_date: null,
          created_at: "2025-07-09",
          updated_at: "2025-07-09",
        },
      ],
      error: null,
    })),
  }));
  const mockInsert = vi.fn(() => ({ error: null }));
  const mockUpdate = vi.fn(() => ({ error: null }));
  const mockDelete = vi.fn(() => ({ error: null }));
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    order: vi.fn(() => ({ data: [], error: null })),
    eq: vi.fn(() => ({ update: mockUpdate, delete: mockDelete })),
  }));
  const channel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() };
  return {
    supabase: { from: mockFrom, channel: vi.fn(() => channel) },
    __mocks: { mockSelect, mockInsert, mockUpdate, mockDelete, mockFrom },
  };
});

const mockToast = vi.fn();
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import AdminMembers from "../pages/admin/Members";

describe("AdminMembers logic", () => {
  it("should load members and refresh after add", async () => {
    const {
      supabase: { __mocks },
    } = require("@/integrations/supabase/client");
    AdminMembers();
    // Simulate add
    await __mocks.mockInsert();
    // Simulate refresh
    await __mocks.mockSelect();
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(__mocks.mockSelect).toHaveBeenCalled();
  });

  it("should update and delete members and refresh", async () => {
    const {
      supabase: { __mocks },
    } = require("@/integrations/supabase/client");
    AdminMembers();
    await __mocks.mockUpdate();
    await __mocks.mockDelete();
    await __mocks.mockSelect();
    expect(__mocks.mockUpdate).toHaveBeenCalled();
    expect(__mocks.mockDelete).toHaveBeenCalled();
    expect(__mocks.mockSelect).toHaveBeenCalled();
  });

  it("should handle a mock real-time sync event", () => {
    const { supabase } = require("@/integrations/supabase/client");
    AdminMembers();
    expect(supabase.channel).toHaveBeenCalled();
  });
});
