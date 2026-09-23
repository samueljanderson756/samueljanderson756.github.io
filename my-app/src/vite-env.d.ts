/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EURO_TRIP_ACCOUNT_EMAIL: string;
  readonly VITE_EURO_TRIP_ID?: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
