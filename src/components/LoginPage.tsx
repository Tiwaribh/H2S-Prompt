'use client';

import React, { useState } from 'react';
import {
  Wind,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading, authError, isConfigured } = useAuth();
  const [showSetupGuide, setShowSetupGuide] = useState(!isConfigured);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const envTemplate = `# Firebase Google OAuth Credentials (Client-side identity verification only)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-sm font-black">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">AirSathi</h1>
              <p className="text-xs font-semibold text-emerald-700">Civic Air Intelligence</p>
            </div>
            <p className="text-xs text-slate-500 italic max-w-xs leading-relaxed">
              "From live air quality data to local action."
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Sign in to Access Civic Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Identity verification required to access live municipal telemetry and AI briefings.
            </p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-left flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{authError}</div>
            </div>
          )}

          {/* EXACTLY ONE AUTHENTICATION BUTTON: Continue with Google */}
          <div>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
              ) : (
                /* Official Google "G" SVG icon */
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Privacy & Zero-Database Architecture Notice */}
          <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-left text-[11px] text-slate-500 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              <strong>Zero-Database Identity Verification:</strong> Google OAuth is strictly used to authenticate your session. User profiles, login history, and municipal reports are never stored on any backend database.
            </p>
          </div>
        </div>

        {/* Missing Credentials Setup Guide (Only shown or expanded if env is not configured) */}
        {!isConfigured && (
          <div className="bg-white rounded-2xl border border-amber-200/90 shadow-xs p-5 text-xs text-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Google OAuth Configuration Guide</span>
              </div>
              <button
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="text-amber-700 hover:text-amber-900"
              >
                {showSetupGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              To enable live Google Sign-In on your environment, configure your Firebase project credentials in <code>.env.local</code>.
            </p>

            {showSetupGuide && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600">
                  <li>
                    Open the{' '}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      Firebase Console <ExternalLink className="w-3 h-3 inline" />
                    </a>{' '}
                    and create/select a project.
                  </li>
                  <li>
                    Go to <strong>Build &gt; Authentication &gt; Sign-in method</strong> and enable <strong>Google</strong>.
                  </li>
                  <li>
                    In <strong>Project Settings &gt; General &gt; Your apps</strong>, copy the web app credentials into your <code>.env.local</code> file:
                  </li>
                </ol>

                <div className="relative bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[10px] overflow-x-auto">
                  <button
                    onClick={handleCopyEnv}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy environment template"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="pr-8">{envTemplate}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
