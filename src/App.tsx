import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { onAuthStateChange, getUidFromUser } from './services/auth';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';

import Login from './pages/auth/Login';
import CreateAccount from './pages/auth/CreateAccount';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';

import Analysis from './pages/analysis';
import AnalysisInput from './pages/analysis/Input';
import AnalysisPrivacyReview from './pages/analysis/PrivacyReview';
import AnalysisLoading from './pages/analysis/Loading';
import AnalysisResult from './pages/analysis/Result';
import AnalysisHistory from './pages/analysis/History';

import Tools from './pages/tools';
import MoodCheck from './pages/tools/MoodCheck';
import CognitiveLoad from './pages/tools/CognitiveLoad';
import Lifestyle from './pages/tools/Lifestyle';
import Calm from './pages/tools/Calm';
import Sleep from './pages/tools/Sleep';
import ToolsSounds from './pages/tools/Sounds';

import ConditionHub from './pages/condition';
import ConditionImmediateSupport from './pages/condition/ImmediateSupport';
import ConditionTools from './pages/condition/ConditionTools';
import ConditionSounds from './pages/condition/Sounds';
import ToolSettings from './pages/ToolSettings';

// ---------------------------------------------------------------------------
// Auth bootstrap
//
// Listens to Supabase auth state changes and syncs them into the Zustand
// store. This handles:
//  - Initial page load (Supabase restores the session from localStorage)
//  - Login / logout events
//  - Token refresh
// ---------------------------------------------------------------------------

function AuthBootstrap() {
  const setSession = useAppStore((s) => s.setSession);
  const clearSession = useAppStore((s) => s.clearSession);
  const currentSession = useAppStore((s) => s.session);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((event, supabaseSession) => {
      if (supabaseSession?.user) {
        const user = supabaseSession.user;
        const uid = getUidFromUser(user);
        // Only update if the userId actually changed to avoid thrashing
        if (!currentSession || currentSession.userId !== user.id) {
          setSession({
            userId: user.id,
            uid,
            sessionStart: new Date().toISOString(),
            isDemo: false,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        // Only clear if we were not in demo mode
        const storeSession = useAppStore.getState().session;
        if (storeSession && !storeSession.isDemo) {
          clearSession();
        }
      }
    });

    return unsubscribe;
    // Intentionally not listing currentSession as a dep — we only need
    // the subscription set up once. The callback reads the latest state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSession, clearSession]);

  return null;
}

// ---------------------------------------------------------------------------
// Protected route — waits for Supabase session resolution before deciding
// ---------------------------------------------------------------------------

function ProtectedRoute() {
  const session = useAppStore((s) => s.session);
  // Legacy account field — still used by some components during transition
  const account = useAppStore((s) => s.account);

  // Allow access if either the new Supabase session OR the legacy demo
  // account is present (demo mode sets both session and account).
  const isAuthenticated = session !== null || account !== null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <AppLayout />;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function App() {
  // Track whether we have completed the initial auth check.
  // Supabase restores the session asynchronously on first load — we need
  // to avoid flashing the login page before the session is confirmed.
  const [authReady, setAuthReady] = useState(false);
  const setSession = useAppStore((s) => s.setSession);
  const clearSession = useAppStore((s) => s.clearSession);

  useEffect(() => {
    // Subscribe to auth changes. The first event fires immediately with the
    // current session state (INITIAL_SESSION), letting us set authReady.
    const unsubscribe = onAuthStateChange((event, supabaseSession) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (supabaseSession?.user) {
          const uid = getUidFromUser(supabaseSession.user);
          setSession({
            userId: supabaseSession.user.id,
            uid,
            sessionStart: new Date().toISOString(),
            isDemo: false,
          });
        }
        setAuthReady(true);
      } else if (event === 'SIGNED_OUT') {
        const storeSession = useAppStore.getState().session;
        if (storeSession && !storeSession.isDemo) {
          clearSession();
        }
        setAuthReady(true);
      } else {
        // TOKEN_REFRESHED and other events — mark ready if not already
        setAuthReady(true);
      }
    });

    return unsubscribe;
  }, [setSession, clearSession]);

  // Show nothing (or a minimal loader) until Supabase has resolved the
  // initial session. This prevents the login redirect flash.
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 rounded-full border-2 border-accent-lavender/30 border-t-accent-lavender animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="create" element={<CreateAccount />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Home />} />

          <Route path="analysis" element={<Analysis />}>
            <Route path="input" element={<AnalysisInput />} />
            <Route path="privacy-review" element={<AnalysisPrivacyReview />} />
            <Route path="loading" element={<AnalysisLoading />} />
            <Route path="result" element={<AnalysisResult />} />
            <Route path="history" element={<AnalysisHistory />} />
          </Route>

          <Route path="tools" element={<Tools />}>
            <Route path="mood-check" element={<MoodCheck />} />
            <Route path="cognitive-load" element={<CognitiveLoad />} />
            <Route path="lifestyle" element={<Lifestyle />} />
            <Route path="calm" element={<Calm />} />
            <Route path="sleep" element={<Sleep />} />
            <Route path="sounds" element={<ToolsSounds />} />
          </Route>

          <Route path="journal" element={<Journal />} />
          <Route path="insights" element={<Insights />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tool-settings" element={<ToolSettings />} />

          <Route path=":conditionId" element={<ConditionHub />}>
            <Route path="immediate-support" element={<ConditionImmediateSupport />} />
            <Route path="tools" element={<ConditionTools />} />
            <Route path="sounds" element={<ConditionSounds />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
