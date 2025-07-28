import { corsHeaders } from "./cors.ts";

export function handleCorsOptions(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  return null;
}

export function formatErrorResponse(error: Error, status = 400) {
  console.error(`Error: ${error.message}`);
  return new Response(
    JSON.stringify({
      error: error.message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

export function formatSuccessResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
