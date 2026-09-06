import {
  UserProfile,
  GovernanceStats,
  Memory,
  MemoryDuration,
  JournalConversation,
  JournalMessage,
  JournalIntelligence,
  AuditLogEntry,
  AuditVerificationResult,
  PrivacyFinding,
  PrivacyAction,
  PrivacyTestCase,
  UserPreferences,
  InsightsOverview,
  GlobalSearchResult,
} from './types.js';

// Retrieve session token from localStorage or use default
const TOKEN_STORAGE_KEY = 'aegisai_session_token';

export function getSessionToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

export function setSessionToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const rawText = await response.text();

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = JSON.parse(rawText);
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      if (rawText.trim().startsWith('<')) {
        errorMsg = `HTTP ${response.status}: Service returned an HTML page instead of API response.`;
      }
    }
    throw new Error(errorMsg);
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    if (rawText.trim().startsWith('<')) {
      throw new Error(`Server returned HTML instead of JSON. Ensure the endpoint exists and the service is healthy.`);
    }
    throw new Error(`Failed to parse server response: ${rawText.slice(0, 100)}`);
  }
}

export const api = {
  // Session & Auth
  async getSession(): Promise<{ user: UserProfile; status: string; token: string }> {
    return fetchAPI('/api/auth/session');
  },

  async loginWithPassword(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetchAPI<{ user: UserProfile; token: string }>('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSessionToken(res.token);
    return res;
  },

  async registerWithPassword(email: string, password: string, displayName?: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetchAPI<{ user: UserProfile; token: string }>('/api/auth/register-password', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setSessionToken(res.token);
    return res;
  },

  async loginWithGoogle(email: string, displayName?: string, photoURL?: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetchAPI<{ user: UserProfile; token: string }>('/api/auth/login-google', {
      method: 'POST',
      body: JSON.stringify({ email, displayName, photoURL }),
    });
    setSessionToken(res.token);
    return res;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await fetchAPI<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });
    clearSessionToken();
    return res;
  },

  // Governance Stats
  async getStats(): Promise<GovernanceStats> {
    return fetchAPI('/api/governance/stats');
  },

  // Memories
  async getMemories(status?: string, purpose?: string, search?: string): Promise<{ memories: Memory[] }> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (purpose && purpose !== 'all') params.set('purpose', purpose);
    if (search) params.set('search', search);

    const query = params.toString();
    const url = query ? `/api/memories?${query}` : '/api/memories';
    return fetchAPI(url);
  },

  async getCandidates(): Promise<{ candidates: Memory[] }> {
    return fetchAPI('/api/memories/candidates');
  },

  async addCandidate(data: {
    content: string;
    purpose: string;
    sourceConversationId?: string;
    expirationPolicy: MemoryDuration;
    tags?: string[];
  }): Promise<{ candidate: Memory }> {
    return fetchAPI('/api/memories/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async approveMemory(
    id: string,
    updates?: { purpose?: string; expirationPolicy?: MemoryDuration }
  ): Promise<{ memory: Memory }> {
    return fetchAPI(`/api/memories/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(updates || {}),
    });
  },

  async updateMemory(
    id: string,
    updates: { content?: string; purpose?: string; expirationPolicy?: MemoryDuration; tags?: string[] }
  ): Promise<{ memory: Memory }> {
    return fetchAPI(`/api/memories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async revokeMemory(id: string, reason?: string): Promise<{ memory: Memory }> {
    return fetchAPI(`/api/memories/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async deleteMemory(id: string): Promise<{ success: boolean; purgedId: string }> {
    return fetchAPI(`/api/memories/${id}`, {
      method: 'DELETE',
    });
  },

  // Privacy Scanner & Testbench
  async scanPrivacy(text: string): Promise<{
    textLength: number;
    findingsCount: number;
    findings: PrivacyFinding[];
    clean: boolean;
    redactedVersion: string;
  }> {
    return fetchAPI('/api/privacy/scan', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async getPrivacyTestCases(): Promise<{ testCases: PrivacyTestCase[] }> {
    return fetchAPI('/api/privacy/testbench');
  },

  // Conversations
  async getConversations(): Promise<{ conversations: JournalConversation[] }> {
    return fetchAPI('/api/conversations');
  },

  async createConversation(title?: string): Promise<{ conversation: JournalConversation }> {
    return fetchAPI('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async getConversation(id: string): Promise<{ conversation: JournalConversation }> {
    return fetchAPI(`/api/conversations/${id}`);
  },

  async updateConversationTitle(id: string, title: string): Promise<{ conversation: JournalConversation }> {
    return fetchAPI(`/api/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    return fetchAPI(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  async generateIntelligence(conversationId: string): Promise<{ intelligence: JournalIntelligence }> {
    return fetchAPI(`/api/conversations/${conversationId}/intelligence`, {
      method: 'POST',
    });
  },

  async sendMessage(
    conversationId: string,
    data: { content: string; privacyAction: PrivacyAction; selectedModel?: string }
  ): Promise<{
    userMessage: JournalMessage;
    modelMessage: JournalMessage;
    suggestedCandidate?: Memory | null;
    blocked?: boolean;
    findings?: PrivacyFinding[];
  }> {
    return fetchAPI(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Audit Logs & Integrity Verification
  async getAuditLogs(limit = 100): Promise<{ logs: AuditLogEntry[] }> {
    return fetchAPI(`/api/audit-logs?limit=${limit}`);
  },

  async verifyAuditChain(): Promise<AuditVerificationResult> {
    return fetchAPI('/api/audit-logs/verify');
  },

  getExportAuditUrl(): string {
    return `/api/audit-logs/export`;
  },

  // Global Search
  async searchGlobal(q: string): Promise<{ query: string; results: GlobalSearchResult[] }> {
    return fetchAPI(`/api/search?q=${encodeURIComponent(q)}`);
  },

  // Insights & Intelligence
  async getInsightsOverview(): Promise<{ insights: InsightsOverview }> {
    return fetchAPI('/api/insights/overview');
  },

  // User Preferences & Portability
  async getUserPreferences(): Promise<{ preferences: UserPreferences }> {
    return fetchAPI('/api/user/preferences');
  },

  async updateUserPreferences(prefs: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> {
    return fetchAPI('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  },

  getFullExportUrl(): string {
    return `/api/user/export-all`;
  },

  async purgeAllData(): Promise<{ success: boolean; message: string }> {
    return fetchAPI('/api/user/purge-all', {
      method: 'POST',
    });
  },

  // BYOK Provider Connection Test
  async testProviderKey(provider: string, apiKey: string): Promise<{
    success: boolean;
    provider: string;
    message: string;
    latencyMs: number;
    status: 'connected' | 'unauthorized' | 'error';
    details?: string;
  }> {
    return fetchAPI('/api/providers/test-connection', {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey }),
    });
  },
};
