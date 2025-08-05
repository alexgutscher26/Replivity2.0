/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  readonly WXT_SITE_URL: string
  // Add other environment variables here as needed
}
