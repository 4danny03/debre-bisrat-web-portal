
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
    const sermonId = url.searchParams.get("id");

    if (req.method === "GET") {
      // Get all sermons or a specific one
      let query = supabaseClient.from("sermons").select("*");

      if (sermonId) {
        query = query.eq("id", sermonId).single();
      } else {
        // Order by sermon date, newest first
        query = query.order("sermon_date", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return formatSuccessResponse({ sermons: data });
    } else if (req.method === "POST") {
      // Create a new sermon (admin only)
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

      const { title, scripture_reference, summary, sermon_date, audio_url, video_url } = await req.json();

      if (!title || !scripture_reference || !sermon_date) {
        throw new Error("Title, scripture reference, and sermon date are required");
      }

      const { data, error } = await supabaseClient
        .from("sermons")
        .insert({
          title,
          scripture_reference,
          summary,
          sermon_date,
          audio_url,
          video_url,
        })
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ sermon: data }, 201);
    } else if (req.method === "PUT" && sermonId) {
      // Update a sermon (admin only)
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

      const { title, scripture_reference, summary, sermon_date, audio_url, video_url } = await req.json();

      const { data, error } = await supabaseClient
        .from("sermons")
        .update({
          title,
          scripture_reference,
          summary,
          sermon_date,
          audio_url,
          video_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sermonId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ sermon: data });
    } else if (req.method === "DELETE" && sermonId) {
      // Delete a sermon (admin only)
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
        .from("sermons")
        .delete()
        .eq("id", sermonId);

      if (error) throw error;

      return formatSuccessResponse({ message: "Sermon deleted successfully" });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
