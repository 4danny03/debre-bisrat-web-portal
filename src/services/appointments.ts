// Backend service for handling appointments
import { supabase } from '../lib/supabase';

export interface Appointment {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// Call our appointment management edge function
async function callAppointmentFunction(action: string, data?: any, filters?: AppointmentFilters) {
  const { data: functionData, error } = await supabase.functions.invoke('appointment-management', {
    body: { action, data, filters },
  });
  
  if (error) throw error;
  return functionData;
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) {
  const result = await callAppointmentFunction('create', appointment);
  return result.appointment;
}

export async function getAppointments(filters?: AppointmentFilters) {
  const result = await callAppointmentFunction('list', undefined, filters);
  return result.appointments;
}

export async function updateAppointment(id: string, updateData: Partial<Appointment>) {
  const result = await callAppointmentFunction('update', { id, ...updateData });
  return result.appointment;
}

export async function deleteAppointment(id: string) {
  const result = await callAppointmentFunction('delete', { id });
  return result.success;
}

// Helper function to format appointment data from form submission
export function formatAppointmentData(formData: any): Omit<Appointment, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'> {
  return {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    service_type: formData.service_type,
    appointment_date: formData.appointment_date,
    notes: formData.notes || undefined,
  };
}
