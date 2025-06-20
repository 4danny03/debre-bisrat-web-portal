import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
  validateEmail,
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
    const memberId = url.searchParams.get("id");
    const action = url.searchParams.get("action");

    if (req.method === "GET") {
      if (action === "statistics") {
        // Get membership statistics
        const { data: stats, error } = await supabaseClient
          .from("membership_statistics")
          .select("*")
          .single();

        if (error) throw error;

        return formatSuccessResponse({ statistics: stats });
      } else if (action === "active") {
        // Get active members
        const { data: activeMembers, error } = await supabaseClient
          .from("active_members")
          .select("*")
          .limit(100);

        if (error) throw error;

        return formatSuccessResponse({ members: activeMembers });
      } else if (memberId) {
        // Get specific member
        const { data: member, error } = await supabaseClient
          .from("members")
          .select("*")
          .eq("id", memberId)
          .single();

        if (error) throw error;

        return formatSuccessResponse({ member });
      } else {
        // Get all members with pagination
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = (page - 1) * limit;
        const status = url.searchParams.get("status");
        const type = url.searchParams.get("type");

        let query = supabaseClient
          .from("members")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("membership_status", status);
        }
        if (type) {
          query = query.eq("membership_type", type);
        }

        const { data: members, error, count } = await query;

        if (error) throw error;

        return formatSuccessResponse({
          members,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }
    } else if (req.method === "POST") {
      // Create new member registration
      const memberData = await req.json();

      // Validate required fields
      if (!memberData.full_name || !memberData.email) {
        throw new Error("Full name and email are required");
      }

      // Validate email format
      if (!validateEmail(memberData.email)) {
        throw new Error("Invalid email format");
      }

      // Sanitize input data
      const sanitizedData = {
        ...memberData,
        full_name: sanitizeString(memberData.full_name, 100),
        first_name: sanitizeString(memberData.first_name, 50),
        middle_name: sanitizeString(memberData.middle_name, 50),
        last_name: sanitizeString(memberData.last_name, 50),
        email: sanitizeString(memberData.email, 100),
        phone: sanitizeString(memberData.phone, 20),
        address: sanitizeString(memberData.address, 200),
        registration_date: new Date().toISOString().split("T")[0],
        membership_status: "pending",
        integration_status: "new",
        follow_up_required: true,
        registration_ip_address:
          req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        registration_user_agent: req.headers.get("user-agent"),
        terms_accepted_at: memberData.terms_accepted
          ? new Date().toISOString()
          : null,
        privacy_policy_accepted_at: memberData.privacy_accepted
          ? new Date().toISOString()
          : null,
        data_processing_consent: memberData.data_processing_consent || false,
      };

      // Check for duplicate email
      const { data: existingMember } = await supabaseClient
        .from("members")
        .select("id")
        .eq("email", sanitizedData.email)
        .single();

      if (existingMember) {
        throw new Error("A member with this email already exists");
      }

      // Insert new member
      const { data: newMember, error } = await supabaseClient
        .from("members")
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;

      // Add to newsletter if consented
      if (memberData.newsletter_consent && memberData.email) {
        await supabaseClient.from("newsletter_subscribers").insert([
          {
            email: memberData.email,
            name: memberData.full_name,
            subscribed: true,
          },
        ]);
      }

      return formatSuccessResponse({ member: newMember }, 201);
    } else if (req.method === "PUT" && memberId) {
      // Update member
      const updates = await req.json();

      // Sanitize update data
      const sanitizedUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.full_name) {
        sanitizedUpdates.full_name = sanitizeString(updates.full_name, 100);
      }
      if (updates.email && !validateEmail(updates.email)) {
        throw new Error("Invalid email format");
      }

      const { data: updatedMember, error } = await supabaseClient
        .from("members")
        .update(sanitizedUpdates)
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ member: updatedMember });
    } else if (req.method === "DELETE" && memberId) {
      // Delete member (admin only)
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

      const { error } = await supabaseClient
        .from("members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      return formatSuccessResponse({ message: "Member deleted successfully" });
    } else if (req.method === "PATCH" && memberId && action) {
      // Special actions on members
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

      let updateData: any = { updated_at: new Date().toISOString() };

      switch (action) {
        case "approve":
          updateData.membership_status = "active";
          updateData.membership_date = new Date().toISOString().split("T")[0];
          break;
        case "reject":
          updateData.membership_status = "inactive";
          break;
        case "mark_paid":
          updateData.membership_fee_paid = true;
          updateData.payment_reference = (await req.json()).payment_reference;
          break;
        case "issue_card":
          updateData.membership_card_issued = true;
          updateData.membership_card_number = `SGEC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
          break;
        case "complete_orientation":
          updateData.orientation_completed = true;
          updateData.orientation_date = new Date().toISOString().split("T")[0];
          updateData.integration_status = "in_progress";
          break;
        case "mark_integrated":
          updateData.integration_status = "integrated";
          updateData.follow_up_required = false;
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const { data: updatedMember, error } = await supabaseClient
        .from("members")
        .update(updateData)
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;

      return formatSuccessResponse({ member: updatedMember });
    }

    return formatErrorResponse(new Error("Method not allowed"), 405);
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
