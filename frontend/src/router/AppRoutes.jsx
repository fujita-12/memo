// src/router/AppRoutes.jsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import AuthPage from '../pages/AuthPage.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ForgotPage from '../pages/ForgotPage.jsx';
import ResetPage from '../pages/ResetPage.jsx';

import VerifyNoticePage from '../pages/VerifyNoticePage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';

import EmailApprovePage from '../pages/EmailApprovePage.jsx';
import EmailCancelPage from '../pages/EmailCancelPage.jsx';
import EmailConfirmPage from '../pages/EmailConfirmPage.jsx';

import VerifyEmailPage from '../pages/VerifyEmailPage.jsx';

function RequireAuth({ user }) {
  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
}

function RequireVerified({ user }) {
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.email_verified_at) return <Navigate to="/verify" replace />;
  return <Outlet />;
}

export default function AppRoutes({ user, onUserUpdated, onLoggedOut }) {
  return (
    <Routes>
      {/* 常に /auth に寄せる（ここで状態確定 → dashboard/verify/loginへ振り分け） */}
      <Route path="/" element={<Navigate to="/auth" replace />} />

      {/* /auth は中継ページ */}
      <Route path="/auth" element={<AuthPage onUserUpdated={onUserUpdated} />} />

      {/* public auth pages */}
      <Route path="/login" element={<LoginPage onLoggedIn={onUserUpdated} />} />
      <Route path="/register" element={<RegisterPage onLoggedIn={onUserUpdated} />} />
      <Route path="/forgot" element={<ForgotPage />} />

      {/* ✅ ResetPage がクエリを読む方式に統一 */}
      <Route path="/reset" element={<ResetPage />} />

      {/* email links (guest OK) */}
      <Route path="/email/approve" element={<EmailApprovePage />} />
      <Route path="/email/cancel" element={<EmailCancelPage />} />
      <Route path="/email/confirm" element={<EmailConfirmPage onUserUpdated={onUserUpdated} />} />

      <Route path="/verify-email" element={<VerifyEmailPage onUserUpdated={onUserUpdated} />} />

      {/* auth only */}
      <Route element={<RequireAuth user={user} />}>
        <Route
          path="/verify"
          element={<VerifyNoticePage user={user} onUserUpdated={onUserUpdated} onLoggedOut={onLoggedOut} />}
        />
      </Route>

      {/* auth + verified */}
      <Route element={<RequireVerified user={user} />}>
        <Route
          path="/dashboard"
          element={<DashboardPage user={user} onUserUpdated={onUserUpdated} onLoggedOut={onLoggedOut} />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
