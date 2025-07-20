import { corsHeaders } from "./cors.ts";
export function handleCorsOptions(req) {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  return null;
}
export function formatErrorResponse(error, status = 400) {
  console.error(`Error: ${error.message}`);
  return new Response(JSON.stringify({
    error: error.message
  }), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
export function formatSuccessResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
// Security utilities
export const sanitizeString = (input, maxLength = 1000)=>{
  if (!input) return "";
  return input.trim().slice(0, maxLength);
};
export const validateEmail = (email)=>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
export const getSecurityHeaders = ()=>{
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  };
};
// Rate limiting helper (simple in-memory store for demo)
const rateLimitStore = new Map();
export const checkRateLimit = (identifier, maxRequests = 10, windowMs = 60000)=>{
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count++;
  return true;
};
