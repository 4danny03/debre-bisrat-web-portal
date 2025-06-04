const REQUIRED_ENV_VARS = [
  'VITE_APP_NAME',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_API_URL'
] as const;

/**
 * Get an environment variable
 * @param key - The key of the environment variable
 * @param defaultValue - The default value if the environment variable is not set
 * @returns The value of the environment variable
 */
export const getEnvVar = (key: keyof ImportMetaEnv, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  return value || defaultValue;
};

/**
 * Check if a feature flag is enabled
 * @param flag - The name of the feature flag
 * @returns boolean indicating if the feature is enabled
 */
export const isFeatureEnabled = (flag: string): boolean => {
  const value = getEnvVar(`VITE_ENABLE_${flag.toUpperCase()}` as keyof ImportMetaEnv, 'false');
  return value.toLowerCase() === 'true';
};

/**
 * Validate required environment variables
 * @throws Error if any required environment variable is missing
 */
export const validateEnv = (): void => {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and make sure all required variables are set.'
    );
  }
};
