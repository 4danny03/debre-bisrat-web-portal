import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "@shared/utils.ts";

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
      // Get all sermons or a specific sermon
      let query = supabaseClient.from("sermons").select("*");

      if (sermonId) {
        query = query.eq("id", sermonId).single();
      } else {
        // Apply filters if provided
        const featured = url.searchParams.get("featured");
        const limit = url.searchParams.get("limit");

        if (featured === "true") {
          query = query.eq("is_featured", true);
        }

        // Order by sermon date, newest first
        query = query.order("sermon_date", { ascending: false });

        if (limit) {
          query = query.limit(parseInt(limit));
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return formatSuccessResponse({ sermons: data });
    } else if (req.method === "POST") {
      // Create a new sermon
      const {
        title,
        description,
        scripture_reference,
        audio_url,
        preacher,
        sermon_date,
        is_featured,
      } = await req.json();

      if (!title || !sermon_date) {
        throw new Error("Title and sermon date are required");
      }

      const { data, error } = await supabaseClient
        .from("sermons")
        .insert({
          title,
          description,
          scripture_reference,
          audio_url,
          preacher,
          sermon_date,
          is_featured: is_featured || false,
        })
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ sermon: data }, 201);
    } else if (req.method === "PUT" && sermonId) {
      // Update a sermon
      const {
        title,
        description,
        scripture_reference,
        audio_url,
        preacher,
        sermon_date,
        is_featured,
      } = await req.json();

      const { data, error } = await supabaseClient
        .from("sermons")
        .update({
          title,
          description,
          scripture_reference,
          audio_url,
          preacher,
          sermon_date,
          is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sermonId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ sermon: data });
    } else if (req.method === "DELETE" && sermonId) {
      // Delete a sermon
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
    return formatErrorResponse(error);
  }
});
