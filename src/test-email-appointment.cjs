#!/usr/bin/env node
// Test script for appointment request email notification
// Run with: node src/test-email-appointment.cjs

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

async function testAppointmentEmail() {
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
    type: "appointment.requested",
    payload: {
      email: "matterskhalid@gmail.com",
      name: "Khalid",
      phone: "123-456-7890",
      datetime: "2024-06-15 14:30",
      message:
        "I would like to schedule a meeting with the priest for a blessing.",
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
      console.log("✅ Appointment request email notification test successful!");
    } else {
      console.error("❌ Appointment request email notification test failed!");
    }
  } catch (error) {
    console.error("Error testing appointment email function:", error);
  }
}

testAppointmentEmail();
