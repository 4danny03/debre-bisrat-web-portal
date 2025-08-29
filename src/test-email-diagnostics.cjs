#!/usr/bin/env node
// Diagnostic script for email notification system
// Run with: node src/test-email-diagnostics.cjs

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

async function testEmailDiagnostics() {
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

  try {
    console.log("Checking Edge Function environment variables...");
    const fetch = require("node-fetch");
    const response = await fetch(
      `${supabaseUrl}/functions/v1/notify-emails/debug`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    if (response.status === 404) {
      console.error(
        "❌ Debug endpoint not found. Let's check the function directly.",
      );
      await testBasicEmail();
      return;
    }

    const result = await response.json();
    console.log("Environment variables check:", result);

    if (result.resendApiKey) {
      console.log("✅ RESEND_API_KEY is set");
    } else {
      console.error("❌ RESEND_API_KEY is missing");
    }

    if (result.fromEmail) {
      console.log(`✅ FROM_EMAIL is set to: ${result.fromEmail}`);
    } else {
      console.error("❌ FROM_EMAIL is missing");
    }

    if (result.adminEmails && result.adminEmails.length > 0) {
      console.log(
        `✅ ADMIN_EMAILS is set to: ${result.adminEmails.join(", ")}`,
      );
    } else {
      console.error("❌ ADMIN_EMAILS is missing or empty");
    }
  } catch (error) {
    console.error("Error checking environment variables:", error);
    console.log("Falling back to basic email test...");
    await testBasicEmail();
  }
}

async function testBasicEmail() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  const payload = {
    type: "test.email",
    payload: {
      email: "matterskhalid@gmail.com", // Use your email here
      subject: "Email System Test",
      message:
        "This is a test email to verify the notification system is working.",
    },
  };

  try {
    console.log(`Sending basic test email to ${payload.payload.email}...`);
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

    if (response.ok) {
      console.log(
        "✅ Basic email test completed. Check your inbox (and spam folder).",
      );
    } else {
      console.error("❌ Basic email test failed.");
    }
  } catch (error) {
    console.error("Error testing basic email:", error);
  }
}

testEmailDiagnostics();
