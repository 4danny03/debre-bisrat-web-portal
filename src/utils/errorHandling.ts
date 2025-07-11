/**
 * Comprehensive error handling utilities for the admin panel
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

/**
 * Safe data validation utilities
 */
export const validateApiResponse = <T>(data: any, fallback: T): T => {
  if (data === null || data === undefined) {
    console.warn("API response is null or undefined, using fallback");
    return fallback;
  }
  return data;
};

export const validateArrayResponse = <T>(
  data: any,
  fallback: T[] = [],
): T[] => {
  if (!Array.isArray(data)) {
    console.warn("Expected array response but got:", typeof data, data);
    return fallback;
  }
  return data;
};

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: Error, componentStack?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.errors.unshift(errorInfo);

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.error("Error logged:", errorInfo);
  }

  getRecentErrors(limit = 10): ErrorInfo[] {
    return this.errors.slice(0, limit);
  }

  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Safe array access with fallback
   */
  static safeArrayAccess<T>(
    arr: T[] | undefined | null,
    defaultValue: T[] = [],
  ): T[] {
    if (!Array.isArray(arr)) {
      console.warn("safeArrayAccess: Expected array but got:", typeof arr, arr);
      return defaultValue;
    }
    return arr;
  }

  /**
   * Safe object property access
   */
  static safePropertyAccess<T>(obj: any, path: string, defaultValue: T): T {
    try {
      const keys = path.split(".");
      let current = obj;

      for (const key of keys) {
        if (current == null || typeof current !== "object") {
          return defaultValue;
        }
        current = current[key];
      }

      return current !== undefined ? current : defaultValue;
    } catch (error) {
      console.warn("safePropertyAccess error:", error);
      return defaultValue;
    }
  }

  /**
   * Safe length check for arrays and strings
   */
  static safeLength(item: any): number {
    if (item == null) {
      return 0;
    }
    if (Array.isArray(item) || typeof item === "string") {
      return item.length;
    }
    if (typeof item === "object" && "length" in item) {
      return typeof item.length === "number" ? item.length : 0;
    }
    return 0;
  }

  /**
   * Validate and sanitize data before processing
   */
  static validateData<T>(
    data: any,
    validator: (data: any) => data is T,
  ): T | null {
    try {
      if (validator(data)) {
        return data;
      }
      return null;
    } catch (error) {
      console.warn("Data validation failed:", error);
      return null;
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Type guards
export const isArray = (value: any): value is any[] => Array.isArray(value);
export const isObject = (value: any): value is object =>
  value !== null && typeof value === "object" && !Array.isArray(value);
export const isString = (value: any): value is string =>
  typeof value === "string";
export const isNumber = (value: any): value is number =>
  typeof value === "number" && !isNaN(value);

// Safe operations
export const safeMap = <T, U>(
  arr: T[] | undefined | null,
  fn: (item: T, index: number) => U,
): U[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  try {
    return arr.map(fn);
  } catch (error) {
    console.error("safeMap error:", error);
    return [];
  }
};

export const safeFilter = <T>(
  arr: T[] | undefined | null,
  fn: (item: T, index: number) => boolean,
): T[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  try {
    return arr.filter(fn);
  } catch (error) {
    console.error("safeFilter error:", error);
    return [];
  }
};

export const safeReduce = <T, U>(
  arr: T[] | undefined | null,
  fn: (acc: U, item: T, index: number) => U,
  initialValue: U,
): U => {
  if (!Array.isArray(arr)) {
    return initialValue;
  }
  try {
    return arr.reduce(fn, initialValue);
  } catch (error) {
    console.error("safeReduce error:", error);
    return initialValue;
  }
};
