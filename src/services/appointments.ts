// Backend service for handling appointments
import { supabase } from "../lib/supabase";

export interface Appointment {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// Call our appointment management edge function
async function callAppointmentFunction<
  T = any,
  R = any
>(
  action: string,
  data?: T,
  filters?: AppointmentFilters,
): Promise<R> {
  const { data: functionData, error } = await supabase.functions.invoke(
    "appointment-management",
    {
      body: { action, data, filters },
    },
  );

  if (error) throw error;
  return functionData as R;
}

export async function createAppointment(
  appointment: Omit<
    Appointment,
    "id" | "user_id" | "status" | "created_at" | "updated_at"
  >,
): Promise<Appointment> {
  const result = await callAppointmentFunction<typeof appointment, { appointment: Appointment }>("create", appointment);
  return result.appointment;
}

export async function getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
  const result = await callAppointmentFunction<undefined, { appointments: Appointment[] }>("list", undefined, filters);
  return result.appointments;
}

export async function updateAppointment(
  id: string,
  updateData: Partial<Appointment>,
): Promise<Appointment> {
  const result = await callAppointmentFunction<{ id: string } & Partial<Appointment>, { appointment: Appointment }>("update", { id, ...updateData });
  return result.appointment;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const result = await callAppointmentFunction<{ id: string }, { success: boolean }>("delete", { id });
  return result.success;
}

// Helper function to format appointment data from form submission
export function formatAppointmentData(
  formData: Record<string, unknown>,
): Omit<
  Appointment,
  "id" | "user_id" | "status" | "created_at" | "updated_at"
> {
  return {
    name: String(formData.name ?? ""),
    email: String(formData.email ?? ""),
    phone: String(formData.phone ?? ""),
    service_type: String(formData.service_type ?? ""),
    appointment_date: String(formData.appointment_date ?? ""),
    notes: typeof formData.notes === "string" ? formData.notes : undefined,
  };
}
