/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Cognito Hosted UI / Google federated sign-in
  readonly VITE_COGNITO_DOMAIN: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_OAUTH_REDIRECT_URI: string
  readonly VITE_GOOGLE_IDP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
