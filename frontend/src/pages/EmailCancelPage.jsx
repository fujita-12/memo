import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { cancelEmailChange, logout } from '../api/client';
import { setFlashInfo } from '../utils/sessionFlash.js';

export default function EmailCancelPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const resetMessages = () => {
    setInfo('');
    setError('');
  };

  const handleCancel = async () => {
    if (!token || loading) return;

    resetMessages();
    setLoading(true);
    try {
      const res = await cancelEmailChange({ token });

      let msg = '拒否しました（メールアドレス変更はキャンセルされました）';
      if (res.status === 'canceled') {
        msg = '拒否しました（メールアドレス変更はキャンセルされました）';
      } else if (res.status === 'already_completed') {
        const s = res.completion_status;
        if (s === 'confirmed') msg = 'すでに確定済みです。';
        else if (s === 'canceled') msg = 'すでに拒否済みです。';
        else if (s === 'expired') msg = '期限切れです。';
        else msg = 'すでに処理済みです。';
      } else {
        msg = 'リンクが無効、または処理済みです。';
      }

      await logout().catch(() => {});

      setFlashInfo(msg);
      navigate('/auth', { replace: true });
    } catch (e) {
      const { message } = pickLaravelErrors(e);
      setError(message || '拒否に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  //  token無しエラーは「未処理の時だけ」表示
  const showTokenMissing = !token && !info && !error;

  return (
    <AppShell info={info} error={error} showTabs={false}>
      <h2>メールアドレス変更の拒否（旧メール）</h2>

      {showTokenMissing ? (
        <p className="flashErr">リンクが不正です（token が見つかりません）。</p>
      ) : (
        <>
          {/* tokenがある時だけ説明＆拒否ボタンを出す（処理後は出さない） */}
          {token && (
            <>
              <p className="small">心当たりがない場合は拒否してください。</p>

              <div className="mt24">
                <Button onClick={handleCancel} disabled={loading} variant="primary" size="md" align="center">
                  {loading ? '...' : '拒否する'}
                </Button>
              </div>
              <div className="mt24">
                <Button onClick={() => navigate('/login', { replace: true })} disabled={loading} variant="black" size="md" align="center">
                  Loginへ戻る
                </Button>
              </div>
            </>
          )}

          {/* 処理後は、戻るボタンだけ出す（好みで） */}
          {!token && (info || error) && (
            <div className="row mt12">
              <Button onClick={() => navigate('/login', { replace: true })} disabled={loading} variant="black" size="md" align="center">
                Loginへ戻る
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
