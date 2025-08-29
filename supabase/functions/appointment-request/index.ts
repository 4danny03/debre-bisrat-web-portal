import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Ensure only POST requests are accepted
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    // Parse the incoming request body
    const {
      name,
      email,
      phone,
      service_title,
      requested_date,
      requested_time,
      notes,
    } = await req.json();

    // Validate required fields
    if (
      !name ||
      !email ||
      !requested_date ||
      !requested_time ||
      !service_title
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create Supabase client with service role key
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseKey) {
      return new Response(
        JSON.stringify({
          error: "SUPABASE_SERVICE_KEY is not set in environment",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      supabaseKey,
    );

    // Insert appointment request
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        name,
        email,
        phone: phone || null,
        service_title,
        requested_date,
        requested_time,
        status: "pending",
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Fire notifications to admins and user via notify-emails router
    try {
      await supabase.functions.invoke("notify-emails", {
        body: {
          type: "appointment.requested",
          payload: {
            email,
            name,
            phone: phone || undefined,
            datetime: `${requested_date} ${requested_time}`,
            message: notes || undefined,
          },
        },
      });
    } catch (notifyErr) {
      console.error("Failed to send appointment notifications:", notifyErr);
    }

    // Return successful response
    return new Response(JSON.stringify({ success: true, appointment: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (err) {
    console.error("Appointment request error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to create appointment request",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
