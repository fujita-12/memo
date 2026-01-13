import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { approveEmailChange } from '../api/client';

export default function EmailApprovePage() {
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

  const handleApprove = async () => {
    if (!token || loading) return;

    resetMessages();
    setLoading(true);
    try {
      const res = await approveEmailChange({ token });

      if (res.status === 'approved_and_sent') {
        setInfo('承認しました。新しいメールに確定リンクを送信しました。');
      } else if (res.status === 'already_approved') {
        setInfo('すでに承認済みです。新しいメールを確認してください。');
      } else if (res.status === 'already_completed') {
        const s = res.completion_status;
        if (s === 'confirmed') setInfo('この変更はすでに確定済みです。');
        else if (s === 'canceled') setInfo('この変更はすでに拒否済みです。');
        else if (s === 'expired') setInfo('この変更は期限切れです。');
        else setInfo('この変更はすでに処理済みです。');
      } else if (res.status === 'expired') {
        setError('このリンクは期限切れです。もう一度やり直してください。');
      } else {
        setError('リンクが無効、または処理済みです。');
      }

      // ✅ 「処理済み」扱いにして token無しエラー表示を止める
      setDone(true);

      // ✅ tokenをURLから消してページに残す
      navigate('/email/approve', { replace: true });
    } catch (e) {
      const { message } = pickLaravelErrors(e);
      setError(message || '承認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ✅ token無しエラーは「未処理の時だけ」表示
  const showTokenMissing = !token && !done && !info && !error;

  return (
    <AppShell info={info} error={error} showTabs={false}>
      <h2>メールアドレス変更の承認（旧メール）</h2>

      {showTokenMissing ? (
        <p className="flashErr">リンクが不正です（token が見つかりません）。</p>
      ) : (
        <>
          {/* tokenがある時だけ説明＆承認ボタンを出す（処理後は出さない） */}
          {token && (
            <>
              <p className="small">承認すると、新しいメールアドレスに「確定リンク」を送信します。</p>

              <div className="row mt12">
                <Button onClick={handleApprove} disabled={loading}>
                  {loading ? '...' : '承認する'}
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
