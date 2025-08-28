import { createClient } from "@supabase/supabase-js";

// Try to get environment variables from import.meta.env first (Vite standard)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If not available, try to get from the project settings (Tempo platform)
if (!supabaseUrl) {
  supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

if (!supabaseAnonKey) {
  supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Please check your project settings.",
  );
  throw new Error("Missing Supabase environment variables");
}

console.log("Supabase URL:", supabaseUrl);
console.log(
  "Supabase Anon Key:",
  supabaseAnonKey ? "Provided" : "Not Provided",
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
