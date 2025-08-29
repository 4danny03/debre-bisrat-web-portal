#!/usr/bin/env node
// Enhanced test script for notify-emails function (CommonJS version)
// Run with: node src/test-email.cjs [event-type]

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

// Sample test data for different event types
const testEvents = {
  "user.registered": {
    type: "user.registered",
    payload: {
      email: "test@example.com",
      name: "Test User",
      phone: "123-456-7890",
      membershipType: "Regular",
      memberId: "mem_12345",
    },
  },
  "membership.pending_payment": {
    type: "membership.pending_payment",
    payload: {
      email: "test@example.com",
      name: "Test User",
      membershipType: "Regular",
      amount: "100.00",
      checkoutUrl: "https://example.com/checkout/12345",
    },
  },
  "appointment.requested": {
    type: "appointment.requested",
    payload: {
      email: "test@example.com",
      name: "Test User",
      phone: "123-456-7890",
      datetime: "2023-06-15 14:30",
      message: "I would like to schedule a meeting with the priest.",
    },
  },
  "donation.created": {
    type: "donation.created",
    payload: {
      amount: 5000, // in cents
      currency: "usd",
      donorEmail: "test@example.com",
      donorName: "Test Donor",
      purpose: "Building Fund",
      receiptUrl: "https://example.com/receipt/12345",
    },
  },
  "membership.payment_confirmed": {
    type: "membership.payment_confirmed",
    payload: {
      email: "test@example.com",
      name: "Test User",
      amount: 10000, // in cents
      currency: "usd",
      receiptUrl: "https://example.com/receipt/12345",
    },
  },
};

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

  // Get event type from command line args or use default
  const eventType = process.argv[2] || "user.registered";

  if (!testEvents[eventType]) {
    console.error(`Unknown event type: ${eventType}`);
    console.error(
      `Available event types: ${Object.keys(testEvents).join(", ")}`,
    );
    return;
  }

  const payload = testEvents[eventType];
  console.log(`Testing event type: ${eventType}`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

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
      console.log("✅ Email notification test successful!");
    } else {
      console.error("❌ Email notification test failed!");
    }
  } catch (error) {
    console.error("Error testing email function:", error);
  }
}

testEmailFunction();
