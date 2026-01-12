import AppShell from '../../components/AppShell.jsx';
import Section from '../../components/Section.jsx';
import TextField from '../../components/TextField.jsx';
import Button from '../../components/Button.jsx';

import { useFlash } from '../../hooks/useFlash.js';
import { usePasswordChange } from '../../hooks/usePasswordChange.js';

export default function SettingsPasswordPage({ user }) {
  const flash = useFlash();
  const pw = usePasswordChange({ flash });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <p>ログイン中: {user.email}</p>

      <Section title="パスワード変更">
        <TextField
          placeholder="current password"
          type="password"
          value={pw.currentPassword}
          onChange={pw.setCurrentPassword}
          readOnly={pw.loadingPw}
        />
        {pw.pwFieldErrors.current_password && (
          <p className="flashErr">{pw.pwFieldErrors.current_password[0]}</p>
        )}

        <div className="mt8" />

        <TextField
          placeholder="new password"
          type="password"
          value={pw.newPassword}
          onChange={pw.setNewPassword}
          readOnly={pw.loadingPw}
        />
        {pw.pwFieldErrors.password && (
          <p className="flashErr">{pw.pwFieldErrors.password[0]}</p>
        )}

        <div className="mt8" />

        <TextField
          placeholder="new password confirmation"
          type="password"
          value={pw.newPasswordConfirmation}
          onChange={pw.setNewPasswordConfirmation}
          readOnly={pw.loadingPw}
        />
        {pw.pwFieldErrors.password_confirmation && (
          <p className="flashErr">{pw.pwFieldErrors.password_confirmation[0]}</p>
        )}

        <div className="mt12 row">
          <Button onClick={pw.changePasswordAction} disabled={pw.loadingPw}>
            {pw.loadingPw ? '...' : '変更する'}
          </Button>
        </div>
      </Section>
    </AppShell>
  );
}