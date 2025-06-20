import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
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

      const {
        title,
        scripture_reference,
        description,
        sermon_date,
        audio_url,
        preacher,
        is_featured,
      } = await req.json();

      if (!title || !scripture_reference || !sermon_date) {
        throw new Error(
          "Title, scripture reference, and sermon date are required",
        );
      }

      const { data, error } = await supabaseClient
        .from("sermons")
        .insert({
          title: sanitizeString(title, 200),
          scripture_reference: sanitizeString(scripture_reference, 200),
          description: description ? sanitizeString(description, 1000) : null,
          sermon_date,
          audio_url: audio_url ? sanitizeString(audio_url, 500) : null,
          preacher: preacher ? sanitizeString(preacher, 100) : null,
          is_featured: is_featured || false,
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

      const {
        title,
        scripture_reference,
        description,
        sermon_date,
        audio_url,
        preacher,
        is_featured,
      } = await req.json();

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (title) updateData.title = sanitizeString(title, 200);
      if (scripture_reference)
        updateData.scripture_reference = sanitizeString(
          scripture_reference,
          200,
        );
      if (description !== undefined)
        updateData.description = description
          ? sanitizeString(description, 1000)
          : null;
      if (sermon_date) updateData.sermon_date = sermon_date;
      if (audio_url !== undefined)
        updateData.audio_url = audio_url
          ? sanitizeString(audio_url, 500)
          : null;
      if (preacher !== undefined)
        updateData.preacher = preacher ? sanitizeString(preacher, 100) : null;
      if (is_featured !== undefined) updateData.is_featured = is_featured;

      const { data, error } = await supabaseClient
        .from("sermons")
        .update(updateData)
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
