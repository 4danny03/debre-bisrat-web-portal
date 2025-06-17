// Environment variable defaults for development
const ENV_DEFAULTS = {
  VITE_APP_NAME: "St. Gabriel Ethiopian Orthodox Church",
  VITE_SUPABASE_URL: "https://azkinrdhnywkewpsliwz.supabase.co",
  VITE_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a2lucmRobnl3a2V3cHNsaXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNTQ1ODUsImV4cCI6MjA2NDczMDU4NX0.5s0aTJGTROVr0ul5EgVzYm6TPa2ntq8m7fdk1n_6fRA",
  VITE_API_URL: "https://nvigfdxosyqhnoljtfld.supabase.co",
} as const;

// Set defaults immediately to prevent runtime errors
if (typeof window !== "undefined") {
  Object.entries(ENV_DEFAULTS).forEach(([key, value]) => {
    if (!import.meta.env[key]) {
      // @ts-ignore
      import.meta.env[key] = value;
    }
  });
}

// Critical environment variables that must be set in production
const CRITICAL_ENV_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

/**
 * Get an environment variable with fallback to defaults
 * @param key - The key of the environment variable
 * @param defaultValue - The default value if the environment variable is not set
 * @returns The value of the environment variable
 */
export const getEnvVar = (
  key: keyof ImportMetaEnv,
  defaultValue: string = "",
): string => {
  const value = import.meta.env[key];
  if (value) return value;

  // Check if we have a default for this key
  if (key in ENV_DEFAULTS) {
    return ENV_DEFAULTS[key as keyof typeof ENV_DEFAULTS];
  }

  return defaultValue;
};

/**
 * Check if a feature flag is enabled
 * @param flag - The name of the feature flag
 * @returns boolean indicating if the feature is enabled
 */
export const isFeatureEnabled = (flag: string): boolean => {
  const value = getEnvVar(
    `VITE_ENABLE_${flag.toUpperCase()}` as keyof ImportMetaEnv,
    "false",
  );
  return value.toLowerCase() === "true";
};

/**
 * Validate environment variables with development-friendly approach
 * @throws Error only if critical variables are missing in production
 */
export const validateEnv = (): void => {
  const isDevelopment =
    import.meta.env.DEV || import.meta.env.VITE_TEMPO === "true";

  // In development, we're more lenient and provide defaults
  if (isDevelopment) {
    // Ensure defaults are set
    Object.entries(ENV_DEFAULTS).forEach(([key, value]) => {
      if (!import.meta.env[key]) {
        // @ts-ignore
        import.meta.env[key] = value;
      }
    });

    console.info(`ℹ️  Development mode: Using default environment variables`);
    return; // Don't throw in development
  }

  // In production, be strict about critical variables
  const missingCritical = CRITICAL_ENV_VARS.filter(
    (key) => !import.meta.env[key],
  );

  if (missingCritical.length > 0) {
    throw new Error(
      `Missing critical environment variables: ${missingCritical.join(", ")}\n` +
        "Please set these variables in your project settings before deploying to production.",
    );
  }
};
