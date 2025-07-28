import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const { action, member_data, member_id, update_data } = await req.json();

    switch (action) {
      case "create_member": {
        // Create new member record
        const { data: member, error } = await supabaseClient
          .from("members")
          .insert({
            ...member_data,
            membership_status: "pending",
            join_date: new Date().toISOString().split("T")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating member:", error);
          throw new Error(`Failed to create member: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, member }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "update_member": {
        if (!member_id) {
          throw new Error("Member ID is required for update");
        }

        const { data: member, error } = await supabaseClient
          .from("members")
          .update({
            ...update_data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", member_id)
          .select()
          .single();

        if (error) {
          console.error("Error updating member:", error);
          throw new Error(`Failed to update member: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, member }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_member": {
        if (!member_id) {
          throw new Error("Member ID is required");
        }

        const { data: member, error } = await supabaseClient
          .from("members")
          .select("*")
          .eq("id", member_id)
          .single();

        if (error) {
          console.error("Error fetching member:", error);
          throw new Error(`Failed to fetch member: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, member }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "list_members": {
        const { data: members, error } = await supabaseClient
          .from("members")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching members:", error);
          throw new Error(`Failed to fetch members: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, members }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "activate_membership": {
        if (!member_id) {
          throw new Error("Member ID is required");
        }

        const { data: member, error } = await supabaseClient
          .from("members")
          .update({
            membership_status: "active",
            membership_date: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          })
          .eq("id", member_id)
          .select()
          .single();

        if (error) {
          console.error("Error activating membership:", error);
          throw new Error(`Failed to activate membership: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, member }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Membership management error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
