// src/pages/VerifyEmailPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import api from '../lib/axios.js';
import { getUser } from '../api/client';
import { setFlashInfo } from '../utils/sessionFlash.js';

export default function VerifyEmailPage({ onUserUpdated }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const url = useMemo(() => params.get('url') || '', [params]);

  // URLが無い場合は初期値でエラー表示にして、effectでは触らない
  const [info, setInfo] = useState(url ? 'メール認証を処理中です…' : '');
  const [error, setError] = useState(
    url ? '' : '認証URLが見つかりません。メールのリンクをもう一度開いてください。'
  );

  useEffect(() => {
    if (!url) return;

    (async () => {
      try {
        await api.get(url);

        const u = await getUser().catch(() => null);
        if (u) onUserUpdated?.(u);

        setFlashInfo('メール認証が完了しました。');
        navigate('/auth', { replace: true });
      } catch {
        // ここは「非同期結果」なので setState OK
        setError('メール認証に失敗しました。ログイン状態、リンクの期限切れをご確認ください。');
        setInfo('');
      }
    })();
  }, [url, navigate, onUserUpdated]);

  return (
    <AppShell info={info} error={error} showTabs={false}>
      {info && <p>{info}</p>}
      {error && <p>{error}</p>}
    </AppShell>
  );
}
