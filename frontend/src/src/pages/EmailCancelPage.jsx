import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { cancelEmailChange } from '../api/client';

export default function EmailCancelPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token') || '', [params]);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  // ✅ 処理済みフラグ（tokenを消しても「tokenが無いエラー」を出さないため）
  const [done, setDone] = useState(false);

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

      if (res.status === 'canceled') {
        setInfo('拒否しました（メールアドレス変更はキャンセルされました）');
      } else if (res.status === 'already_completed') {
        const s = res.completion_status;
        if (s === 'confirmed') setInfo('すでに確定済みです。');
        else if (s === 'canceled') setInfo('すでに拒否済みです。');
        else if (s === 'expired') setInfo('期限切れです。');
        else setInfo('すでに処理済みです。');
      } else {
        setInfo('リンクが無効、または処理済みです。');
      }

      // ✅ 「処理済み」扱いにして token無しエラー表示を止める
      setDone(true);

      // ✅ tokenをURLから消してページに残す
      navigate('/email/cancel', { replace: true });
    } catch (e) {
      const { message } = pickLaravelErrors(e);
      setError(message || '拒否に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ✅ token無しエラーは「未処理の時だけ」表示
  const showTokenMissing = !token && !done && !info && !error;

  return (
    <AppShell info={info} error={error}>
      <h2>メールアドレス変更の拒否（旧メール）</h2>

      {showTokenMissing ? (
        <p className="flashErr">リンクが不正です（token が見つかりません）。</p>
      ) : (
        <>
          {/* tokenがある時だけ説明＆拒否ボタンを出す（処理後は出さない） */}
          {token && (
            <>
              <p className="small">心当たりがない場合は拒否してください。</p>

              <div className="row mt12">
                <Button onClick={handleCancel} disabled={loading}>
                  {loading ? '...' : '拒否する'}
                </Button>

                <Button onClick={() => navigate('/login', { replace: true })} disabled={loading}>
                  Loginへ戻る
                </Button>
              </div>
            </>
          )}

          {/* 処理後は、戻るボタンだけ出す（好みで） */}
          {!token && (info || error || done) && (
            <div className="row mt12">
              <Button onClick={() => navigate('/login', { replace: true })} disabled={loading}>
                Loginへ戻る
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
