// src/pages/EmailConfirmPage.jsx
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { confirmEmailChange, logout } from '../api/client';

import { setFlashInfo, setFlashEmail } from '../utils/sessionFlash.js';

export default function EmailConfirmPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token') || '', [params]);
  const email = useMemo(() => params.get('email') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const resetMessages = () => {
    setInfo('');
    setError('');
  };

  const goAuthWithFlash = (message) => {
    setFlashInfo(message);
    if (email) setFlashEmail(email);
    navigate('/auth', { replace: true }); // ✅ token付きURLを消して /auth へ
  };

  const handleConfirm = async () => {
    if (!token || loading) return;

    resetMessages();
    setLoading(true);

    try {
      const res = await confirmEmailChange({ token, email });

      // ✅ 成功（確定）
      if (res.status === 'confirmed') {
        // セッションを切って「新メールで再ログイン」運用にする
        await logout().catch(() => {});
        goAuthWithFlash('メールアドレスを変更しました。新しいメールアドレスでログインしてください。');
        return;
      }

      // ✅ すでに確定済み（同じリンクを踏んだ等）
      if (res.status === 'already_completed' && res.completion_status === 'confirmed') {
        await logout().catch(() => {});
        goAuthWithFlash('メールアドレスはすでに変更済みです。新しいメールアドレスでログインしてください。');
        return;
      }

      // 以下はページに残して案内（tokenを消したいならここでも /auth に飛ばしてOK）
      if (res.status === 'not_approved_yet') {
        setError('旧メールの承認がまだ完了していません。先に旧メールの「承認」を行ってください。');
        return;
      }

      if (res.status === 'expired') {
        setError('リンクが期限切れです。もう一度やり直してください。');
        return;
      }

      if (res.status === 'already_completed') {
        const s = res.completion_status;
        if (s === 'canceled') setError('この変更は旧メール側で拒否されています。');
        else if (s === 'expired') setError('このリンクは期限切れです。');
        else setError('すでに処理済みです。');
        return;
      }

      if (res.status === 'email_conflict') {
        setError(res.message || 'このメールアドレスは既に使用されています。');
        return;
      }

      setError('リンクが無効、または処理済みです。');
    } catch (e) {
      const { message } = pickLaravelErrors(e);
      setError(message || '確定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell info={info} error={error} showTabs={false}>
      <h2>メールアドレス変更の確定（新メール）</h2>

      {!token ? (
        <p className="flashErr">リンクが不正です（token が見つかりません）。</p>
      ) : (
        <>
          <p className="small">次のメールアドレスへ変更します。問題なければ確定してください。</p>

          <p className="small">
            変更先: <b>{email || '(email未指定)'}</b>
          </p>

          <div className="row mt12">
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? '...' : '確定する'}
            </Button>

            <Button onClick={() => navigate('/login', { replace: true })} disabled={loading}>
              Loginへ戻る
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
