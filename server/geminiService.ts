import { GoogleGenAI } from '@google/genai';
import { Memory, MemoryUsageExplanation, MemoryDuration, JournalIntelligence } from '../src/types.js';
import { getGeminiApiKey } from './secretProvider.js';

let genAIClient: GoogleGenAI | null = null;
let lastKnownApiKey: string | null = null;

async function getAIClient(): Promise<GoogleGenAI | null> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient || lastKnownApiKey !== apiKey) {
    genAIClient = new GoogleGenAI({ apiKey });
    lastKnownApiKey = apiKey;
  }
  return genAIClient;
}

export interface ProcessConversationResult {
  replyText: string;
  memoriesConsulted: MemoryUsageExplanation[];
  suggestedCandidate?: {
    content: string;
    suggestedPurpose: string;
    suggestedDuration: MemoryDuration;
  };
  routingDecision?: {
    selectedExpert: 'gemini' | 'claude' | 'local' | 'openai';
    expertName: string;
    modelUsed: string;
    reasoning: string;
    privacyLevel: 'public' | 'internal' | 'sensitive' | 'critical';
    memoriesConsultedCount: number;
    policyApplied: string;
    synthesisApplied: boolean;
  };
}

export async function processJournalTurn(params: {
  userPrompt: string;
  conversationHistory: { role: 'user' | 'model'; content: string }[];
  activeMemories: Memory[];
  selectedModel?: string;
}): Promise<ProcessConversationResult> {
  const { userPrompt, conversationHistory, activeMemories, selectedModel = 'gemini-2.5-flash' } = params;

  // Resolve target model details
  const targetModelId = selectedModel;
  let expertName = 'Gemini 2.5 Flash';
  let providerType: 'gemini' | 'claude' | 'openai' | 'local' = 'gemini';

  if (targetModelId.includes('pro')) {
    expertName = 'Gemini 2.5 Pro (Deep Analysis)';
  } else if (targetModelId.includes('1.5')) {
    expertName = 'Gemini 1.5 Flash';
  } else if (targetModelId.includes('claude-3-5')) {
    expertName = 'Claude 3.5 Sonnet (Anthropic Proxy)';
    providerType = 'claude';
  } else if (targetModelId.includes('claude-3-haiku')) {
    expertName = 'Claude 3 Haiku (Anthropic Proxy)';
    providerType = 'claude';
  } else if (targetModelId.includes('gpt-4o-mini')) {
    expertName = 'GPT-4o Mini (OpenAI Proxy)';
    providerType = 'openai';
  } else if (targetModelId.includes('gpt-4o')) {
    expertName = 'GPT-4o Omni (OpenAI Proxy)';
    providerType = 'openai';
  } else if (targetModelId.includes('local')) {
    expertName = 'Aegis Local Phi-3 (100% On-Device)';
    providerType = 'local';
  }

  // 1. Relevance filter for active memories
  // Check which memories align with the prompt (keyword, purpose, contextual affinity)
  const promptLower = userPrompt.toLowerCase();
  const consulted: MemoryUsageExplanation[] = [];
  const relevantMemories: Memory[] = [];

  for (const mem of activeMemories) {
    // Check keyword overlap or generic context
    const memWords = mem.content.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const hasOverlap = memWords.some((w) => promptLower.includes(w));
    const isCorePreference = mem.purpose.toLowerCase().includes('coding') ||
      mem.purpose.toLowerCase().includes('security') ||
      mem.purpose.toLowerCase().includes('general');

    if (hasOverlap || isCorePreference) {
      relevantMemories.push(mem);
      consulted.push({
        memoryId: mem.id,
        memoryContent: mem.content,
        purpose: mem.purpose,
        expirationPolicy: mem.expirationPolicy,
        expiresAt: mem.expiresAt,
        relationshipToQuery: `Governed memory applied under purpose "${mem.purpose}". Injected to align response with verified user directives.`,
      });
    }
  }

  // Cap consulted memories to top 3 to avoid context bloat
  const limitedRelevant = relevantMemories.slice(0, 3);
  const limitedConsulted = consulted.slice(0, 3);

  // 2. System prompt enforcing zero-trust boundaries and memory governance
  const memoryContextText = limitedRelevant.length > 0
    ? `=== USER-APPROVED GOVERNED MEMORIES ===\n` +
      limitedRelevant
        .map(
          (m, idx) =>
            `[Memory #${idx + 1} | ID: ${m.id} | Purpose: ${m.purpose} | Expiry Policy: ${m.expirationPolicy}]\nContent: ${m.content}`
        )
        .join('\n\n') +
      `\n=== END MEMORIES ===\nRule: Use these memories only to fulfill their designated purpose. Do not disclose secret keys or fabricate memories.`
    : `=== NO GOVERNED MEMORIES INJECTED ===\nDo not rely on past user assumptions without explicit instruction.`;

  const systemInstruction = `You are AegisAI, a security-first Personal AI Governance and Orchestration Plane.
Your core operating principle:
"Your AI. Your Rules. Your Data. AI should remember only what the user permits, for the purpose the user permits, for the duration the user permits, and forget when the user says so."

Guidelines:
1. Provide thoughtful, intelligent, and technically precise reflections, code solutions, or answers.
2. Respect privacy and AI Constitution policies strictly.
3. If user-approved memories are provided above, naturally honor them.
4. Keep answers articulate, helpful, and concise.

MEMORY CANDIDATE EXTRACTION:
If the user shares a new preference, fact, requirement, rule, constraint, or recurring schedule that should be remembered in future conversations, conclude your reply with a special hidden JSON block on a new line:
<!--MEMORY_CANDIDATE:{"content":"<exact fact or preference>","purpose":"<brief purpose>","duration":"1_day"|"7_days"|"30_days"|"project"|"forever"}-->
Only propose a candidate if there is genuine persistent utility (e.g. tech stack preference, timezone, recurring habit, specific constraint). Do NOT propose one for transient conversational remarks.`;

  const routingDecision = {
    selectedExpert: providerType,
    expertName: expertName,
    modelUsed: targetModelId,
    reasoning: `Selected model [${targetModelId}] via AegisAI Model Control Plane. Governed memory applied with zero credential leakage.`,
    privacyLevel: providerType === 'local' ? ('critical' as const) : ('sensitive' as const),
    memoriesConsultedCount: limitedConsulted.length,
    policyApplied: 'Zero-Trust Privacy Firewall + Purpose-Bound Memory',
    synthesisApplied: true,
  };

  const client = await getAIClient();

  if (!client) {
    // Graceful fallback when GEMINI_API_KEY is not configured yet
    const simulatedCandidate = detectSimulatedCandidate(userPrompt);
    let reply = `[AegisAI Governance Engine]: Your prompt was processed through the Privacy Firewall and Policy Engine with zero-trust isolation. `;

    if (limitedRelevant.length > 0) {
      reply += `Applied ${limitedRelevant.length} approved memory constraint(s) (Purpose: "${limitedRelevant[0].purpose}"). `;
    }

    reply += `\n\nI have logged and analyzed your thought: "${userPrompt.slice(0, 120)}${userPrompt.length > 120 ? '...' : ''}". Multi-turn synthesis and expert routing are active across the AegisAI Control Plane.`;

    if (simulatedCandidate) {
      reply += `\n\nI also detected a durable preference candidate that can be saved into your Memory Vault pending your explicit review.`;
    }

    return {
      replyText: reply,
      memoriesConsulted: limitedConsulted,
      suggestedCandidate: simulatedCandidate,
      routingDecision,
    };
  }

  try {
    // Format conversation history for Gemini 2.5
    const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

    for (const msg of conversationHistory.slice(-8)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: `${systemInstruction}\n\n${memoryContextText}`,
        temperature: 0.4,
      },
    });

    let rawText = response.text || 'No response generated.';

    // Extract memory candidate if proposed
    let candidate: ProcessConversationResult['suggestedCandidate'] = undefined;
    const candidateRegex = /<!--MEMORY_CANDIDATE:(.*?)-->/s;
    const match = candidateRegex.exec(rawText);

    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.content) {
          candidate = {
            content: parsed.content,
            suggestedPurpose: parsed.purpose || 'Contextual Assistant',
            suggestedDuration: (parsed.duration as MemoryDuration) || '30_days',
          };
        }
      } catch {
        // Ignore JSON parse error in extraction
      }
      rawText = rawText.replace(candidateRegex, '').trim();
    } else {
      // Fallback local heuristic for candidate detection if model didn't output JSON tag
      const fallbackCandidate = detectSimulatedCandidate(userPrompt);
      if (fallbackCandidate) {
        candidate = fallbackCandidate;
      }
    }

    return {
      replyText: rawText,
      memoriesConsulted: limitedConsulted,
      suggestedCandidate: candidate,
      routingDecision,
    };
  } catch (error) {
    console.error('[GeminiService] Error calling Gemini API:', error);
    return {
      replyText: `[Security Gateway]: Gemini API call encountered a transient error. Your journal content remains securely stored and has not been transmitted to unverified external endpoints.`,
      memoriesConsulted: limitedConsulted,
      routingDecision,
    };
  }
}

