import AppShell from '../../components/AppShell.jsx';
import Section from '../../components/Section.jsx';
import TextField from '../../components/TextField.jsx';
import Button from '../../components/Button.jsx';

import { useFlash } from '../../hooks/useFlash.js';
import { usePasswordChange } from '../../hooks/usePasswordChange.js';

export default function SettingsPasswordPage() {
  const flash = useFlash();
  const pw = usePasswordChange({ flash });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="パスワード変更">

        <table className="main-table">
          <tbody>
            <tr>
              <th>現在のパスワード</th>
              <td>
                <TextField
                  placeholder="現在のパスワードを入力してください"
                  type="password"
                  value={pw.currentPassword}
                  onChange={pw.setCurrentPassword}
                  readOnly={pw.loadingPw}
                />
                {pw.pwFieldErrors.current_password && (
                  <p className="flashErr">{pw.pwFieldErrors.current_password[0]}</p>
                )}
              </td>
            </tr>
            <tr>
              <th>新しいパスワード</th>
              <td>
                <TextField
                  placeholder="新しいパスワードを入力してください"
                  type="password"
                  value={pw.newPassword}
                  onChange={pw.setNewPassword}
                  readOnly={pw.loadingPw}
                />
                {pw.pwFieldErrors.password && (
                  <p className="flashErr">{pw.pwFieldErrors.password[0]}</p>
                )}
              </td>
            </tr>
            <tr>
              <th>パスワード（確認）</th>
              <td>
                <TextField
                  placeholder="新しいパスワードを再度入力してください"
                  type="password"
                  value={pw.newPasswordConfirmation}
                  onChange={pw.setNewPasswordConfirmation}
                  readOnly={pw.loadingPw}
                />
                {pw.pwFieldErrors.password_confirmation && (
                  <p className="flashErr">{pw.pwFieldErrors.password_confirmation[0]}</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>        
        <div className="mt24">
          <Button onClick={pw.changePasswordAction} disabled={pw.loadingPw} variant="primary" size="md" align="center">
            {pw.loadingPw ? '...' : '変更する'}
          </Button>
        </div>
      </Section>
    </AppShell>
  );
}