import { useCallback } from 'react';

import AppShell from '../../components/AppShell.jsx';
import TextField from '../../components/TextField.jsx';
import Button from '../../components/Button.jsx';

import { useFlash } from '../../hooks/useFlash.js';
import { useEmailChangeRequest } from '../../hooks/useEmailChangeRequest.js';
import { getUser } from '../../api/client';

export default function SettingsEmailPage({ user, onUserUpdated }) {
  const flash = useFlash();

  const refreshUser = useCallback(async () => {
    const u = await getUser().catch(() => null);
    if (u) onUserUpdated?.(u);
  }, [onUserUpdated]);

  const email = useEmailChangeRequest({ flash, refreshUser });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <div className={`default-box-bg`}>
        <h2>メールアドレス変更</h2>
        <p className="small">
          旧メールに「承認/拒否リンク」を送ります。承認後に新メールへ確定リンクが届きます。
        </p>
        {user.pending_email && (
          <p className="small">
            変更待ち: <b>{user.pending_email}</b>（旧メールの承認が必要）
          </p>
        )}
        <table className="main-table">
          <tbody>
            <tr>
              <th>メールアドレス</th>
              <td>
                <TextField
                  placeholder="新しいメールアドレスを入力してください"
                  value={email.newEmail}
                  onChange={email.setNewEmail}
                  readOnly={email.loadingEmail}
                />
                {email.emailFieldErrors.new_email && (
                  <p className="flashErr">{email.emailFieldErrors.new_email[0]}</p>
                )}
              </td>
            </tr>
            <tr>
              <th>パスワード</th>
              <td>
                <TextField
                  placeholder="パスワードを入力してください"
                  type="password"
                  value={email.emailChangePw}
                  onChange={email.setEmailChangePw}
                  readOnly={email.loadingEmail}
                />
                {email.emailFieldErrors.current_password && (
                  <p className="flashErr">{email.emailFieldErrors.current_password[0]}</p>
                )}
              </td>
            </tr>
          </tbody>
        </table> 

        <div className="mt36">
          <Button
            onClick={email.requestEmailChangeAction}
            disabled={email.loadingEmail || !email.newEmail || !email.emailChangePw}
            variant="primary" 
            size="md" 
            align="center"
          >
            {email.loadingEmail ? '...' : '承認/拒否リンクを送る'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}