/**
 * Data validation utilities for consistent API response handling
 */

export interface ValidationResult<T> {
  isValid: boolean;
  data: T;
  errors: string[];
}

/**
 * Validates and sanitizes API responses
 */
export const validateApiData = <T>(
  data: any,
  fallback: T,
  validator?: (data: any) => boolean,
): ValidationResult<T> => {
  const errors: string[] = [];

  // Check for null/undefined
  if (data === null || data === undefined) {
    errors.push("Data is null or undefined");
    return { isValid: false, data: fallback, errors };
  }

  // Run custom validator if provided
  if (validator && !validator(data)) {
    errors.push("Data failed custom validation");
    return { isValid: false, data: fallback, errors };
  }

  return { isValid: true, data, errors: [] };
};

/**
 * Validates array responses from API
 */
export const validateArrayData = <T>(
  data: any,
  fallback: T[] = [],
): ValidationResult<T[]> => {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push(`Expected array but got ${typeof data}`);
    return { isValid: false, data: fallback, errors };
  }

  return { isValid: true, data, errors: [] };
};

/**
 * Validates member data structure
 */
export const validateMemberData = (member: any): ValidationResult<any> => {
  const errors: string[] = [];

  if (!member) {
    errors.push("Member data is required");
    return { isValid: false, data: null, errors };
  }

  if (!member.full_name || typeof member.full_name !== "string") {
    errors.push("Full name is required and must be a string");
  }

  if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
    errors.push("Invalid email format");
  }

  const validMembershipTypes = ["regular", "student", "senior", "family"];
  if (
    member.membership_type &&
    !validMembershipTypes.includes(member.membership_type)
  ) {
    errors.push("Invalid membership type");
  }

  const validStatuses = ["pending", "active", "inactive"];
  if (
    member.membership_status &&
    !validStatuses.includes(member.membership_status)
  ) {
    errors.push("Invalid membership status");
  }

  return {
    isValid: errors.length === 0,
    data: {
      ...member,
      membership_type: member.membership_type || "regular",
      membership_status: member.membership_status || "pending",
      join_date:
        member.join_date || member.created_at || new Date().toISOString(),
      updated_at:
        member.updated_at || member.created_at || new Date().toISOString(),
    },
    errors,
  };
};

/**
 * Validates event data structure
 */
export const validateEventData = (event: any): ValidationResult<any> => {
  const errors: string[] = [];

  if (!event) {
    errors.push("Event data is required");
    return { isValid: false, data: null, errors };
  }

  if (!event.title || typeof event.title !== "string") {
    errors.push("Event title is required and must be a string");
  }

  if (!event.event_date) {
    errors.push("Event date is required");
  } else {
    const date = new Date(event.event_date);
    if (isNaN(date.getTime())) {
      errors.push("Invalid event date format");
    }
  }

  return {
    isValid: errors.length === 0,
    data: {
      ...event,
      is_featured: Boolean(event.is_featured),
      created_at: event.created_at || new Date().toISOString(),
    },
    errors,
  };
};

/**
 * Validates appointment data structure
 */
export const validateAppointmentData = (
  appointment: any,
): ValidationResult<any> => {
  const errors: string[] = [];

  if (!appointment) {
    errors.push("Appointment data is required");
    return { isValid: false, data: null, errors };
  }

  if (!appointment.name || typeof appointment.name !== "string") {
    errors.push("Name is required and must be a string");
  }

  if (
    !appointment.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appointment.email)
  ) {
    errors.push("Valid email is required");
  }

  if (!appointment.service_title) {
    errors.push("Service title is required");
  }

  const validStatuses = ["pending", "approved", "rejected", "completed"];
  if (appointment.status && !validStatuses.includes(appointment.status)) {
    errors.push("Invalid appointment status");
  }

  return {
    isValid: errors.length === 0,
    data: {
      ...appointment,
      status: appointment.status || "pending",
      created_at: appointment.created_at || new Date().toISOString(),
    },
    errors,
  };
};

/**
 * Safe number parsing with fallback
 */
export const safeParseNumber = (value: any, fallback: number = 0): number => {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

/**
 * Safe date parsing with fallback
 */
export const safeParseDate = (value: any, fallback?: Date): Date => {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback || new Date();
};

/**
 * Sanitizes string input
 */
export const sanitizeString = (value: any, fallback: string = ""): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value !== null && value !== undefined) {
    return String(value).trim();
  }

  return fallback;
};
