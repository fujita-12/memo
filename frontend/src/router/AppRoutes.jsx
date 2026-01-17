// src/router/AppRoutes.jsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import AuthPage from '../pages/AuthPage.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ForgotPage from '../pages/ForgotPage.jsx';
import ResetPage from '../pages/ResetPage.jsx';

import VerifyNoticePage from '../pages/VerifyNoticePage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import SettingsIndexPage from '../pages/settings/SettingsIndexPage.jsx';
import SettingsEmailPage from '../pages/settings/SettingsEmailPage.jsx';
import SettingsPasswordPage from '../pages/settings/SettingsPasswordPage.jsx';
import SettingsDeletePage from '../pages/settings/SettingsDeletePage.jsx';

import NotebooksPage from '../pages/NotebooksPage.jsx';
import NotebookCreatePage from '../pages/NotebookCreatePage.jsx';
import NotesPage from '../pages/NotesPage.jsx';
import NotePage from '../pages/NotePage.jsx';

import PasswordListsPage from '../pages/PasswordListsPage.jsx';
import PasswordListCreatePage from '../pages/PasswordListCreatePage.jsx';
import PasswordItemsPage from '../pages/PasswordItemsPage.jsx';
import PasswordItemPage from '../pages/PasswordItemPage.jsx';

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

        {/* Password */}
        <Route path="/password-lists" element={<PasswordListsPage />} />
        <Route path="/password-lists/create" element={<PasswordListCreatePage />} />
        <Route path="/password-lists/:listId" element={<PasswordItemsPage />} />
        <Route path="/password-lists/:listId/items/:itemId" element={<PasswordItemPage />} />

        {/* Notebook */}
        <Route path="/notebooks" element={<NotebooksPage />} />
        <Route path="/notebooks/create" element={<NotebookCreatePage />} />
        <Route path="/notebooks/:notebookId" element={<NotesPage />} />
        <Route path="/notebooks/:notebookId/notes/:noteId" element={<NotePage />} />

        <Route
          path="/settings"
          element={<SettingsIndexPage user={user} />}
        />
        <Route
          path="/settings/email"
          element={<SettingsEmailPage user={user} onUserUpdated={onUserUpdated} />}
        />
        <Route
          path="/settings/password"
          element={<SettingsPasswordPage user={user} />}
        />
        <Route
          path="/settings/delete"
          element={<SettingsDeletePage user={user} onLoggedOut={onLoggedOut} />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
