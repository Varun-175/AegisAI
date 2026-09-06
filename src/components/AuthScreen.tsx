import React, { useState } from 'react';
import {
  Lock,
  Boxes,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Key,
  Database,
  ArrowRight,
  Fingerprint,
  Activity,
  Cpu,
  Copy,
} from 'lucide-react';
import { api } from '../api.js';
import { UserProfile } from '../types.js';
import { AegisAILogo } from './AegisAILogo.js';
import { signInWithGoogle as firebaseGoogleSignIn } from '../firebase.js';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOAuthNotice, setShowOAuthNotice] = useState(false);
  const [oauthErrorDetails, setOauthErrorDetails] = useState<string | null>(null);
  const [copiedDomains, setCopiedDomains] = useState(false);

  const handleCopyDomains = () => {
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
    const domains = [
      'ais-dev-xs3hlr27k44lil737kpbpp-448521234429.asia-southeast1.run.app',
      'ais-pre-xs3hlr27k44lil737kpbpp-448521234429.asia-southeast1.run.app',
      currentDomain,
    ].filter(Boolean);
    const unique = Array.from(new Set(domains)).join('\n');
    navigator.clipboard.writeText(unique);
    setCopiedDomains(true);
    setTimeout(() => setCopiedDomains(false), 3000);
  };

  // Live Privacy Guardian Interactive Scanner Demo State on Landing
  const [demoText, setDemoText] = useState(
    'I am planning a project review. My secret token is bearer_tok_9823719283 and email is user@domain.com'
  );
  const [demoActiveTab, setDemoActiveTab] = useState<'scan' | 'redacted'>('scan');

  const handleGoogleOAuthLogin = async () => {
    setLoading(true);
    setAuthMethod('oauth');
    setError(null);

    // Attempt Real Firebase Google Popup OAuth
    try {
      const fbUser = await firebaseGoogleSignIn();
      if (fbUser && fbUser.email) {
        const res = await api.loginWithGoogle(
          fbUser.email,
          fbUser.displayName || fbUser.email.split('@')[0],
          fbUser.photoURL || undefined
        );
        onLoginSuccess(res.user);
        return;
      }
    } catch (oauthErr: any) {
      console.warn('Firebase popup OAuth error:', oauthErr);
      let msg = oauthErr?.message || 'Authentication flow encountered an error.';
      if (msg.includes('<!doctype') || msg.includes('Unexpected token')) {
        msg = 'Firebase popup auth handler returned an HTML document. This occurs when Cloud Run domains are not yet registered in Firebase Authorized Domains.';
      }
      setOauthErrorDetails(msg);
      setShowOAuthNotice(true);
    } finally {
      setLoading(false);
      setAuthMethod(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (authTab === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (authTab === 'register') {
        const res = await api.registerWithPassword(
          email.trim(),
          password,
          displayName.trim() || email.split('@')[0]
        );
        onLoginSuccess(res.user);
      } else {
        const res = await api.loginWithPassword(email.trim(), password);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      console.error('Password authentication failed:', err);
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for live demo scanning
  const hasToken = demoText.includes('tok_') || demoText.includes('AIzaSy') || demoText.includes('bearer');
  const hasEmail = demoText.includes('@');
  const redactedDemoText = demoText
    .replace(/(bearer_tok_[a-zA-Z0-9]+|AIzaSy[a-zA-Z0-9_-]{15,35})/g, '[SECRET_TOKEN_REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');

  return (
    <div className="min-h-screen w-screen bg-[#080a0f] text-slate-100 flex flex-col justify-between select-none overflow-x-hidden relative">
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="h-16 px-6 lg:px-12 border-b border-white/[0.08] flex items-center justify-between z-10 backdrop-blur-2xl bg-[#090d16]/80">
        <AegisAILogo size="sm" variant="full" glow={true} />

        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-mono text-[11px] text-teal-300 uppercase tracking-wider">
            Privacy Boundary Active
          </span>
        </div>
      </header>

      {/* Main Public Presentation & Sign-In */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10">
        {/* Left: Product Thesis & Interactive Demo */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            {/* Top Star Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/15 via-sky-500/15 to-amber-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Memory Governance & Security Firewall</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
              Your AI memory, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-300 to-amber-200">
                under your control.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              AegisAI introduces a zero-trust privacy checkpoint and explicit memory governance layer between your thoughts and AI models. Decide what is remembered, why it may be used, and revoke it anytime with immediate effect.
            </p>
          </div>

          {/* Interactive Privacy Guardian Demo Widget on Landing Page */}
          <div className="p-5 rounded-2xl bg-[#0d1117]/90 border border-white/[0.08] backdrop-blur-xl space-y-3 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                <Fingerprint className="w-4 h-4 text-teal-400" />
                <span>TRY PRIVACY GUARDIAN LIVE</span>
              </div>
              <div className="flex gap-1 bg-[#111724] p-1 rounded-lg border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setDemoActiveTab('scan')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                    demoActiveTab === 'scan'
                      ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Input
                </button>
                <button
                  type="button"
                  onClick={() => setDemoActiveTab('redacted')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                    demoActiveTab === 'redacted'
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sanitized Preview
                </button>
              </div>
            </div>

            {demoActiveTab === 'scan' ? (
              <div className="space-y-2">
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  placeholder="Type or paste any prompt containing credentials or emails..."
                  className="w-full h-18 bg-[#090d16] border border-white/[0.08] rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 resize-none"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Detections: {(hasToken ? 1 : 0) + (hasEmail ? 1 : 0)} sensitive findings</span>
                  </div>
                  <div className="flex gap-2">
                    {hasToken && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[10px]">
                        TOKEN DETECTED
                      </span>
                    )}
                    {hasEmail && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px]">
                        EMAIL DETECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-[#090d16] border border-teal-500/30 rounded-xl text-xs font-mono text-teal-200 min-h-[72px] leading-relaxed">
                  {redactedDemoText}
                </div>
                <p className="text-[10px] text-teal-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sanitized locally before transmitting prompt to Gemini model backend.</span>
                </p>
              </div>
            )}
          </div>

          {/* Privacy & Boundary Proof Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-slate-300 p-2.5 rounded-xl bg-[#0e131f]/60 border border-white/[0.06]">
              <Lock className="w-4 h-4 text-teal-400 shrink-0" />
              <span>User Data Isolation</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-2.5 rounded-xl bg-[#0e131f]/60 border border-white/[0.06]">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Secret Manager Backend</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-2.5 rounded-xl bg-[#0e131f]/60 border border-white/[0.06]">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
              <span>SHA-256 Audit Ledger</span>
            </div>
          </div>
        </div>

        {/* Right: Obsidian & Glass Sign-In Panel */}
        <div className="lg:col-span-5">
          <div className="bg-[#0d1117]/90 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6">
            {/* Top Mineral Gradient Rim */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-sky-400 to-amber-400"></div>

            <div className="space-y-2 text-center pb-1">
              <div className="flex justify-center mb-3">
                <AegisAILogo size="lg" variant="icon-only" glow={true} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display">
                Enter AegisAI
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Sign in to open your encrypted, private AI memory governance workspace.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Google OAuth Sign-In */}
            <button
              onClick={handleGoogleOAuthLogin}
              disabled={loading}
              id="btn-google-signin"
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading && authMethod === 'oauth' ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {loading && authMethod === 'oauth'
                  ? 'Connecting Google Auth...'
                  : 'Continue with Google'}
              </span>
            </button>

            {/* Google OAuth Status / Guidance Modal */}
            {showOAuthNotice && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                <div className="bg-[#0e1320] border border-white/[0.12] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Google OAuth Setup Status</h3>
                        <p className="text-[11px] text-slate-400">Firebase Authentication Error</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOAuthNotice(false)}
                      className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/[0.08]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    {oauthErrorDetails && (
                      <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-200 space-y-2">
                        <p className="font-semibold text-amber-300">Firebase Error Reason:</p>
                        <p className="font-mono text-[10px] break-words text-slate-300 bg-black/30 p-2 rounded border border-white/[0.05]">
                          {oauthErrorDetails}
                        </p>

                        <div className="pt-1 text-slate-300 space-y-1.5">
                          <p className="font-semibold text-amber-300 text-xs">
                            How to enable Google OAuth for this domain:
                          </p>
                          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                            <li>Go to <span className="text-white font-medium">Firebase Console &gt; Authentication &gt; Settings</span>.</li>
                            <li>Scroll to <span className="text-white font-medium">Authorized Domains</span> and click <span className="text-teal-300 font-medium">Add domain</span>.</li>
                            <li>Add the preview domain(s) below:</li>
                          </ol>

                          <div className="p-2 bg-black/40 rounded border border-white/[0.08] font-mono text-[10px] text-teal-300 space-y-0.5">
                            <div>ais-dev-xs3hlr27k44lil737kpbpp-448521234429.asia-southeast1.run.app</div>
                            <div>ais-pre-xs3hlr27k44lil737kpbpp-448521234429.asia-southeast1.run.app</div>
                          </div>

                          <button
                            type="button"
                            onClick={handleCopyDomains}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-teal-400" />
                            {copiedDomains ? '✓ Domains Copied to Clipboard!' : 'Copy Domains to Clipboard'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="p-3.5 bg-[#131929] border border-teal-500/30 rounded-xl space-y-2">
                      <p className="font-semibold text-teal-300 text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-teal-400" />
                        Instant Access (No Domain Whitelisting Required):
                      </p>
                      <p className="text-[11px] text-slate-300">
                        You can sign in or create an account immediately using the form right below with zero-trust cryptographic vault isolation.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('register');
                            setShowOAuthNotice(false);
                          }}
                          className="px-3.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Create Account Below
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('signin');
                            setShowOAuthNotice(false);
                          }}
                          className="px-3.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Sign In with Password
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOAuthNotice(false)}
                    className="w-full py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20"
                  >
                    Close and Continue Below
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full"></div>
              <span className="bg-[#0d1117] px-3 text-[11px] font-medium text-slate-400 shrink-0">
                Or authenticate with password
              </span>
              <div className="border-t border-white/[0.08] w-full"></div>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#111726] rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authTab === 'signin'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authTab === 'register'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Password Auth Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@domain.com"
                  className="w-full bg-[#111726] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Master Password
                  </label>
                  {authTab === 'signin' && (
                    <span className="text-[10px] text-slate-400">
                      Minimum 6 characters
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    minLength={6}
                    className="w-full bg-[#111726] border border-white/[0.1] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authTab === 'register' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Varun or Security Lead"
                    className="w-full bg-[#111726] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating Vault...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {authTab === 'signin' ? 'Sign In to Protected Vault' : 'Create Encrypted Vault'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee Box */}
            <div className="p-3.5 bg-[#060911]/90 rounded-xl border border-white/[0.06] space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-[11px]">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero-Trust Model Partition</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your journal entries and memories are isolated to your account. Cross-user access is blocked at the authorization layer.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="h-14 border-t border-white/[0.08] px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 z-10 bg-[#090d16]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 font-display">AegisAI</span>
          <span>•</span>
          <span>Your AI remembers only what you permit.</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Private • Governed • Yours
        </div>
      </footer>
    </div>
  );
};

