// Use relative imports for shared modules
import { corsHeaders } from "../_shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
  validateEmail,
} from "../_shared/utils.ts";
// Use the original Supabase client import (update if you have a local Deno-compatible version)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define types for member data and updates
interface MemberData {
  full_name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  data_processing_consent?: boolean;
  newsletter_consent?: boolean;
  [key: string]: any;
}

interface MemberUpdate {
  full_name?: string;
  email?: string;
  [key: string]: any;
}

// --- Helper: Send notification (stub, replace with actual email/SMS integration) ---
async function sendNotification(type: string, payload: any) {
  // TODO: Integrate with email/SMS provider or Supabase function
  console.log(`[Notification] Type: ${type}`, payload);
}
// --- Helper: Log audit events ---
async function logAudit(action: string, entity: string, entityId: string, userId?: string) {
  // TODO: Insert into audit_log table or external logging
  console.log(`[Audit] ${action} on ${entity} (${entityId}) by ${userId ?? 'public'}`);
}
// --- Helper: Rate limiting (simple in-memory, replace with Redis for prod) ---
const rateLimitMap = new Map<string, { count: number; last: number }>();
function isRateLimited(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > windowMs) {
    rateLimitMap.set(ip, { count: 1, last: now });
    return false;
  }
  if (entry.count >= limit) return true;
  rateLimitMap.set(ip, { count: entry.count + 1, last: entry.last });
  return false;
}

// @ts-expect-error Deno global is available in Supabase Edge runtime
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === "/health") {
    // Health check endpoint
    return new Response(
      JSON.stringify({ status: "ok", time: new Date().toISOString() }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;
  try {
    const supabaseClient = createClient(
      // @ts-expect-error Deno global is available in Supabase Edge runtime
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-expect-error Deno global is available in Supabase Edge runtime
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );
    const memberId = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    if (req.method === "POST") {
      // Rate limit public registration
      if (isRateLimited(ip)) {
        throw new Error('Too many requests. Please try again later.');
      }
      // Create new member registration
      const memberData = (await req.json()) as MemberData;

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
        first_name: sanitizeString(memberData.first_name ?? "", 50),
        middle_name: sanitizeString(memberData.middle_name ?? "", 50),
        last_name: sanitizeString(memberData.last_name ?? "", 50),
        email: sanitizeString(memberData.email, 100),
        phone: sanitizeString(memberData.phone ?? "", 20),
        address: sanitizeString(memberData.address ?? "", 200),
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

      // Audit log
      await logAudit('create', 'member', newMember.id);
      // Send welcome email
      await sendNotification('welcome_email', { email: newMember.email, name: newMember.full_name });

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
      const updates = (await req.json()) as MemberUpdate;

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
      await logAudit('update', 'member', memberId);
      // Send profile update notification
      await sendNotification('profile_updated', { email: updatedMember.email, name: updatedMember.full_name });
      return formatSuccessResponse({ member: updatedMember });
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
          // Generate digital membership card
          updateData.membership_card_issued = true;
          updateData.membership_card_number = `SGEC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
          // Send approval and card notification
          await sendNotification('membership_approved', { memberId, card: updateData.membership_card_number });
          break;
        case "reject":
          updateData.membership_status = "inactive";
          await sendNotification('membership_rejected', { memberId });
          break;
        case "mark_paid": {
          updateData.membership_fee_paid = true;
          const body = (await req.json()) as { payment_reference?: string };
          updateData.payment_reference = body.payment_reference;
          await sendNotification('membership_fee_paid', { memberId });
          break;
        }
        case "issue_card":
          updateData.membership_card_issued = true;
          updateData.membership_card_number = `SGEC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
          await sendNotification('membership_card_issued', { memberId, card: updateData.membership_card_number });
          break;
        case "complete_orientation":
          updateData.orientation_completed = true;
          updateData.orientation_date = new Date().toISOString().split("T")[0];
          updateData.integration_status = "in_progress";
          await sendNotification('orientation_completed', { memberId });
          break;
        case "mark_integrated":
          updateData.integration_status = "integrated";
          updateData.follow_up_required = false;
          await sendNotification('integration_completed', { memberId });
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
      await logAudit('patch', 'member', memberId);
      return formatSuccessResponse({ member: updatedMember });
    }

    return formatErrorResponse(new Error("Method not allowed"), 405);
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
});
// API versioning, monitoring, and renewal reminders can be expanded here
