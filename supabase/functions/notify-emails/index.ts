// supabase/functions/notify-emails/index.ts
// Server-side router that sends emails via Resend based on event type.

type EmailArgs = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  cc?: string | string[];
  bcc?: string | string[];
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!; // e.g. 'St. Gabriel <noreply@stgabrielmd.org>'
const ADMIN_EMAILS = JSON.parse(
  Deno.env.get("ADMIN_EMAILS") || "[]",
) as string[];

// Track email sending for rate limiting
const emailSendLog = new Map<string, { count: number; timestamp: number }>();

async function sendEmail({
  to,
  subject,
  html,
  text,
  reply_to,
  cc,
  bcc,
}: EmailArgs) {
  // Rate limiting check - max 50 emails per hour per recipient domain
  if (Array.isArray(to) && to.length > 0) {
    const domain = to[0].split("@")[1];
    const now = Date.now();
    const hourAgo = now - 3600000;

    const log = emailSendLog.get(domain) || { count: 0, timestamp: now };

    // Reset counter if it's been more than an hour
    if (log.timestamp < hourAgo) {
      log.count = 1;
      log.timestamp = now;
    } else {
      log.count++;

      // Check if we've hit the limit
      if (log.count > 50) {
        console.warn(
          `Rate limit exceeded for domain ${domain}. Skipping email send.`,
        );
        return { id: null, message: "Rate limit exceeded" };
      }
    }

    emailSendLog.set(domain, log);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html ?? (text ? `<pre>${text}</pre>` : "<p>(no content)</p>"),
        text,
        reply_to,
        cc,
        bcc,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend error", res.status, body);
      throw new Error(`Resend failed: ${res.status} - ${body}`);
    }

    const data = await res.json();
    console.log(
      `Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`,
    );
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

type Event =
  | {
      type: "user.registered";
      payload: {
        email: string;
        name?: string;
        phone?: string;
        membershipType?: string;
        memberId?: string;
      };
    }
  | {
      type: "membership.pending_payment";
      payload: {
        email: string;
        name?: string;
        membershipType?: string;
        amount?: string;
        checkoutUrl?: string;
      };
    }
  | {
      type: "appointment.requested";
      payload: {
        email: string;
        name?: string;
        phone?: string;
        datetime?: string;
        message?: string;
      };
    }
  | {
      type: "donation.created"; // includes membership fee success
      payload: {
        amount: number;
        currency: string;
        donorEmail: string;
        donorName?: string;
        purpose?: string;
        receiptUrl?: string;
      };
    }
  | {
      type: "membership.payment_confirmed";
      payload: {
        email: string;
        name?: string;
        amount: number;
        currency: string;
        receiptUrl?: string;
      };
    };

// Import email templates
import { templates } from "./templates.ts";

Deno.serve(async (req) => {
  // Add CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST")
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });

  let evt: Event;
  try {
    evt = await req.json();
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate event type
  if (!evt.type || !evt.payload) {
    return new Response(
      JSON.stringify({
        error: "Invalid event format: missing type or payload",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const results = [];

    switch (evt.type) {
      case "user.registered": {
        // Admin notification
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: "New membership registration",
          html: templates.userRegistration.admin(evt.payload),
        });
        results.push({ recipient: "admin", result: adminResult });

        // User welcome
        const userResult = await sendEmail({
          to: evt.payload.email,
          subject: "Welcome to St. Gabriel Church",
          html: templates.userRegistration.user(evt.payload),
        });
        results.push({ recipient: "user", result: userResult });
        break;
      }

      case "membership.pending_payment": {
        // User reminder with checkout link
        const userResult = await sendEmail({
          to: evt.payload.email,
          subject: "Complete your membership payment",
          html: templates.membershipPayment.pending(evt.payload),
        });
        results.push({ recipient: "user", result: userResult });

        // Notify admins
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: "Membership pending payment",
          html: `
            <p>${evt.payload.name || evt.payload.email} started checkout.</p>
            <p>Type: ${evt.payload.membershipType || "—"}, Amount: ${evt.payload.amount || "—"}</p>
            ${evt.payload.checkoutUrl ? `<p><a href="${evt.payload.checkoutUrl}">View Checkout</a></p>` : ""}
          `,
        });
        results.push({ recipient: "admin", result: adminResult });
        break;
      }

      case "appointment.requested": {
        // Admins
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: `Appointment request from ${evt.payload.name || evt.payload.email}`,
          html: templates.appointmentRequest.admin(evt.payload),
          reply_to: evt.payload.email,
        });
        results.push({ recipient: "admin", result: adminResult });

        // User confirmation
        const userResult = await sendEmail({
          to: evt.payload.email,
          subject: "We received your appointment request",
          html: templates.appointmentRequest.user(evt.payload),
        });
        results.push({ recipient: "user", result: userResult });
        break;
      }

      case "donation.created": {
        // Admins
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: `New ${evt.payload.purpose || "donation"}: ${new Intl.NumberFormat(
            "en-US",
            {
              style: "currency",
              currency: evt.payload.currency.toUpperCase(),
            },
          ).format(evt.payload.amount / 100)}`,
          html: templates.donation.adminNotification(evt.payload),
        });
        results.push({ recipient: "admin", result: adminResult });

        // Donor - only if email is provided
        if (evt.payload.donorEmail) {
          const donorResult = await sendEmail({
            to: evt.payload.donorEmail,
            subject: "Thank you for your donation",
            html: templates.donation.thankYou(evt.payload),
          });
          results.push({ recipient: "donor", result: donorResult });
        }
        break;
      }

      case "membership.payment_confirmed": {
        // User confirmation for membership fee
        const userResult = await sendEmail({
          to: evt.payload.email,
          subject: "Membership payment received",
          html: templates.membershipPayment.confirmed(evt.payload),
        });
        results.push({ recipient: "user", result: userResult });

        // Admin heads-up
        const adminResult = await sendEmail({
          to: ADMIN_EMAILS,
          subject: `Membership payment confirmed: ${new Intl.NumberFormat(
            "en-US",
            {
              style: "currency",
              currency: evt.payload.currency.toUpperCase(),
            },
          ).format(evt.payload.amount / 100)}`,
          html: templates.membershipPayment.adminNotification(evt.payload),
        });
        results.push({ recipient: "admin", result: adminResult });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown event type: ${evt.type}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Email notification error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
