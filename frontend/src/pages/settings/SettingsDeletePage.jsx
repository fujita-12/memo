import AppShell from '../../components/AppShell.jsx';
import Section from '../../components/Section.jsx';
import TextField from '../../components/TextField.jsx';
import Button from '../../components/Button.jsx';

import { useFlash } from '../../hooks/useFlash.js';
import { useAccountDeletion } from '../../hooks/useAccountDeletion.js';
import { setFlashInfo } from '../../utils/sessionFlash.js';

export default function SettingsDeletePage({ user, onLoggedOut }) {
  const flash = useFlash();

  const del = useAccountDeletion({
    flash,
    onDeleted: () => {
      setFlashInfo('退会しました。ご利用ありがとうございました。');
      onLoggedOut?.();

      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      window.location.replace(`${base}/auth`);
    },
  });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <p>ログイン中: {user.email}</p>

      <Section title="退会（アカウント削除）">
        <p className="small">確認のため現在のパスワードを入力してください。</p>

        <TextField
          placeholder="現在のパスワード"
          type="password"
          value={del.deletePw}
          onChange={del.setDeletePw}
          readOnly={del.loadingDelete}
        />
        {del.deleteFieldErrors.current_password && (
          <p className="flashErr">{del.deleteFieldErrors.current_password[0]}</p>
        )}

        <div className="mt12 row">
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
    </AppShell>
  );
}