import { PrivacyFinding, PrivacyCategory, PrivacyTestCase } from '../src/types.js';

interface PatternRule {
  category: PrivacyCategory;
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  regex: RegExp;
  suggestion: string;
}

const RULES: PatternRule[] = [
  // Credentials and Secrets
  {
    category: 'credentials',
    label: 'API Key / Secret Token',
    severity: 'critical',
    regex: /(?:api[_-]?key|secret[_-]?key|token|access[_-]?token|bearer[_-]?token|password|passwd|master[_-]?key|auth[_-]?token)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{8,})['"]?/gi,
    suggestion: 'Remove or rotate this secret token immediately.',
  },
  {
    category: 'credentials',
    label: 'Platform API Key (Google / OpenAI / GitHub / Slack)',
    severity: 'critical',
    regex: /\b(?:AIza[0-9A-Za-z_\-]{30,45}|sk-(?:proj-|live-|test-)?[a-zA-Z0-9_\-]{20,}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{30,}|xox[baprs]-[0-9a-zA-Z]{10,48})\b/g,
    suggestion: 'Never transmit raw platform API keys in conversation prompts.',
  },
  {
    category: 'credentials',
    label: 'Bearer / Auth Token',
    severity: 'critical',
    regex: /\b(?:Bearer\s+[a-zA-Z0-9_\-\.]{20,}|ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)\b/gi,
    suggestion: 'Authentication tokens grant access to protected resources.',
  },
  {
    category: 'credentials',
    label: 'Private RSA/SSH Key',
    severity: 'critical',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    suggestion: 'Remove cryptographic private keys before querying AI.',
  },

  // Financial Information
  {
    category: 'financial',
    label: 'Credit / Debit Card Number',
    severity: 'critical',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    suggestion: 'Card numbers should be redacted to prevent PCI compliance breaches.',
  },
  {
    category: 'financial',
    label: 'International Bank Account Number (IBAN)',
    severity: 'high',
    regex: /\b[A-Z]{2}[0-9]{2}(?:[ ]?[A-Z0-9]{4}){4,7}\b/g,
    suggestion: 'Redact bank account numbers to protect financial privacy.',
  },
  {
    category: 'financial',
    label: 'Cryptocurrency Wallet Address',
    severity: 'medium',
    regex: /\b(?:0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,39})\b/g,
    suggestion: 'Public address detected. Consider masking wallet identifiers.',
  },

  // Personally Identifiable Information (PII)
  {
    category: 'pii',
    label: 'Social Security Number (SSN)',
    severity: 'critical',
    regex: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
    suggestion: 'National identity numbers should never be processed in plain text.',
  },
  {
    category: 'pii',
    label: 'Passport / National Identity Pattern',
    severity: 'high',
    regex: /\b(?:passport|national id|id number)\s*[:#]?\s*([A-Z0-9]{6,12})\b/gi,
    suggestion: 'Mask official identity documents prior to submission.',
  },

  // Contact Information
  {
    category: 'contact',
    label: 'Email Address',
    severity: 'medium',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    suggestion: 'Personal emails can link your identity to journal queries.',
  },
  {
    category: 'contact',
    label: 'Phone Number',
    severity: 'medium',
    regex: /(?:\+?\d{1,3}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)?\d{3,4}[ -]?\d{3,4}\b/g,
    suggestion: 'Mask phone numbers to prevent unsolicited contact exposure.',
  },
  {
    category: 'contact',
    label: 'Street Address Pattern',
    severity: 'medium',
    regex: /\b\d{1,5}\s+[A-Za-z0-9\.\s]{2,25}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct)\b/gi,
    suggestion: 'Mask physical residential addresses for location privacy.',
  },

  // Health-Related Information
  {
    category: 'health',
    label: 'Medical Prescription / Dosage',
    severity: 'high',
    regex: /\b(?:\d+(?:\.\d+)?\s*(?:mg|mcg|ml|tablets?|capsules?|units?))\s+(?:of\s+)?(?:[a-zA-Z]{3,20})\b/gi,
    suggestion: 'Specific medication dosages constitute sensitive health data (HIPAA).',
  },
  {
    category: 'health',
    label: 'Clinical Diagnostic / Condition Terminology',
    severity: 'high',
    regex: /\b(?:diagnosed with|prescribed|suffering from|biopsy results?|blood pressure is|glucose level is|insulin resistance|chemotherapy|psychotherapy diagnosis)\b/gi,
    suggestion: 'Explicit medical records and diagnoses should be carefully guarded.',
  },

  // Private Identifiers
  {
    category: 'identifier',
    label: 'Internal IPv4 Address',
    severity: 'low',
    regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})\b/g,
    suggestion: 'Internal private IP addresses reveal internal infrastructure topology.',
  },
  {
    category: 'identifier',
    label: 'Corporate Employee / Badge ID',
    severity: 'medium',
    regex: /\b(?:EMP-[0-9]{4,8}|BADGE-[A-Z0-9]{4,8})\b/gi,
    suggestion: 'Company badge numbers can correlate queries with organizational identity.',
  },
];

