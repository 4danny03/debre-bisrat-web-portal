#!/usr/bin/env node
// Test script for donation email notification
// Run with: node src/test-email-donation.cjs

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

async function testDonationEmail() {
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
    type: "donation.created",
    payload: {
      donorEmail: "test@example.com",
      donorName: "Daniel",
      amount: 1000, // in cents (10.00)
      currency: "usd",
      purpose: "ይለግሱ (Donate)",
      paymentMethod: "Stripe Payment Element",
      paymentId: "29",
      donationDate: "2025-03-01",
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
      console.log("✅ Donation email notification test successful!");
    } else {
      console.error("❌ Donation email notification test failed!");
    }
  } catch (error) {
    console.error("Error testing donation email function:", error);
  }
}

testDonationEmail();
