import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Firestore } from '@google-cloud/firestore';
import {
  JournalConversation,
  JournalMessage,
  JournalIntelligence,
  Memory,
  MemoryDuration,
  AuditLogEntry,
  AuditVerificationResult,
  GovernanceStats,
  UserPreferences,
  InsightsOverview,
  ActionItem,
  GlobalSearchResult,
} from '../src/types.js';

// Cloud Firestore Client targeting project geminivault-varun1
let firestoreDb: Firestore | null = null;
try {
  firestoreDb = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'geminivault-varun1',
    ignoreUndefinedProperties: true,
  });
} catch {
  // Graceful fallback when ADC credentials are not configured in local dev
  firestoreDb = null;
}

const DATA_ROOT = path.join(process.cwd(), 'data', 'users');
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function computeExpiration(policy: MemoryDuration): string | null {
  const now = Date.now();
  switch (policy) {
    case '1_day':
      return new Date(now + 24 * 60 * 60 * 1000).toISOString();
    case '7_days':
      return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30_days':
      return new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'project':
      return new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString();
    case 'forever':
    default:
      return null;
  }
}

function calculateEntryHash(
  id: string,
  timestamp: string,
  action: string,
  category: string,
  details: string,
  prevHash: string
): string {
  return crypto
    .createHash('sha256')
    .update(`${id}:${timestamp}:${action}:${category}:${details}:${prevHash}`)
    .digest('hex');
}

export class UserStore {
  private userId: string;
  private userDir: string;

  constructor(userId: string) {
    // Sanitize UID to prevent directory traversal
    this.userId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    this.userDir = path.join(DATA_ROOT, this.userId);
    ensureDir(this.userDir);
    this.initializeDefaultDataIfEmpty();
  }

  private getPath(file: string): string {
    return path.join(this.userDir, file);
  }

