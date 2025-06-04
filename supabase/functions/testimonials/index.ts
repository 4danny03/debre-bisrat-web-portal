
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function handleCorsOptions(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

function formatErrorResponse(error: Error, status = 400) {
  console.error(`Error: ${error.message}`);
  return new Response(
    JSON.stringify({
      error: error.message,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

function formatSuccessResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
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
      const { name, email, testimony, is_public } = await req.json();

      if (!name || !testimony) {
        throw new Error("Name and testimony are required");
      }

      const { data, error } = await supabaseClient
        .from("testimonials")
        .insert({
          name,
          email,
          testimony,
          is_public: is_public || false,
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

      const { is_approved, is_public } = await req.json();

      const { data, error } = await supabaseClient
        .from("testimonials")
        .update({
          is_approved,
          is_public,
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

      return formatSuccessResponse({ message: "Testimonial deleted successfully" });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
