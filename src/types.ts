export type MemoryDuration = '1_day' | '7_days' | '30_days' | 'project' | 'forever';

export type MemoryStatus = 'candidate' | 'approved' | 'revoked' | 'expired';

export type PrivacyCategory =
  | 'pii'
  | 'contact'
  | 'financial'
  | 'health'
  | 'credentials'
  | 'identifier';

export type PrivacyAction = 'allowed' | 'redacted' | 'blocked';

export type NavTab =
  | 'dashboard'
  | 'journal'
  | 'conversations'
  | 'vault'
  | 'privacy'
  | 'policies'
  | 'testbench'
  | 'insights'
  | 'security'
  | 'settings';

export type ExpertType = 'gemini' | 'claude' | 'local' | 'openai';

export interface ExpertInfo {
  id: ExpertType;
  name: string;
  role: string;
  provider: string;
  model: string;
  description: string;
  status: 'active' | 'standby' | 'ready';
  capabilities: string[];
}

export interface RoutingDecision {
  selectedExpert: ExpertType;
  expertName: string;
  modelUsed: string;
  reasoning: string;
  privacyLevel: 'public' | 'internal' | 'sensitive' | 'critical';
  memoriesConsultedCount: number;
  policyApplied: string;
  synthesisApplied: boolean;
}

export interface PolicyRule {
  id: string;
  name: string;
  category: 'privacy' | 'memory' | 'expert' | 'retention';
  description: string;
  enabled: boolean;
  priority: number;
}

export interface PrivacyFinding {
  id: string;
  category: PrivacyCategory;
  label: string;
  match: string;
  startIndex: number;
  endIndex: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  purpose: string;
  sourceConversationId: string;
  createdAt: string;
  expirationPolicy: MemoryDuration;
  expiresAt: string | null;
  status: MemoryStatus;
  lastUsedAt: string | null;
  useCount: number;
  revokedAt?: string | null;
  revocationReason?: string | null;
  tags?: string[];
}

export interface MemoryUsageExplanation {
  memoryId: string;
  memoryContent: string;
  purpose: string;
  expirationPolicy: MemoryDuration;
  expiresAt: string | null;
  relationshipToQuery: string;
}

export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  privacyMetadata?: {
    originalContent?: string;
    redactedContent?: string;
    findings: PrivacyFinding[];
    userAction: PrivacyAction;
  };
  memoriesConsulted?: MemoryUsageExplanation[];
  routingDecision?: RoutingDecision;
  expertSynthesis?: Array<{
    expert: ExpertType;
    name: string;
    contribution: string;
  }>;
  memoryCandidate?: {
    candidateId: string;
    content: string;
    suggestedPurpose: string;
    suggestedDuration: MemoryDuration;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export interface JournalIntelligence {
  summary: string;
  keyThoughts: string[];
  actionItems: string[];
  reflectionQuestion: string;
  themes: string[];
  moodInterpretation?: string;
  generatedAt: string;
}

export interface JournalConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: JournalMessage[];
  totalPrivacyDetections: number;
  intelligence?: JournalIntelligence;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  category: 'auth' | 'memory' | 'privacy' | 'gemini' | 'journal' | 'security';
  severity: 'info' | 'warn' | 'critical';
  details: string;
  timestamp: string;
  previousHash?: string;
  hash?: string;
  entryHash?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface AuditVerificationResult {
  valid: boolean;
  isValid?: boolean;
  totalEntries: number;
  verifiedAt: string;
  brokenIndex?: number;
  brokenLinkIndex?: number;
  message: string;
  details?: string;
  genesisHash: string;
  rootHash?: string;
  latestHash: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  authProvider: 'google' | 'firebase_token' | 'secure_passkey' | 'password';
}

export interface GovernanceStats {
  activeMemoriesCount: number;
  pendingCandidatesCount: number;
  revokedMemoriesCount: number;
  expiredMemoriesCount: number;
  totalPrivacyInterceptions: number;
  memoryConsultationCount: number;
  oldestActiveMemoryDate: string | null;
  expiringWithin24hCount: number;
  privacyPosture?: 'protected' | 'needs_attention' | 'action_required';
}

export interface UserPreferences {
  defaultRetention: MemoryDuration;
  autoScanPrivacy: boolean;
  defaultPrivacyAction: PrivacyAction;
  autoProposeCandidates: boolean;
  strictPurposeMatching: boolean;
}

export interface PrivacyTestCase {
  id: string;
  title: string;
  category: PrivacyCategory;
  sampleText: string;
  expectedFindings: number;
  description: string;
}

export interface GlobalSearchResult {
  id: string;
  type: 'memory' | 'conversation' | 'audit' | 'candidate';
  title: string;
  subtitle: string;
  date?: string;
  tag?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
  sourceConversationId: string;
  date: string;
}

export interface InsightsOverview {
  totalConversations: number;
  totalReflectionsGenerated: number;
  topThemes: { name: string; count: number }[];
  recentActionItems: ActionItem[];
  executiveSummary: string;
  weeklyReflectionPrompt: string;
  mindsetPatterns: { pattern: string; observation: string }[];
}
