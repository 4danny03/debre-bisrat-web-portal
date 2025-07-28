import { describe, it, expect, vi } from "vitest";
import * as appointments from "../services/appointments";

vi.mock("../lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(async (fn, { body }) => {
        if (fn === "supabase-functions-appointment-request") {
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
          if (body.action === "update") {
            return { data: { appointment: { ...body.data } }, error: null };
          }
          if (body.action === "delete") {
            return { data: { success: true }, error: null };
          }
        }
        return { data: null, error: null };
      }),
    },
  },
}));

describe("appointments service", () => {
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

  it("should update an appointment", async () => {
    const result = await appointments.updateAppointment("test-id", {
      notes: "Updated",
    });
    expect(result).toHaveProperty("notes", "Updated");
  });

  it("should delete an appointment", async () => {
    const result = await appointments.deleteAppointment("test-id");
    expect(result).toBe(true);
  });

  it("should format appointment data", () => {
    const formData = {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      service_type: "baptism",
      appointment_date: "2025-07-10",
      notes: "Test note",
    };
    const formatted = appointments.formatAppointmentData(formData);
    expect(formatted).toMatchObject(formData);
  });
});
