import { createClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

const supabaseUrl = "https://nvigfdxosyqhnoljtfld.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aWdmZHhvc3lxaG5vbGp0ZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjU0MjMsImV4cCI6MjA2Mjc0MTQyM30.3fkZqIajZVAg__YHUr7rbBMOxXwVSjKBgcoQkKCqAPY";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const email = "khaliddawit7546@gmail.com";
  const password = "12345678";

  try {
    // Attempt normal signup first
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      return;
    }

    console.log("User signed up successfully!");
    console.log("Email:", email);
    console.log("User ID:", user?.id);

    if (user) {
      // Wait for a moment to ensure auth is propagated
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create profile directly instead of using RPC
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          role: "admin",
        },
      ]);

      if (profileError) {
        console.error("Profile Error:", profileError);
        return;
      }

      console.log("=================================");
      console.log("Admin user created successfully!");
      console.log("=================================");
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("=================================");
      console.log("You can now log in at /admin/login");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createAdminUser().catch(console.error);
