// Debug endpoint for notify-emails function
// This file should be imported in index.ts

export async function handleDebugRequest(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Check if RESEND_API_KEY is set
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const hasResendApiKey = !!resendApiKey;

  // Check if FROM_EMAIL is set
  const fromEmail = Deno.env.get("FROM_EMAIL");

  // Check if ADMIN_EMAILS is set
  let adminEmails: string[] = [];
  try {
    const adminEmailsEnv = Deno.env.get("ADMIN_EMAILS");
    if (adminEmailsEnv) {
      adminEmails = JSON.parse(adminEmailsEnv);
    }
  } catch (e) {
    console.error("Error parsing ADMIN_EMAILS:", e);
  }

  // Return debug information
  return new Response(
    JSON.stringify({
      resendApiKey: hasResendApiKey,
      fromEmail,
      adminEmails,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
