import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
  validateEmail,
  checkRateLimit,
} from "@shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface AppointmentRequest {
  name: string;
  email: string;
  phone: string;
  service_title: string;
  requested_date: string;
  requested_time: string;
  notes?: string;
}

// Input validation helper
function validateAppointmentInput(data: AppointmentRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Validate email format
  if (!validateEmail(data.email)) {
    errors.push("Invalid email format");
  }

  // Validate phone number
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!data.phone || !phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ""))) {
    errors.push("Invalid phone number format");
  }

  // Validate service title
  const validServices = [
    "Marriage Ceremony",
    "ጋብቻ መፈፀም",
    "Funeral Prayer",
    "ጸሎተ ፍትሐት",
    "Counseling Services",
    "የምክር አገልግሎት",
    "Qendil Prayer",
    "ጸሎተ ቀንዲል",
    "Qeder Baptism",
    "የቄደር ጥምቀት",
    "Christian Initiation",
    "ክርስትና ማስነሳት",
  ];
  if (!data.service_title || !validServices.includes(data.service_title)) {
    errors.push("Invalid service selection");
  }

  // Validate requested date (must be future date)
  const requestedDate = new Date(data.requested_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!data.requested_date || requestedDate < today) {
    errors.push("Requested date must be in the future");
  }

  // Validate requested time
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!data.requested_time || !timeRegex.test(data.requested_time)) {
    errors.push("Invalid time format (HH:MM required)");
  }

  return { isValid: errors.length === 0, errors };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  // Rate limiting
  const clientIP =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(clientIP, 5, 60000)) {
    return formatErrorResponse(new Error("Rate limit exceeded"), 429);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (req.method === "GET") {
      if (appointmentId) {
        // Get specific appointment
        const { data: appointment, error } = await supabaseClient
          .from("appointments")
          .select(
            `
            *,
            responded_by_profile:profiles!appointments_responded_by_fkey(email)
          `,
          )
          .eq("id", appointmentId)
          .single();

        if (error) throw error;

        return formatSuccessResponse({ appointment });
      } else {
        // Get all appointments with pagination
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = (page - 1) * limit;
        const status = url.searchParams.get("status");

        let query = supabaseClient
          .from("appointments")
          .select(
            `
            *,
            responded_by_profile:profiles!appointments_responded_by_fkey(email)
          `,
            { count: "exact" },
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("status", status);
        }

        const { data: appointments, error, count } = await query;

        if (error) throw error;

        return formatSuccessResponse({
          appointments,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }
    } else if (req.method === "POST") {
      // Create new appointment request
      const appointmentData: AppointmentRequest = await req.json();

      // Validate input data
      const validation = validateAppointmentInput(appointmentData);
      if (!validation.isValid) {
        return new Response(
          JSON.stringify({ error: validation.errors.join(", ") }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Sanitize input data
      const sanitizedData = {
        name: sanitizeString(appointmentData.name, 100),
        email: sanitizeString(appointmentData.email, 100),
        phone: sanitizeString(appointmentData.phone, 20),
        service_title: sanitizeString(appointmentData.service_title, 100),
        requested_date: appointmentData.requested_date,
        requested_time: appointmentData.requested_time,
        notes: appointmentData.notes
          ? sanitizeString(appointmentData.notes, 500)
          : null,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check for duplicate appointment (same person, same service, same date)
      const { data: existingAppointment } = await supabaseClient
        .from("appointments")
        .select("id")
        .eq("email", sanitizedData.email)
        .eq("service_title", sanitizedData.service_title)
        .eq("requested_date", sanitizedData.requested_date)
        .eq("status", "pending")
        .single();

      if (existingAppointment) {
        throw new Error(
          "You already have a pending appointment for this service on this date",
        );
      }

      // Insert new appointment
      const { data: newAppointment, error } = await supabaseClient
        .from("appointments")
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ appointment: newAppointment }, 201);
    } else if (req.method === "PUT" && appointmentId) {
      // Update appointment (admin only)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization required");
      }

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser(token);

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const updates = await req.json();
      const sanitizedUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedAppointment, error } = await supabaseClient
        .from("appointments")
        .update(sanitizedUpdates)
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ appointment: updatedAppointment });
    } else if (req.method === "PATCH" && appointmentId && action) {
      // Special actions on appointments (admin only)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization required");
      }

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser(token);

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      const requestBody = await req.json();
      let updateData: any = {
        updated_at: new Date().toISOString(),
        responded_by: user.id,
        responded_at: new Date().toISOString(),
      };

      switch (action) {
        case "approve":
          updateData.status = "approved";
          updateData.admin_response =
            requestBody.admin_response || "Your appointment has been approved.";
          updateData.confirmed_date = requestBody.confirmed_date || null;
          updateData.confirmed_time = requestBody.confirmed_time || null;
          updateData.admin_notes = requestBody.admin_notes || null;
          break;
        case "reject":
          updateData.status = "rejected";
          updateData.admin_response =
            requestBody.admin_response ||
            "Your appointment request has been declined.";
          updateData.admin_notes = requestBody.admin_notes || null;
          break;
        case "complete":
          updateData.status = "completed";
          updateData.admin_response =
            requestBody.admin_response ||
            "Your appointment has been completed.";
          updateData.admin_notes = requestBody.admin_notes || null;
          break;
        case "reschedule":
          updateData.status = "approved";
          updateData.confirmed_date = requestBody.confirmed_date;
          updateData.confirmed_time = requestBody.confirmed_time;
          updateData.admin_response =
            requestBody.admin_response ||
            "Your appointment has been rescheduled.";
          updateData.admin_notes = requestBody.admin_notes || null;
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const { data: updatedAppointment, error } = await supabaseClient
        .from("appointments")
        .update(updateData)
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ appointment: updatedAppointment });
    } else if (req.method === "DELETE" && appointmentId) {
      // Delete appointment (admin only)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization required");
      }

      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser(token);

      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { error } = await supabaseClient
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      return formatSuccessResponse({
        message: "Appointment deleted successfully",
      });
    }

    return formatErrorResponse(new Error("Method not allowed"), 405);
  } catch (error) {
    console.error("Appointment request error:", error);
    return formatErrorResponse(error as Error);
  }
});
