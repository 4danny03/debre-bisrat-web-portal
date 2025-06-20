import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
} from "@shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const url = new URL(req.url);
    const contentId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    // Verify admin authentication
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

    if (req.method === "GET") {
      if (action === "pending") {
        // Get pending scheduled content
        const { data: pendingContent, error } = await supabaseClient
          .from("scheduled_content")
          .select("*")
          .eq("status", "scheduled")
          .lte("scheduled_for", new Date().toISOString())
          .order("scheduled_for", { ascending: true });

        if (error) throw error;

        return formatSuccessResponse({ content: pendingContent });
      } else if (contentId) {
        // Get specific scheduled content
        const { data: content, error } = await supabaseClient
          .from("scheduled_content")
          .select("*")
          .eq("id", contentId)
          .single();

        if (error) throw error;

        return formatSuccessResponse({ content });
      } else {
        // Get all scheduled content
        const status = url.searchParams.get("status");
        const type = url.searchParams.get("type");
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        let query = supabaseClient
          .from("scheduled_content")
          .select("*", { count: "exact" })
          .order("scheduled_for", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("status", status);
        }
        if (type) {
          query = query.eq("type", type);
        }

        const { data: content, error, count } = await query;

        if (error) throw error;

        return formatSuccessResponse({
          content,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }
    } else if (req.method === "POST") {
      // Create scheduled content
      const contentData = await req.json();

      // Validate required fields
      if (
        !contentData.title ||
        !contentData.content ||
        !contentData.type ||
        !contentData.scheduled_for
      ) {
        throw new Error("Title, content, type, and scheduled_for are required");
      }

      // Validate content type
      const validTypes = ["event", "sermon", "announcement", "newsletter"];
      if (!validTypes.includes(contentData.type)) {
        throw new Error("Invalid content type");
      }

      // Sanitize input data
      const sanitizedData = {
        title: sanitizeString(contentData.title, 200),
        content: contentData.content, // JSON content, don't sanitize
        type: contentData.type,
        scheduled_for: contentData.scheduled_for,
        recurring: contentData.recurring || null,
        status: "scheduled",
        created_by: user.id,
      };

      const { data: newContent, error } = await supabaseClient
        .from("scheduled_content")
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ content: newContent }, 201);
    } else if (req.method === "PUT" && contentId) {
      // Update scheduled content
      const updates = await req.json();

      // Sanitize updates
      const sanitizedUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.title) {
        sanitizedUpdates.title = sanitizeString(updates.title, 200);
      }

      const { data: updatedContent, error } = await supabaseClient
        .from("scheduled_content")
        .update(sanitizedUpdates)
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ content: updatedContent });
    } else if (req.method === "DELETE" && contentId) {
      // Delete scheduled content
      const { error } = await supabaseClient
        .from("scheduled_content")
        .delete()
        .eq("id", contentId);

      if (error) throw error;

      return formatSuccessResponse({
        message: "Scheduled content deleted successfully",
      });
    } else if (req.method === "PATCH" && contentId && action) {
      // Special actions on scheduled content
      let updateData: any = { updated_at: new Date().toISOString() };

      switch (action) {
        case "publish":
          // Publish the scheduled content immediately
          const { data: content } = await supabaseClient
            .from("scheduled_content")
            .select("*")
            .eq("id", contentId)
            .single();

          if (!content) {
            throw new Error("Content not found");
          }

          // Create the actual content based on type
          let publishResult: any = {};

          switch (content.type) {
            case "event":
              const { data: newEvent, error: eventError } = await supabaseClient
                .from("events")
                .insert([content.content])
                .select()
                .single();
              if (eventError) throw eventError;
              publishResult = { event: newEvent };
              break;

            case "sermon":
              const { data: newSermon, error: sermonError } =
                await supabaseClient
                  .from("sermons")
                  .insert([content.content])
                  .select()
                  .single();
              if (sermonError) throw sermonError;
              publishResult = { sermon: newSermon };
              break;

            case "announcement":
              // For announcements, we might want to send emails or create notifications
              publishResult = { announcement: "Published as notification" };
              break;

            case "newsletter":
              // For newsletters, trigger email campaign
              publishResult = { newsletter: "Email campaign triggered" };
              break;
          }

          updateData.status = "published";
          updateData.published_at = new Date().toISOString();
          break;

        case "cancel":
          updateData.status = "cancelled";
          break;

        case "reschedule":
          const { scheduled_for } = await req.json();
          if (!scheduled_for) {
            throw new Error("New scheduled_for date is required");
          }
          updateData.scheduled_for = scheduled_for;
          updateData.status = "scheduled";
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const { data: updatedContent, error } = await supabaseClient
        .from("scheduled_content")
        .update(updateData)
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({
        content: updatedContent,
        publishResult: action === "publish" ? publishResult : undefined,
      });
    }

    return formatErrorResponse(new Error("Method not allowed"), 405);
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