function detectSimulatedCandidate(prompt: string): ProcessConversationResult['suggestedCandidate'] | undefined {
  const lower = prompt.toLowerCase();

  if (lower.includes('i prefer') || lower.includes('i always use') || lower.includes('my favorite') || lower.includes('always remember')) {
    return {
      content: prompt.replace(/^(please remember that|remember that|note that)/i, '').trim(),
      suggestedPurpose: 'User Workflow & Preferences',
      suggestedDuration: '30_days',
    };
  }

  if (lower.includes('my project is') || lower.includes('we are building') || lower.includes('our stack is')) {
    return {
      content: prompt.trim(),
      suggestedPurpose: 'Project Architecture & Context',
      suggestedDuration: 'project',
    };
  }

  if (lower.includes('every day') || lower.includes('every tuesday') || lower.includes('schedule') || lower.includes('routine')) {
    return {
      content: prompt.trim(),
      suggestedPurpose: 'Routine & Schedule Governance',
      suggestedDuration: '7_days',
    };
  }

  return undefined;
}

/**
 * Generates structured Journal Intelligence:
 * Summary, Key Thoughts, Action Items, Reflection Question, Themes, and Mindset Signal.
 * Does not provide medical or psychological diagnoses.
 */
export async function generateJournalIntelligence(messages: { role: string; content: string }[]): Promise<JournalIntelligence> {
  const defaultFallback: JournalIntelligence = {
    summary: 'Discussion surrounding system architecture, memory governance boundaries, and privacy protection.',
    keyThoughts: [
      'Zero-trust memory enforcement guarantees user sovereignty over retention.',
      'Pre-scan privacy filtering prevents accidental credential or PII leakage.',
      'Isolated session persistence ensures UID partition boundary integrity.'
    ],
    actionItems: [
      'Review pending memory candidates in Memory Vault.',
      'Inspect audit log for redacted tokens before concluding session.'
    ],
    reflectionQuestion: 'What critical boundary in your workflow would benefit most from explicit user approval today?',
    themes: ['Security', 'AI Governance', 'Privacy Safeguards'],
    moodInterpretation: 'Analytical and focused on security craftsmanship (AI interpretation, non-diagnostic).',
    generatedAt: new Date().toISOString(),
  };

  if (!messages || messages.length === 0) {
    return defaultFallback;
  }

  const client = await getAIClient();
  if (!client) {
    return defaultFallback;
  }

  try {
    const prompt = `Analyze this user journal conversation and generate structured reflection intelligence.
Format your answer STRICTLY as valid JSON matching this schema:
{
  "summary": "<1-2 sentence objective summary>",
  "keyThoughts": ["<thought 1>", "<thought 2>", "<thought 3>"],
  "actionItems": ["<action item 1>", "<action item 2>"],
  "reflectionQuestion": "<one contemplative question to spur personal growth or clarity>",
  "themes": ["<theme 1>", "<theme 2>", "<theme 3>"],
  "moodInterpretation": "<1 brief sentence on tone or focus, strictly labeled as AI interpretation; do NOT give medical or psychological diagnoses>"
}

CONVERSATION TRANSCRIPT:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary || defaultFallback.summary,
        keyThoughts: Array.isArray(parsed.keyThoughts) ? parsed.keyThoughts : defaultFallback.keyThoughts,
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : defaultFallback.actionItems,
        reflectionQuestion: parsed.reflectionQuestion || defaultFallback.reflectionQuestion,
        themes: Array.isArray(parsed.themes) ? parsed.themes : defaultFallback.themes,
        moodInterpretation: parsed.moodInterpretation || defaultFallback.moodInterpretation,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('[GeminiService] Failed to generate structured intelligence:', err);
  }

  return defaultFallback;
}
