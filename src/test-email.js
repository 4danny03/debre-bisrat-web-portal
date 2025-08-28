#!/usr/bin/env node
// Test script for notify-emails function
// Run with: node test-email.js (from the src directory)

import { createRequire } from "module";
const require = createRequire(import.meta.url);
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

async function testEmailFunction() {
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
      email: "test@example.com",
      name: "Test User",
      phone: "123-456-7890",
      membershipType: "Regular",
    },
  };

  try {
    console.log(
      `Sending test request to ${supabaseUrl}/functions/v1/notify-emails`,
    );
    const response = await fetch(`${supabaseUrl}/functions/v1/notify-emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Response:", result);
  } catch (error) {
    console.error("Error testing email function:", error);
  }
}

testEmailFunction();
