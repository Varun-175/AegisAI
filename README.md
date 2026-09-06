# AegisAI — Security-First Personal AI Journal & AI Memory Governance Platform

> **Core Principle:**
> *"AI should remember only what the user permits, for the purpose the user permits, for the duration the user permits, and forget when the user says so."*

[![Firebase Project](https://img.shields.io/badge/Firebase-geminivault--varun1-orange?logo=firebase)](https://console.firebase.google.com)
[![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-blue?logo=googlecloud)](https://cloud.google.com/run)
[![Gemini](https://img.shields.io/badge/Gemini%20API-2.5%20Flash-4285F4?logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/Security-Zero--Trust-emerald)](#security-architecture)

---

## Architecture Overview

```
[ Browser / Client ] (Vite + React + Tailwind)
        │
        ├── 1. Pre-scan prompt via Privacy Guardian (Regex + Heuristic Overlap Elimination)
        ├── 2. User decision: ALLOW | REDACT | BLOCK
        └── 3. Firebase Authentication Bearer Token
                │
                ▼
[ Google Cloud Run ] (Express API Gateway - Port 3000)
        │
        ├── A. authMiddleware verifies caller identity & resolves isolated UID
        ├── B. Enforces Memory Governance:
        │      - Queries active, approved, unexpired memories for that UID only
        │      - Injects relevant context under purpose guardrails
        ├── C. Secret Manager / Runtime Env provides server-only GEMINI_API_KEY
        │      - Browser JavaScript never sees API keys or backend credentials
        ├── D. Invokes Gemini 2.5 Flash API (@google/genai)
        │      - Extracts Memory Candidates pending user review
        │      - Records "Why was this used?" citation metadata
        └── E. Writes to Cloud Firestore (geminivault-varun1) under strict UID paths:
               /users/{uid}/journals/{journalId}
               /users/{uid}/conversations/{conversationId}
               /users/{uid}/memories/{memoryId}
               /users/{uid}/auditEvents/{eventId}
```

---

## Core Product Capabilities

### 1. Zero-Trust Privacy Guardian (Pre-Scan Interceptor)
Before any text is sent to Gemini:
- Deep pattern scanning for **6 critical categories**:
  - API keys, tokens, SSH private keys, AWS/GCP credentials
  - Financial data (credit cards, CVVs, IBANs)
  - PII (SSNs, National IDs, passports)
  - Contact information (emails, phone numbers, physical addresses)
  - Protected Health Information (diagnoses, medical IDs)
  - Infrastructure identifiers (internal IPs, internal hostnames)
- **Three user choices on detection:**
  - **Redact & Send**: Replaces tokens with clean cryptographic hashes/masks (`[REDACTED:API_KEY]`) before server-side invocation.
  - **Allow**: Explicit user override, logged in the tamper-evident audit trail.
  - **Block**: Cancels transmission; prompt remains safe in editor for manual revision.

### 2. AI Memory Governance Engine
Solves the "Silent AI Amnesia vs. Unchecked AI Surveillance" dilemma:
- **Explicit Candidate Proposal**: When Gemini identifies a preference, routine, or architecture fact, it is marked as a **Candidate** — never committed automatically.
- **Purpose Binding**: Every memory must have an assigned purpose (e.g. *"Contextual Coding Assistant"*, *"Security Guardrails"*).
- **Time-Bound Expiration**:
  - `1_day`
  - `7_days`
  - `30_days`
  - `project` (90 days)
  - `forever` (explicit user election only)
- **Instant Revocation & Purge**: Single-click revocation excludes memory from all future Gemini contexts. Purge permanently erases the record.
- **"Why Was This Used?" Transparency**: Every model response lists which memories were consulted, why they were relevant, and their governing policy.

### 3. Structured Journal Intelligence
Transforms multi-turn journal conversations into actionable personal growth:
- **Executive Reflection Summary**
- **Key Thoughts & Mental Models**
- **Concrete Action Items**
- **Contemplative Reflection Question**
- **Theme Taxonomy & Non-Diagnostic Mindset Signals**

### 4. Tamper-Evident Audit Logging
Every security-critical action is logged with UID scoping, severity, and timestamp:
- `SESSION_AUTHENTICATED`
- `MEMORY_CANDIDATE_GENERATED`
- `MEMORY_APPROVED`
- `MEMORY_REVOKED`
- `MEMORY_PURGED`
- `PRIVACY_PROMPT_REDACTED`
- `PRIVACY_USER_OVERRIDE_ALLOW`
- `PRIVACY_TRANSMISSION_BLOCKED`
- `MEMORIES_CONSULTED`
- Complete export available as structured JSON (`/api/audit-logs/export`).

---

## Google Cloud Technologies

1. **Google Cloud Run**: Serverless container hosting the Express API gateway and Vite single-page application.
2. **Cloud Firestore**: Database with user-isolated collections (`geminivault-varun1`).
3. **Firebase Authentication**: User identity and Google Sign-In with cryptographically verified JWT tokens.
4. **Google Cloud Secret Manager**: Automated secure secret resolution for `GEMINI_API_KEY`.
5. **Gemini 2.5 Flash API (`@google/genai`)**: Next-generation reasoning model for reflective journaling, memory extraction, and context synthesis.

---

## Firestore Security Rules

Production rules are maintained in [`firestore.rules`](./firestore.rules) and configured in [`firebase.json`](./firebase.json). Access is strictly confined to authenticated owners:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

---

## Deployment to Google Cloud Run

To build and deploy AegisAI with the required hackathon tracking label:

```bash
# 1. Set Google Cloud project
gcloud config set project geminivault-varun1

# 2. Build container via Cloud Build
gcloud builds submit --tag gcr.io/geminivault-varun1/aegisai:latest .

# 3. Deploy to Cloud Run with required hackathon label
gcloud run deploy aegisai \
  --image gcr.io/geminivault-varun1/aegisai:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=geminivault-varun1 \
  --labels dev-tutorial=cloud-run-ai-challenge
```

---

## Repository & Source Control

- **GitHub Repository:** [(https://github.com/Varun-175/AegisAI/)]
- **Primary Branch:** `main`
- **Security Policy:** `.gitignore` strictly protects `.env*`, API keys, service accounts, and local credentials.
