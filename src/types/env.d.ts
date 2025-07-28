/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_ADMIN_REGISTRATION: string;
  readonly VITE_ENABLE_MAINTENANCE_MODE: string;
  readonly VITE_GA_TRACKING_ID: string;
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_TWITTER_URL: string;
  readonly VITE_YOUTUBE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