export function scanForPrivacyViolations(text: string): PrivacyFinding[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const findings: PrivacyFinding[] = [];
  let counter = 1;

  for (const rule of RULES) {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0];
      // Skip trivial or false positives for generic short numbers
      if (rule.category === 'contact' && rule.label === 'Phone Number') {
        const digits = matchText.replace(/\D/g, '');
        if (digits.length < 8 || digits.length > 15) continue;
      }

      findings.push({
        id: `finding-${Date.now()}-${counter++}`,
        category: rule.category,
        label: rule.label,
        match: matchText,
        startIndex: match.index,
        endIndex: match.index + matchText.length,
        severity: rule.severity,
        suggestion: rule.suggestion,
      });
    }
  }

  // Sort findings by start index, prioritizing wider and higher severity matches
  const sorted = findings.sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    return b.endIndex - a.endIndex;
  });

  // Filter out any finding completely enclosed in or overlapping an earlier finding
  const nonOverlapping: PrivacyFinding[] = [];
  let lastEnd = -1;

  for (const f of sorted) {
    if (f.startIndex >= lastEnd) {
      nonOverlapping.push(f);
      lastEnd = f.endIndex;
    }
  }

  return nonOverlapping;
}

export function redactText(text: string, findings: PrivacyFinding[]): string {
  if (!findings || findings.length === 0) {
    return text;
  }

  // Sort backwards to replace from end to start without affecting earlier indices
  const sorted = [...findings].sort((a, b) => b.startIndex - a.startIndex);
  let result = text;

  for (const finding of sorted) {
    const replacement = `[REDACTED: ${finding.label.toUpperCase()}]`;
    result =
      result.substring(0, finding.startIndex) +
      replacement +
      result.substring(finding.endIndex);
  }

  return result;
}

export const PREDEFINED_TEST_CASES: PrivacyTestCase[] = [
  {
    id: 'test-cred-01',
    title: 'Cloud API Keys & Secret Tokens',
    category: 'credentials',
    description: 'Detects platform API credentials, secret tokens, and private keys.',
    sampleText: 'Deploying worker using api_key: "AIzaSyD9x8K2L7M1N4P0Q3R6S5T8U1V4W7X0Y" with token="ghp_9876543210abcdefghijklmnop"',
    expectedFindings: 2,
  },
  {
    id: 'test-fin-02',
    title: 'Financial Payment & Banking Data',
    category: 'financial',
    description: 'Detects credit card PANs, IBAN international accounts, and crypto wallets.',
    sampleText: 'Please wire invoice payment to IBAN GB29XAAA01012345678901 or charge backup Visa card 4532890123456789.',
    expectedFindings: 2,
  },
  {
    id: 'test-pii-03',
    title: 'Government IDs & Social Security',
    category: 'pii',
    description: 'Detects SSNs and national passport identifiers.',
    sampleText: 'Verification audit submitted for citizen with SSN 123-45-6789 and Passport #A9876543.',
    expectedFindings: 2,
  },
  {
    id: 'test-contact-04',
    title: 'Personal Contact & Residence',
    category: 'contact',
    description: 'Detects email addresses, direct phone numbers, and physical residential street addresses.',
    sampleText: 'Reach me at founder@stealthstartup.io or mobile +1-415-555-0199. Office located at 742 Evergreen Terrace.',
    expectedFindings: 3,
  },
  {
    id: 'test-health-05',
    title: 'Clinical Diagnoses & Dosages',
    category: 'health',
    description: 'Detects explicit medical diagnoses and prescription medication dosages.',
    sampleText: 'Patient was diagnosed with insulin resistance and prescribed 500 mg of Metformin twice daily.',
    expectedFindings: 2,
  },
  {
    id: 'test-mixed-06',
    title: 'Mixed Enterprise Data Spill',
    category: 'credentials',
    description: 'Detects multiple simultaneous violations across credentials, private IPs, and contact emails.',
    sampleText: 'Connect to internal cluster at 10.240.0.15 using bearer_token: "sec_token_9876543210fedcba" and alert devops@company.org.',
    expectedFindings: 3,
  },
];
