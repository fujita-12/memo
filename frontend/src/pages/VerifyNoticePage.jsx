// src/pages/VerifyNoticePage.jsx
import { useCallback, useState } from 'react';

import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';

import { resendVerification, getUser } from '../api/client';

import { useFlash } from '../hooks/useFlash.js';
import { useLogoutAction } from '../hooks/useLogoutAction.js';
import { useAccountDeletion } from '../hooks/useAccountDeletion.js';
import { setFlashInfo } from '../utils/sessionFlash.js';

export default function VerifyNoticePage({ user, onLoggedOut, onUserUpdated }) {
  const flash = useFlash();

  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const refreshUser = useCallback(async () => {
    const u = await getUser().catch(() => null);
    if (u) onUserUpdated?.(u);
    return u;
  }, [onUserUpdated]);

  const { loadingLogout, logoutAction } = useLogoutAction({ flash, onLoggedOut });

  const del = useAccountDeletion({
    flash,
    onDeleted: () => {
      setFlashInfo('退会しました。ご利用ありがとうございました。');
      onLoggedOut?.();
      window.location.replace(import.meta.env.BASE_URL + 'auth');
    },
  });

  const handleResend = async () => {
    flash.reset();
    setLoadingResend(true);
    try {
      await resendVerification();
      flash.info = '認証メールを再送しました。Mailpit（http://localhost:8025）を確認してください。';
    } catch (e) {
      flash.fail(e, '再送に失敗しました');
    } finally {
      setLoadingResend(false);
    }
  };

  const handleRefresh = async () => {
    flash.reset();
    setLoadingRefresh(true);
    try {
      const u = await refreshUser();
      if (u?.email_verified_at) {
        setFlashInfo('メール認証が完了しました。');
        window.location.replace(import.meta.env.BASE_URL + 'auth');
      } else {
        flash.info = 'まだ未認証です。メールのリンクを開いてください。';
      }
    } catch (e) {
      flash.fail(e, '更新に失敗しました');
    } finally {
      setLoadingRefresh(false);
    }
  };

  const disabledAny = loadingResend || loadingRefresh || loadingLogout || del.loadingDelete;

  return (
    <AppShell info={flash.info} error={flash.error}>
      <p>ログイン中: {user.email}</p>

      <Section title="メール認証が未完了です">
        <p className="small">届いたメールのリンクを開いてください。</p>

        <div className="row mt12">
          <Button onClick={handleResend} disabled={disabledAny}>
            {loadingResend ? '...' : '認証メールを再送'}
          </Button>

          <Button onClick={handleRefresh} disabled={disabledAny}>
            {loadingRefresh ? '...' : '認証状態を更新'}
          </Button>
        </div>
      </Section>

      <Section title="退会（アカウント削除）">
        <p className="small">確認のため現在のパスワードを入力してください。</p>

        <TextField
          placeholder="現在のパスワード"
          type="password"
          value={del.deletePw}
          onChange={del.setDeletePw}
          readOnly={del.loadingDelete}
        />
        {del.deleteFieldErrors.current_password && <p className="flashErr">{del.deleteFieldErrors.current_password[0]}</p>}

        <div className="row mt12">
          <Button
            onClick={() => {
              const ok = confirm('本当に退会しますか？ノート/ノートブックも全て削除されます。');
              if (!ok) return;
              del.deleteAccountAction({ confirmed: true });
            }}
            disabled={del.loadingDelete || !del.deletePw}
          >
            {del.loadingDelete ? '...' : '退会する'}
          </Button>
        </div>
      </Section>

      <div className="mt16">
        <Button onClick={logoutAction} disabled={loadingLogout || disabledAny}>
          {loadingLogout ? '...' : 'Logout'}
        </Button>
      </div>
    </AppShell>
  );
}
