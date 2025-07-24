import React from "react";
import { Database, Server, Shield, Zap, CheckCircle } from "lucide-react";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  error?: any;
}

export const groupResultsByCategory = (results: TestResult[]) => {
  if (!Array.isArray(results) || results.length === 0) {
    console.warn("groupResultsByCategory: results is not a valid array");
    return {};
  }

  const safeResults = results.filter(
    (result) => result && typeof result === "object",
  );
  if (safeResults.length === 0) {
    console.warn("groupResultsByCategory: no valid results to categorize");
    return {};
  }

  const categories: Record<string, TestResult[]> = {
    Database: [],
    API: [],
    Authentication: [],
    "Edge Functions": [],
    "Admin Helpers": [],
    "Data Sync": [],
    "Email Marketing": [],
    Other: [],
  };

  safeResults.forEach((result) => {
    if (!result || typeof result.name !== "string") {
      console.warn("Invalid result object:", result);
      return;
    }

    if (
      result.name.includes("Database") ||
      result.name.includes("Table Access")
    ) {
      categories["Database"].push(result);
    } else if (result.name.includes("API:")) {
      categories["API"].push(result);
    } else if (result.name.includes("Authentication")) {
      categories["Authentication"].push(result);
    } else if (result.name.includes("Edge Function")) {
      categories["Edge Functions"].push(result);
    } else if (result.name.includes("Admin Helper")) {
      categories["Admin Helpers"].push(result);
    } else if (result.name.includes("Data Sync")) {
      categories["Data Sync"].push(result);
    } else if (
      result.name.includes("Email") ||
      result.name.includes("Newsletter") ||
      result.name.includes("Campaign")
    ) {
      categories["Email Marketing"].push(result);
    } else {
      categories["Other"].push(result);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach((key) => {
    if (!Array.isArray(categories[key]) || categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Database":
      return <Database className="h-4 w-4" />;
    case "API":
      return <Server className="h-4 w-4" />;
    case "Authentication":
      return <Shield className="h-4 w-4" />;
    case "Edge Functions":
      return <Zap className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};