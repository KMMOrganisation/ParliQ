/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY?: string
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}