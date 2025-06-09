
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, recipients } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get site settings for from email
    const { data: settings } = await supabaseClient
      .from("site_settings")
      .select("from_email, church_name")
      .single();

    const fromEmail = settings?.from_email || "noreply@example.com";
    const churchName = settings?.church_name || "St. Gabriel Ethiopian Orthodox Church";

    // Get email template
    const { data: template } = await supabaseClient
      .from("email_templates")
      .select("*")
      .eq("template_type", type)
      .eq("is_active", true)
      .single();

    if (!template) {
      throw new Error(`No active template found for type: ${type}`);
    }

    // Replace template variables
    let content = template.content;
    let subject = template.subject;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace church name
    content = content.replace(/{{church_name}}/g, churchName);
    subject = subject.replace(/{{church_name}}/g, churchName);

    const emailPromises = recipients.map(async (email: string) => {
      return resend.emails.send({
        from: `${churchName} <${fromEmail}>`,
        to: [email],
        subject,
        html: content,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Email sending complete: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successful, 
      failed 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
