import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (req.method === "POST") {
      const body = await req.json();
      const { name, email, subject, message } = body;
      if (!name || !email || !subject || !message) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Store in DB
      const { error: dbError } = await supabaseClient.from("contact_messages").insert({
        name, email, subject, message, created_at: new Date().toISOString()
      });
      if (dbError) {
        throw new Error(`Failed to save message: ${dbError.message}`);
      }

      // TODO: Integrate with email provider or Supabase SMTP if needed

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin: fetch all messages (GET)
    if (req.method === "GET") {
      // Optionally: add admin auth check here
      const { data, error } = await supabaseClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }
      return new Response(JSON.stringify({ success: true, messages: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    const message = typeof error === "object" && error && "message" in error ? (error as any).message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
