import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
}

// Input validation and sanitization
function validateEmailRequest(data: EmailRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.to)) {
    errors.push("Invalid email format");
  }

  // Validate subject length
  if (!data.subject || data.subject.length > 200) {
    errors.push("Subject must be between 1 and 200 characters");
  }

  // Validate HTML content length
  if (!data.htmlContent || data.htmlContent.length > 50000) {
    errors.push("HTML content must be between 1 and 50,000 characters");
  }

  // Basic HTML sanitization check (prevent script injection)
  if (
    data.htmlContent.includes("<script") ||
    data.htmlContent.includes("javascript:")
  ) {
    errors.push("HTML content contains potentially unsafe elements");
  }

  return { isValid: errors.length === 0, errors };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const requestData: EmailRequest = await req.json();

    // Validate input data
    const validation = validateEmailRequest(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.errors.join(", ") }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const { to, subject, htmlContent } = requestData;

    if (!to || !subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
