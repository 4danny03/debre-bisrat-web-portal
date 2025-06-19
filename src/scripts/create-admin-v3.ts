import { createClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";
import * as dotenv from "dotenv";

dotenv.config();

// Get Supabase URL and anon key from environment variables or use defaults
const supabaseUrl = "https://nvigfdxosyqhnoljtfld.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aWdmZHhvc3lxaG5vbGp0ZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjU0MjMsImV4cCI6MjA2Mjc0MTQyM30.3fkZqIajZVAg__YHUr7rbBMOxXwVSjKBgcoQkKCqAPY";

async function createAdminUser() {
  console.log("Initializing Supabase client...");
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Step 1: Create the user
    console.log("Creating user account...");
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: "khaliddawit7546@gmail.com",
      password: "12345678",
      options: {
        emailRedirectTo: `${process.env.VITE_PUBLIC_SITE_URL || "http://localhost:8080"}/admin/login`,
      },
    });

    if (signUpError) {
      throw new Error(`Signup Error: ${signUpError.message}`);
    }

    if (!authData.user) {
      throw new Error("No user data returned from signup");
    }

    console.log("User created successfully!");
    console.log("User ID:", authData.user.id);
    console.log("Email:", authData.user.email);

    // Step 2: Set admin role in profiles table
    console.log("Setting admin role...");
    const { error: insertError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      role: "admin",
    });

    if (insertError) {
      console.error("Insert Error:", insertError);
      throw new Error(`Profile Creation Error: ${insertError.message}`);
    }

    // Step 3: Verify the profile was created
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (fetchError) {
      throw new Error(`Profile Fetch Error: ${fetchError.message}`);
    }

    if (!profile) {
      throw new Error("Profile creation failed - no profile found");
    }

    console.log("=================================");
    console.log("Admin user created successfully!");
    console.log("=================================");
    console.log("Email:", "khaliddawit7546@gmail.com");
    console.log("Password:", "12345678");
    console.log("Role:", profile.role);
    console.log("=================================");
    console.log("Please check your email to confirm your account");
    console.log("After confirmation, you can login at /admin/login");
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser().catch(console.error);
