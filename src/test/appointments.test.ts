import { describe, it, expect, vi } from "vitest";
import * as appointments from "../services/appointments";

// Mock supabase client
vi.mock("../lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(async (fn, { body }) => {
        if (fn === "appointment-management") {
          if (body.action === "create") {
            return {
              data: { appointment: { ...body.data, id: "test-id" } },
              error: null,
            };
          }
          if (body.action === "list") {
            return {
              data: { appointments: [{ id: "test-id", name: "Test User" }] },
              error: null,
            };
          }
        }
        return { data: null, error: null };
      }),
    },
  },
}));

describe("Appointment Service", () => {
  it("should create an appointment", async () => {
    const appointment = {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      service_type: "baptism",
      appointment_date: "2025-07-10",
      notes: "Test note",
    };
    const result = await appointments.createAppointment(appointment);
    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Test User");
  });

  it("should list appointments", async () => {
    const result = await appointments.getAppointments();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("id");
  });
});