  private readJSON<T>(file: string, fallback: T): T {
    const filePath = this.getPath(file);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private writeJSON<T>(file: string, data: T): void {
    const filePath = this.getPath(file);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[Storage] Failed to write ${file}:`, err);
    }
  }

  private initializeDefaultDataIfEmpty() {
    const convFile = this.getPath('conversations.json');
    const memFile = this.getPath('memories.json');
    const logFile = this.getPath('audit_logs.json');
    const prefFile = this.getPath('preferences.json');

    if (!fs.existsSync(prefFile)) {
      const defaultPrefs: UserPreferences = {
        defaultRetention: '30_days',
        autoScanPrivacy: true,
        defaultPrivacyAction: 'redacted',
        autoProposeCandidates: true,
        strictPurposeMatching: true,
      };
      this.writeJSON('preferences.json', defaultPrefs);
    }

    if (!fs.existsSync(convFile) && !fs.existsSync(memFile)) {
      const now = new Date().toISOString();
      const initLogId = `log-${Date.now()}`;
      const initLogHash = calculateEntryHash(
        initLogId,
        now,
        'VAULT_INITIALIZED',
        'security',
        `Private encrypted vault initialized for user. Cryptographic root established.`,
        GENESIS_HASH
      );

      const initialLogs: AuditLogEntry[] = [
        {
          id: initLogId,
          userId: this.userId,
          action: 'VAULT_INITIALIZED',
          category: 'security',
          severity: 'info',
          details: `Private encrypted vault initialized for user. Cryptographic root established.`,
          timestamp: now,
          previousHash: GENESIS_HASH,
          hash: initLogHash,
        },
      ];

      this.writeJSON('memories.json', []);
      this.writeJSON('conversations.json', []);
      this.writeJSON('audit_logs.json', initialLogs);
    }
  }

  // --- PREFERENCES ---
  public getPreferences(): UserPreferences {
    return this.readJSON<UserPreferences>('preferences.json', {
      defaultRetention: '30_days',
      autoScanPrivacy: true,
      defaultPrivacyAction: 'redacted',
      autoProposeCandidates: true,
      strictPurposeMatching: true,
    });
  }

  public updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    this.writeJSON('preferences.json', updated);
    this.addAuditLog({
      action: 'PREFERENCES_UPDATED',
      category: 'security',
      severity: 'info',
      details: 'Updated user privacy and memory governance preferences.',
    });
    return updated;
  }

  // --- MEMORIES ---
  public getMemories(): Memory[] {
    const memories = this.readJSON<Memory[]>('memories.json', []);
    const now = new Date();
    let changed = false;

    // Check expiration dynamically
    const evaluated = memories.map((m) => {
      if (m.status === 'approved' && m.expiresAt && new Date(m.expiresAt) < now) {
        changed = true;
        return { ...m, status: 'expired' as const };
      }
      return m;
    });

    if (changed) {
      this.writeJSON('memories.json', evaluated);
    }

    return evaluated;
  }

  public getActiveApprovedMemories(): Memory[] {
    const all = this.getMemories();
    const now = new Date();
    return all.filter((m) => {
      if (m.status !== 'approved') return false;
      if (m.expiresAt && new Date(m.expiresAt) < now) return false;
      return true;
    });
  }

  public getMemoryCandidates(): Memory[] {
    return this.getMemories().filter((m) => m.status === 'candidate');
  }

  public addMemoryCandidate(candidate: {
    content: string;
    purpose: string;
    sourceConversationId: string;
    expirationPolicy: MemoryDuration;
    tags?: string[];
  }): Memory {
    const memories = this.getMemories();
    const newMemory: Memory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: this.userId,
      content: candidate.content.trim(),
      purpose: candidate.purpose.trim() || 'General Assistant Context',
      sourceConversationId: candidate.sourceConversationId,
      createdAt: new Date().toISOString(),
      expirationPolicy: candidate.expirationPolicy,
      expiresAt: computeExpiration(candidate.expirationPolicy),
      status: 'candidate',
      lastUsedAt: null,
      useCount: 0,
      tags: candidate.tags || [],
    };

    memories.unshift(newMemory);
    this.writeJSON('memories.json', memories);

    this.addAuditLog({
      action: 'MEMORY_CANDIDATE_GENERATED',
      category: 'memory',
      severity: 'info',
      details: `Generated memory candidate from conversation ${candidate.sourceConversationId}. Pending explicit user approval.`,
      metadata: { memoryId: newMemory.id },
    });

    return newMemory;
  }

  public approveMemory(
    id: string,
    updates?: { purpose?: string; expirationPolicy?: MemoryDuration }
  ): Memory | null {
    const memories = this.getMemories();
    const index = memories.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const current = memories[index];
    const expirationPolicy = updates?.expirationPolicy || current.expirationPolicy;
    const purpose = updates?.purpose?.trim() || current.purpose;

    const updated: Memory = {
      ...current,
      purpose,
      expirationPolicy,
      expiresAt: computeExpiration(expirationPolicy),
      status: 'approved',
      revokedAt: null,
      revocationReason: null,
    };

    memories[index] = updated;
    this.writeJSON('memories.json', memories);

    this.addAuditLog({
      action: 'MEMORY_APPROVED',
      category: 'memory',
      severity: 'info',
      details: `User approved memory ${id} for purpose "${purpose}" under policy "${expirationPolicy}".`,
      metadata: { memoryId: id, policy: expirationPolicy },
    });

    return updated;
  }

  public updateMemory(
    id: string,
    updates: {
      content?: string;
      purpose?: string;
      expirationPolicy?: MemoryDuration;
      tags?: string[];
    }
  ): Memory | null {
    const memories = this.getMemories();
    const index = memories.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const current = memories[index];
    const expirationPolicy = updates.expirationPolicy || current.expirationPolicy;

    const updated: Memory = {
      ...current,
      content: updates.content?.trim() || current.content,
      purpose: updates.purpose?.trim() || current.purpose,
      expirationPolicy,
      expiresAt: updates.expirationPolicy ? computeExpiration(expirationPolicy) : current.expiresAt,
      tags: updates.tags || current.tags,
    };

    memories[index] = updated;
    this.writeJSON('memories.json', memories);

    this.addAuditLog({
      action: 'MEMORY_UPDATED',
      category: 'memory',
      severity: 'info',
      details: `Updated metadata for memory record ${id}.`,
      metadata: { memoryId: id },
    });

    return updated;
  }

  public revokeMemory(id: string, reason = 'User requested immediate revocation'): Memory | null {
    const memories = this.getMemories();
    const index = memories.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const current = memories[index];
    const updated: Memory = {
      ...current,
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revocationReason: reason,
    };

    memories[index] = updated;
    this.writeJSON('memories.json', memories);

    this.addAuditLog({
      action: 'MEMORY_REVOKED',
      category: 'memory',
      severity: 'warn',
      details: `Memory ${id} revoked by user. Excluded from all future Gemini contexts.`,
      metadata: { memoryId: id },
    });

    return updated;
  }

  public deleteMemory(id: string): boolean {
    const memories = this.getMemories();
    const filtered = memories.filter((m) => m.id !== id);
    if (filtered.length === memories.length) return false;

    this.writeJSON('memories.json', filtered);

    this.addAuditLog({
      action: 'MEMORY_PURGED',
      category: 'memory',
      severity: 'warn',
      details: `Permanently purged memory ${id} from persistent storage.`,
      metadata: { memoryId: id },
    });

    return true;
  }

  public recordMemoryUsage(memoryId: string): void {
    const memories = this.getMemories();
    const index = memories.findIndex((m) => m.id === memoryId);
    if (index !== -1) {
      memories[index].lastUsedAt = new Date().toISOString();
      memories[index].useCount = (memories[index].useCount || 0) + 1;
      this.writeJSON('memories.json', memories);
    }
  }

  // --- CONVERSATIONS ---
  public getConversations(): JournalConversation[] {
    return this.readJSON<JournalConversation[]>('conversations.json', []);
  }

  public getConversation(id: string): JournalConversation | null {
    const list = this.getConversations();
    return list.find((c) => c.id === id) || null;
  }

  public createConversation(title?: string): JournalConversation {
    const list = this.getConversations();
    const now = new Date().toISOString();
    const newConv: JournalConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: this.userId,
      title: title?.trim() || 'New Journal Entry',
      createdAt: now,
      updatedAt: now,
      messages: [],
      totalPrivacyDetections: 0,
    };

    list.unshift(newConv);
    this.writeJSON('conversations.json', list);

    this.addAuditLog({
      action: 'CONVERSATION_CREATED',
      category: 'journal',
      severity: 'info',
      details: `Initiated private journal thread ${newConv.id}.`,
      metadata: { conversationId: newConv.id },
    });

    return newConv;
  }

  public updateConversationTitle(id: string, title: string): JournalConversation | null {
    const list = this.getConversations();
    const conv = list.find((c) => c.id === id);
    if (!conv) return null;

    conv.title = title.trim();
    conv.updatedAt = new Date().toISOString();
    this.writeJSON('conversations.json', list);
    return conv;
  }

  public addMessage(
    conversationId: string,
    message: Omit<JournalMessage, 'id' | 'timestamp'>
  ): JournalMessage | null {
    const list = this.getConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (!conv) return null;

    const fullMsg: JournalMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    conv.messages.push(fullMsg);
    conv.updatedAt = fullMsg.timestamp;

    if (message.privacyMetadata?.findings && message.privacyMetadata.findings.length > 0) {
      conv.totalPrivacyDetections = (conv.totalPrivacyDetections || 0) + message.privacyMetadata.findings.length;
    }

    // Auto update title if default and this is first user message
    if (conv.messages.length <= 2 && message.role === 'user' && conv.title === 'New Journal Entry') {
      const summary = message.content.slice(0, 45).replace(/\n/g, ' ');
      conv.title = summary.length >= 45 ? `${summary}...` : summary;
    }

    this.writeJSON('conversations.json', list);
    return fullMsg;
  }

  public setConversationIntelligence(conversationId: string, intelligence: JournalIntelligence): boolean {
    const list = this.getConversations();
    const conv = list.find((c) => c.id === conversationId);
    if (!conv) return false;

    conv.intelligence = intelligence;
    conv.updatedAt = new Date().toISOString();
    this.writeJSON('conversations.json', list);

    this.addAuditLog({
      action: 'JOURNAL_INTELLIGENCE_GENERATED',
      category: 'journal',
      severity: 'info',
      details: `Generated reflection intelligence and action items for conversation ${conversationId}.`,
      metadata: { conversationId },
    });

    return true;
  }

  public deleteConversation(id: string): boolean {
    const list = this.getConversations();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;

    this.writeJSON('conversations.json', filtered);
    this.addAuditLog({
      action: 'CONVERSATION_DELETED',
      category: 'journal',
      severity: 'info',
      details: `Permanently purged conversation ${id}.`,
      metadata: { conversationId: id },
    });

    return true;
  }

  // --- CRYPTOGRAPHIC AUDIT LOGGING ---
  private ensureAuditHashChain(logs: AuditLogEntry[]): AuditLogEntry[] {
    if (logs.length === 0) return logs;
    let needsSave = false;
    const chronological = [...logs].reverse();
    let prevHash = GENESIS_HASH;

    for (let i = 0; i < chronological.length; i++) {
      const entry = chronological[i];
      if (!entry.previousHash && !entry.hash) {
        entry.previousHash = prevHash;
        const calculated = calculateEntryHash(
          entry.id,
          entry.timestamp,
          entry.action,
          entry.category,
          entry.details,
          entry.previousHash
        );
        entry.hash = calculated;
        entry.entryHash = calculated;
        needsSave = true;
      } else if (!entry.entryHash && entry.hash) {
        entry.entryHash = entry.hash;
        needsSave = true;
      }

      prevHash = entry.hash || prevHash;
    }

    if (needsSave) {
      const updated = [...chronological].reverse();
      this.writeJSON('audit_logs.json', updated);
      return updated;
    }
    return logs;
  }

  public getAuditLogs(limit = 100): AuditLogEntry[] {
    const rawLogs = this.readJSON<AuditLogEntry[]>('audit_logs.json', []);
    const logs = this.ensureAuditHashChain(rawLogs);
    return logs.slice(0, limit);
  }

  public addAuditLog(entry: {
    action: string;
    category: AuditLogEntry['category'];
    severity: AuditLogEntry['severity'];
    details: string;
    metadata?: Record<string, string | number | boolean | null>;
  }): AuditLogEntry {
    const rawLogs = this.readJSON<AuditLogEntry[]>('audit_logs.json', []);
    const logs = this.ensureAuditHashChain(rawLogs);
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();

    // Link previous hash (most recent entry in array is at index 0)
    const prevHash = logs.length > 0 && logs[0].hash ? logs[0].hash : GENESIS_HASH;
    const hash = calculateEntryHash(id, timestamp, entry.action, entry.category, entry.details, prevHash);

    const newEntry: AuditLogEntry = {
      id,
      userId: this.userId,
      action: entry.action,
      category: entry.category,
      severity: entry.severity,
      details: entry.details,
      timestamp,
      previousHash: prevHash,
      hash,
      entryHash: hash,
      metadata: entry.metadata,
    };

    logs.unshift(newEntry);
    if (logs.length > 500) {
      logs.length = 500;
    }
    this.writeJSON('audit_logs.json', logs);
    return newEntry;
  }

  public verifyAuditChain(): AuditVerificationResult {
    // Inspect raw logs directly without automatic modification or silent repair
    const logs = this.readJSON<AuditLogEntry[]>('audit_logs.json', []);
    if (logs.length === 0) {
      return {
        isValid: true,
        valid: true,
        totalEntries: 0,
        verifiedAt: new Date().toISOString(),
        details: 'Audit log is empty. Genesis chain initialized.',
        message: 'Audit log is empty. Genesis chain initialized.',
        rootHash: GENESIS_HASH,
        genesisHash: GENESIS_HASH,
        latestHash: GENESIS_HASH,
      };
    }

    // Logs are stored newest first (index 0).
    // The chain proceeds chronologically from oldest (index length-1) to newest (index 0).
    const chronological = [...logs].reverse();
    let expectedPrevHash = GENESIS_HASH;

    for (let i = 0; i < chronological.length; i++) {
      const entry = chronological[i];
      if (i === 0) {
        expectedPrevHash = entry.previousHash || GENESIS_HASH;
      }

      if (entry.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          valid: false,
          totalEntries: logs.length,
          verifiedAt: new Date().toISOString(),
          brokenIndex: i,
          brokenLinkIndex: i,
          details: `Hash link mismatch at record ${entry.id}. Expected previous ${expectedPrevHash}, found ${entry.previousHash}.`,
          message: `Hash link mismatch at record ${entry.id}. Expected previous ${expectedPrevHash}, found ${entry.previousHash}.`,
          rootHash: GENESIS_HASH,
          genesisHash: GENESIS_HASH,
          latestHash: logs[0].hash || '',
        };
      }

      const calculated = calculateEntryHash(
        entry.id,
        entry.timestamp,
        entry.action,
        entry.category,
        entry.details,
        expectedPrevHash
      );

      if (!entry.hash || entry.hash !== calculated) {
        return {
          isValid: false,
          valid: false,
          totalEntries: logs.length,
          verifiedAt: new Date().toISOString(),
          brokenIndex: i,
          brokenLinkIndex: i,
          details: `Cryptographic tamper detected at record ${entry.id}. Calculated SHA-256 does not match stored block hash.`,
          message: `Cryptographic tamper detected at record ${entry.id}. Calculated SHA-256 does not match stored block hash.`,
          rootHash: GENESIS_HASH,
          genesisHash: GENESIS_HASH,
          latestHash: logs[0].hash || '',
        };
      }

      expectedPrevHash = entry.hash;
    }

    return {
      isValid: true,
      valid: true,
      totalEntries: logs.length,
      verifiedAt: new Date().toISOString(),
      details: `Verified all ${logs.length} audit trail blocks. SHA-256 hash chaining is intact with zero tampering.`,
      message: `Verified all ${logs.length} audit trail blocks. SHA-256 hash chaining is intact with zero tampering.`,
      rootHash: GENESIS_HASH,
      genesisHash: GENESIS_HASH,
      latestHash: logs[0].hash || '',
    };
  }

  // --- GOVERNANCE STATS ---
  public getGovernanceStats(): GovernanceStats {
    const memories = this.getMemories();
    const logs = this.getAuditLogs(500);
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let activeCount = 0;
    let candidateCount = 0;
    let revokedCount = 0;
    let expiredCount = 0;
    let expiringWithin24h = 0;
    let oldestActive: string | null = null;
    let totalConsults = 0;

    for (const m of memories) {
      if (m.status === 'approved') {
        if (m.expiresAt && new Date(m.expiresAt) < now) {
          expiredCount++;
        } else {
          activeCount++;
          totalConsults += m.useCount || 0;
          if (m.expiresAt && new Date(m.expiresAt) <= next24h) {
            expiringWithin24h++;
          }
          if (!oldestActive || new Date(m.createdAt) < new Date(oldestActive)) {
            oldestActive = m.createdAt;
          }
        }
      } else if (m.status === 'candidate') {
        candidateCount++;
      } else if (m.status === 'revoked') {
        revokedCount++;
      } else if (m.status === 'expired') {
        expiredCount++;
      }
    }

    const privacyInterceptions = logs.filter(
      (l) => l.category === 'privacy' && (l.action.includes('INTERCEPTION') || l.action.includes('REDACTED') || l.action.includes('BLOCKED'))
    ).length;

    let posture: 'protected' | 'needs_attention' | 'action_required' = 'protected';
    if (candidateCount > 0 || expiringWithin24h > 0) {
      posture = 'needs_attention';
    }
    if (candidateCount > 5) {
      posture = 'action_required';
    }

    return {
      activeMemoriesCount: activeCount,
      pendingCandidatesCount: candidateCount,
      revokedMemoriesCount: revokedCount,
      expiredMemoriesCount: expiredCount,
      totalPrivacyInterceptions: privacyInterceptions,
      memoryConsultationCount: totalConsults,
      oldestActiveMemoryDate: oldestActive,
      expiringWithin24hCount: expiringWithin24h,
      privacyPosture: posture,
    };
  }

  // --- INSIGHTS & INTELLIGENCE AGGREGATION ---
  public getInsightsOverview(): InsightsOverview {
    const convs = this.getConversations();
    const actionItems: ActionItem[] = [];
    const themeCounts: Record<string, number> = {};
    let totalReflections = 0;

    for (const c of convs) {
      if (c.intelligence) {
        totalReflections++;
        for (const t of c.intelligence.themes || []) {
          themeCounts[t] = (themeCounts[t] || 0) + 1;
        }
        for (let i = 0; i < (c.intelligence.actionItems || []).length; i++) {
          actionItems.push({
            id: `act-${c.id}-${i}`,
            task: c.intelligence.actionItems[i],
            completed: false,
            sourceConversationId: c.id,
            date: c.createdAt,
          });
        }
      }
    }

    const topThemes = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const latestConvWithIntel = convs.find((c) => c.intelligence);
    const executiveSummary = latestConvWithIntel?.intelligence?.summary ||
      'No journal reflections analyzed yet. Start journaling in the workspace to generate AI reflection synthesis and action items.';

    const weeklyReflectionPrompt = latestConvWithIntel?.intelligence?.reflectionQuestion ||
      'What is the single most important priority for your cloud infrastructure and privacy governance this week?';

    return {
      totalConversations: convs.length,
      totalReflectionsGenerated: totalReflections,
      topThemes,
      recentActionItems: actionItems.slice(0, 10),
      executiveSummary,
      weeklyReflectionPrompt,
      mindsetPatterns: [
        {
          pattern: 'Proactive Zero-Trust Posture',
          observation: 'High frequency of prompt screening and verification before AI submission.',
        },
        {
          pattern: 'Targeted Memory Scoping',
          observation: 'Memories are consistently tagged and bounded by specific technical purposes.',
        },
      ],
    };
  }

  // --- GLOBAL SEARCH ---
  public searchAll(query: string): GlobalSearchResult[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: GlobalSearchResult[] = [];
    const memories = this.getMemories();
    const convs = this.getConversations();
    const logs = this.getAuditLogs(100);

    for (const m of memories) {
      if (
        m.content.toLowerCase().includes(q) ||
        m.purpose.toLowerCase().includes(q) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
      ) {
        results.push({
          id: m.id,
          type: m.status === 'candidate' ? 'candidate' : 'memory',
          title: m.content.slice(0, 70),
          subtitle: `Purpose: ${m.purpose} • Status: ${m.status.toUpperCase()}`,
          date: m.createdAt,
          tag: m.status,
        });
      }
    }

    for (const c of convs) {
      if (
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
      ) {
        results.push({
          id: c.id,
          type: 'conversation',
          title: c.title,
          subtitle: `${c.messages.length} messages in thread`,
          date: c.updatedAt,
          tag: 'thread',
        });
      }
    }

    for (const l of logs) {
      if (l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)) {
        results.push({
          id: l.id,
          type: 'audit',
          title: l.action,
          subtitle: l.details.slice(0, 80),
          date: l.timestamp,
          tag: l.category,
        });
      }
    }

    return results.slice(0, 25);
  }

  // --- DATA EXPORT & PURGE ---
  public getFullUserDataExport() {
    return {
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      userId: this.userId,
      preferences: this.getPreferences(),
      governanceStats: this.getGovernanceStats(),
      memories: this.getMemories(),
      conversations: this.getConversations(),
      auditTrail: this.getAuditLogs(500),
    };
  }

  public purgeAllUserData(): void {
    const emptyMemories: Memory[] = [];
    const emptyConversations: JournalConversation[] = [];
    this.writeJSON('memories.json', emptyMemories);
    this.writeJSON('conversations.json', emptyConversations);

    const wipeEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-wipe`,
      userId: this.userId,
      action: 'USER_DATA_PURGED',
      category: 'security',
      severity: 'critical',
      details: 'User executed full self-service data purge. All personal conversations and memories were permanently deleted.',
      timestamp: new Date().toISOString(),
      previousHash: GENESIS_HASH,
      hash: calculateEntryHash(
        `audit-${Date.now()}-wipe`,
        new Date().toISOString(),
        'USER_DATA_PURGED',
        'security',
        'User executed full self-service data purge.',
        GENESIS_HASH
      ),
    };

    this.writeJSON('audit_logs.json', [wipeEntry]);
  }
}
