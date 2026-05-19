/// <reference path="../.astro/types.d.ts" />

/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PAYSTACK_SECRET_KEY: string;
  readonly GOOGLE_SHEET_URL: string;
  readonly VOBELS_ADMIN_EMAIL: string;
  readonly VOBELS_ADMIN_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
