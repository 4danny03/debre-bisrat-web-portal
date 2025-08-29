#!/usr/bin/env node
// Simple test script for email notification
// Run with: node src/test-email-simple.cjs

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

async function testSimpleEmail() {
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

  // Email to send to - CHANGE THIS TO YOUR EMAIL
  const testEmail = "matterskhalid@gmail.com";

  const payload = {
    type: "test.email",
    payload: {
      email: testEmail,
      subject: "Simple Email Test",
      message:
        "This is a simple test email to verify the notification system is working.",
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
        `✅ Simple email test successful! Check ${testEmail} inbox (and spam folder).`,
      );
    } else {
      console.error("❌ Simple email test failed!");
    }
  } catch (error) {
    console.error("Error testing simple email function:", error);
  }
}

testSimpleEmail();
