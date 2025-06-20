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
    const testimonialId = url.searchParams.get("id");

    if (req.method === "GET") {
      // Get all testimonials or a specific one
      let query = supabaseClient.from("testimonials").select("*");

      if (testimonialId) {
        query = query.eq("id", testimonialId).single();
      } else {
        // Order by creation date, newest first
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return formatSuccessResponse({ testimonials: data });
    } else if (req.method === "POST") {
      // Create a new testimonial
      const { name, email, content } = await req.json();

      if (!name || !content) {
        throw new Error("Name and testimonial content are required");
      }

      // Rate limiting for testimonial submissions
      const clientIP =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";
      if (!checkRateLimit(`testimonial_${clientIP}`, 3, 300000)) {
        // 3 requests per 5 minutes
        throw new Error(
          "Too many testimonials. Please wait before submitting another.",
        );
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      const { data, error } = await supabaseClient
        .from("testimonials")
        .insert({
          name: sanitizeString(name, 100),
          content: sanitizeString(content, 1000),
          is_approved: false, // All testimonials need approval
        })
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ testimonial: data }, 201);
    } else if (req.method === "PUT" && testimonialId) {
      // Update a testimonial (admin only)
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

      const { is_approved } = await req.json();

      const { data, error } = await supabaseClient
        .from("testimonials")
        .update({
          is_approved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testimonialId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ testimonial: data });
    } else if (req.method === "DELETE" && testimonialId) {
      // Delete a testimonial (admin only)
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

      const { error } = await supabaseClient
        .from("testimonials")
        .delete()
        .eq("id", testimonialId);

      if (error) throw error;

      return formatSuccessResponse({
        message: "Testimonial deleted successfully",
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
