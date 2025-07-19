/**
 * Safe utility functions to prevent common null/undefined errors
 */

/**
 * Safely access nested object properties
 */
export function safeGet<T>(
  obj: unknown,
  path: string,
  defaultValue?: T,
): T | undefined {
  try {
    const keys = path.split(".");
    let result: unknown = obj;

    for (const key of keys) {
      if (result == null || typeof result !== "object") {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? (result as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    if (!jsonString || typeof jsonString !== "string") {
      return fallback;
    }
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON
 */
export function safeJsonStringify(obj: unknown, fallback = "{}"): string {
  try {
    return JSON.stringify(obj) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely access array with bounds checking
 */
export function safeArrayAccess<T>(
  arr: T[] | null | undefined,
  index: number,
  fallback?: T,
): T | undefined {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return fallback;
  }
  return arr[index];
}

/**
 * Safely convert to string
 */
export function safeString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  try {
    return String(value);
  } catch {
    return fallback;
  }
}

/**
 * Safely convert to number
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Safely check if object has property
 */
export function safeHasProperty(obj: unknown, prop: string): boolean {
  return (
    obj != null &&
    typeof obj === "object" &&
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

/**
 * Safely get object keys
 */
export function safeObjectKeys(obj: unknown): string[] {
  if (obj == null || typeof obj !== "object") {
    return [];
  }
  try {
    return Object.keys(obj);
  } catch {
    return [];
  }
}

/**
 * Safely get object entries
 */
export function safeObjectEntries(obj: unknown): [string, unknown][] {
  if (obj == null || typeof obj !== "object") {
    return [];
  }
  try {
    return Object.entries(obj) as [string, unknown][];
  } catch {
    return [];
  }
}

/**
 * Safely execute a function with error handling
 */
export function safeExecute<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.warn("Safe execute caught error:", error);
    return fallback;
  }
}

/**
 * Safely execute an async function with error handling
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn("Safe execute async caught error:", error);
    return fallback;
  }
}

/**
 * Create a safe version of localStorage
 */
export const safeLocalStorage = {
  getItem: (key: string, fallback: string | null = null): string | null => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return fallback;
      }
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Create a safe version of sessionStorage
 */
export const safeSessionStorage = {
  getItem: (key: string, fallback: string | null = null): string | null => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return fallback;
      }
      return sessionStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return false;
      }
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return false;
      }
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
