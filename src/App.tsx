import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAppStore } from './store';
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

import ConditionHub from './pages/condition';
import ConditionImmediateSupport from './pages/condition/ImmediateSupport';
import ConditionTools from './pages/condition/ConditionTools';
import ConditionSounds from './pages/condition/Sounds';
import ToolSettings from './pages/ToolSettings';

function ProtectedRoute() {
  const account = useAppStore((state) => state.account);
  if (!account) {
    return <Navigate to="/auth/login" replace />;
  }
  return <AppLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="create" element={<CreateAccount />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        <Route
          path="/"
          element={<ProtectedRoute />}
        >
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
