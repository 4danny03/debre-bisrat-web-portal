import { supabase } from "../integrations/supabase/client";

// This script creates a test admin user for development
// Run with: npm run create-test-admin

async function createTestAdmin() {
  try {
    console.log("Creating test admin user...");

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "admin@church.test",
      password: "admin123456",
      options: {
        data: {
          role: "admin",
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return;
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        email: "admin@church.test",
        role: "admin",
      });

      if (profileError) {
        console.error("Profile error:", profileError);
        return;
      }

      console.log("✅ Test admin user created successfully!");
      console.log("Email: admin@church.test");
      console.log("Password: admin123456");
      console.log("\nYou can now log in to the admin panel at /admin/login");
    }
  } catch (error) {
    console.error("Error creating test admin:", error);
  }
}

createTestAdmin();
