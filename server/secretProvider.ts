import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let cachedApiKey: string | null = null;
let client: SecretManagerServiceClient | null = null;

/**
 * Resolves GEMINI_API_KEY securely.
 * Priority:
 * 1. Runtime environment variable (process.env.GEMINI_API_KEY)
 * 2. Google Cloud Secret Manager (in Cloud Run / GCP runtime)
 */
export async function getGeminiApiKey(): Promise<string | null> {
  // If already resolved and cached in memory
  if (cachedApiKey) {
    return cachedApiKey;
  }

  // 1. Check process.env
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'MY_GEMINI_API_KEY' && envKey.trim().length > 0) {
    cachedApiKey = envKey.trim();
    return cachedApiKey;
  }

  // 2. In Google Cloud Run / GCP, try Google Cloud Secret Manager
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'geminivault-varun1';
  try {
    if (!client) {
      client = new SecretManagerServiceClient();
    }
    const secretName = `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`;
    const [version] = await client.accessSecretVersion({ name: secretName });
    const payload = version.payload?.data?.toString();
    if (payload && payload.trim().length > 0) {
      cachedApiKey = payload.trim();
      console.log(`[SecretManager] Successfully accessed GEMINI_API_KEY from ${secretName}`);
      return cachedApiKey;
    }
  } catch (err: any) {
    // Graceful fallback if Secret Manager is not configured or in local sandbox
    // Do not crash server
  }

  return null;
}
