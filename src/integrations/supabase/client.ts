import { createClient } from "@supabase/supabase-js";
import { getEnvVar } from "@/lib/env";

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if we're in production
export const isProduction = () => import.meta.env.PROD;

// Helper function to check if maintenance mode is enabled
export const isMaintenanceMode = () => getEnvVar("VITE_ENABLE_MAINTENANCE_MODE") === "true";
