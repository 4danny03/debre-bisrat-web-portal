import { createClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

// Initialize Supabase client
const supabase = createClient<Database>(
  "https://nvigfdxosyqhnoljtfld.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aWdmZHhvc3lxaG5vbGp0ZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjU0MjMsImV4cCI6MjA2Mjc0MTQyM30.3fkZqIajZVAg__YHUr7rbBMOxXwVSjKBgcoQkKCqAPY",
);

async function createAdminUser() {
  try {
    // 1. Create the user
    console.log("Creating user account...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "khaliddawit7546@gmail.com",
      password: "12345678",
    });

    if (authError) {
      console.error("Auth Error:", authError);
      throw authError;
    }

    if (authData.user) {
      console.log("User created successfully, creating admin profile...");

      // 2. Insert the admin profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          role: "admin",
        },
      ]);

      if (profileError) {
        console.error("Profile Error:", profileError);
        throw profileError;
      }

      console.log("Success! Admin user created:");
      console.log("Email:", authData.user.email);
      console.log("User ID:", authData.user.id);
      console.log("You can now log in at /admin/login");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
createAdminUser();
