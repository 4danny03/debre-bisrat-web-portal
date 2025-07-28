/**
 * API helper utilities for consistent error handling and data processing
 */

import { toast } from "@/components/ui/use-toast";
import { validateArrayData, validateApiData } from "@/utils/dataValidation";

/**
 * Wrapper for API calls with consistent error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage?: string,
): Promise<T> => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("API call failed:", error);

    if (errorMessage) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    return fallback;
  }
};

/**
 * Wrapper for array API calls with validation
 */
export const safeArrayApiCall = async <T>(
  apiCall: () => Promise<T[]>,
  fallback: T[] = [],
  errorMessage?: string,
): Promise<T[]> => {
  try {
    const result = await apiCall();
    const validation = validateArrayData(result, fallback);

    if (
      !validation.isValid &&
      Array.isArray(validation.errors) &&
      validation.errors.length > 0
    ) {
      console.warn("Array validation failed:", validation.errors);
    }

    return Array.isArray(validation.data) ? validation.data : fallback;
  } catch (error) {
    console.error("Array API call failed:", error);

    if (errorMessage) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    return fallback;
  }
};

/**
 * Retry mechanism for failed API calls
 */
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      console.warn(
        `API call attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        error,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt)),
      );
    }
  }

  throw lastError!;
};

/**
 * Format API errors for user display
 */
export const formatApiError = (error: any): string => {
  if (!error) return "An unknown error occurred";

  // Handle Supabase errors
  if (error.message) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle PostgreSQL errors
  if (error.code) {
    switch (error.code) {
      case "23505":
        return "This record already exists";
      case "23503":
        return "Cannot delete this record because it is referenced by other data";
      case "42P01":
        return "Database table not found";
      case "PGRST116":
        return "No data found";
      default:
        return error.details || error.hint || "Database error occurred";
    }
  }

  return "An unexpected error occurred";
};

/**
 * Check if error is a network/connection error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.toString();
  const networkErrorPatterns = [
    "network",
    "fetch",
    "connection",
    "timeout",
    "offline",
    "ERR_NETWORK",
    "ERR_INTERNET_DISCONNECTED",
  ];

  return networkErrorPatterns.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase()),
  );
};

/**
 * Batch API calls with error handling
 */
export const batchApiCalls = async <T>(
  apiCalls: Array<() => Promise<T>>,
  options: {
    failFast?: boolean;
    maxConcurrent?: number;
  } = {},
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> => {
  const { failFast = false, maxConcurrent = 5 } = options;
  const results: Array<{ success: boolean; data?: T; error?: Error }> = [];

  if (!Array.isArray(apiCalls) || apiCalls.length === 0) {
    return results;
  }

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < apiCalls.length; i += maxConcurrent) {
    const batch = apiCalls.slice(i, i + maxConcurrent);

    const batchPromises = batch.map(async (apiCall, index) => {
      try {
        const data = await apiCall();
        return { success: true, data };
      } catch (error) {
        const result = { success: false, error: error as Error };

        if (failFast) {
          throw error;
        }

        return result;
      }
    });

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      if (failFast) {
        throw error;
      }
    }
  }

  return results;
};
