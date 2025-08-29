#!/usr/bin/env node
// Test script for membership registration email notification
// Run with: node src/test-email-membership.cjs

const path = require("path");
const fs = require("fs");

// Load environment variables from .env file if available
try {
  const dotenv = require("dotenv");
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log("Loaded environment variables from .env file");
  }
} catch (err) {
  console.log("dotenv not available, skipping .env loading");
}

async function testMembershipEmail() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    console.error(
      "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set",
    );
    return;
  }

  console.log(`Using Supabase URL: ${supabaseUrl}`);
  console.log("Supabase key available:", !!supabaseKey);

  const payload = {
    type: "user.registered",
    payload: {
      email: "matterskhalid@gmail.com",
      name: "Khalid",
      phone: "123-456-7890",
      membershipType: "Regular",
      memberId: "mem_12345",
    },
  };

  try {
    console.log(
      `Sending test request to ${supabaseUrl}/functions/v1/notify-emails`,
    );
    const fetch = require("node-fetch");
    const response = await fetch(`${supabaseUrl}/functions/v1/notify-emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response body:", JSON.stringify(result, null, 2));

    if (result.ok) {
      console.log(
        "✅ Membership registration email notification test successful!",
      );
    } else {
      console.error(
        "❌ Membership registration email notification test failed!",
      );
    }
  } catch (error) {
    console.error("Error testing membership email function:", error);
  }
}

testMembershipEmail();
