import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
  validateEmail,
  checkRateLimit,
} from "@shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const url = new URL(req.url);
    const requestId = url.searchParams.get("id");

    if (req.method === "GET") {
      // Check if user is admin
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization header is required");
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
        throw new Error("Unauthorized: Admin access required");
      }

      // Get all prayer requests or a specific one
      let query = supabaseClient.from("prayer_requests").select("*");

      if (requestId) {
        query = query.eq("id", requestId).single();
      } else {
        // Order by creation date, newest first
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return formatSuccessResponse({ prayer_requests: data });
    } else if (req.method === "POST") {
      // Create a new prayer request
      const { name, email, request, is_public } = await req.json();

      if (!name || !request) {
        throw new Error("Name and prayer request are required");
      }

      // Rate limiting for prayer request submissions
      const clientIP =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";
      if (!checkRateLimit(`prayer_${clientIP}`, 5, 300000)) {
        // 5 requests per 5 minutes
        throw new Error(
          "Too many prayer requests. Please wait before submitting another.",
        );
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      const { data, error } = await supabaseClient
        .from("prayer_requests")
        .insert({
          name: sanitizeString(name, 100),
          email: email ? sanitizeString(email, 100) : null,
          request: sanitizeString(request, 1000),
          is_public: is_public || false,
        })
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ prayer_request: data }, 201);
    } else if (req.method === "PUT" && requestId) {
      // Update a prayer request (admin only)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization header is required");
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
        throw new Error("Unauthorized: Admin access required");
      }

      const { is_answered } = await req.json();

      const { data, error } = await supabaseClient
        .from("prayer_requests")
        .update({
          is_answered,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ prayer_request: data });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
