// Backend service for handling appointments
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Appointment {
  name: string;
  email: string;
  phone: string;
  service_title: string;
  requested_date: string;
  requested_time: string;
  notes?: string;
  status?: string;
}

export async function createAppointment(appointment: Appointment) {
  const { data, error } = await supabase
    .from("appointments")
    .insert([{ ...appointment }]);
  if (error) throw error;
  return data;
}

export async function getAppointments() {
  const { data, error } = await supabase.from("appointments").select("*");
  if (error) throw error;
  return data;
}
