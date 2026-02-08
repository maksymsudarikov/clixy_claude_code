/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_TENANT: string;
  readonly VITE_ADMIN_PIN_HASH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
