// src/pages/ResetPage.jsx
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { resetPassword } from '../api/client';

import { setFlashInfo, setFlashEmail } from '../utils/sessionFlash.js';

export default function ResetPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // クエリから読む（/reset?token=...&email=...）
  const token = useMemo(() => params.get('token') || '', [params]);
  const email = useMemo(() => params.get('email') || '', [params]);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const resetMessages = () => {
    setInfo('');
    setError('');
    setFieldErrors({});
  };

  const handleReset = async () => {
    if (!token || loading) return;

    resetMessages();
    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // 次画面で表示したいメッセージを積む（/auth→/loginへ流れる）
      setFlashInfo('パスワードを更新しました。ログインしてください。');
      if (email) setFlashEmail(email);

      // /auth に寄せる（AuthPage が /login へ state 渡す）
      navigate('/auth', { replace: true });
    } catch (e) {
      const { message, fieldErrors } = pickLaravelErrors(e);
      setError(message || '再設定に失敗しました');
      setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell info={info} error={error}>
      <div className="default-box-bg">
        <h2>パスワード再設定</h2>
        {!token ? (
          <p className="flashErr">リセット用リンクから開いてください（token が見つかりません）。</p>
        ) : (
          <>
            <table className="main-table">
              <tbody>
                <tr>
                  <th>メールアドレス</th>
                  <td>
                    <TextField value={email} readOnly />
                  </td>
                </tr>
                <tr>
                  <th>新しいパスワード</th>
                  <td>
                    <TextField
                      placeholder="new password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      readOnly={loading}
                    />
                    {fieldErrors.password && <p className="flashErr">{fieldErrors.password[0]}</p>}
                  </td>
                </tr>
                <tr>
                  <th>パスワード（確認）</th>
                  <td>
                    <TextField
                      placeholder="password confirmation"
                      type="password"
                      value={passwordConfirmation}
                      onChange={setPasswordConfirmation}
                      readOnly={loading}
                    />
                    {fieldErrors.password_confirmation && (
                      <p className="flashErr">{fieldErrors.password_confirmation[0]}</p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>    
            <div className="mt36">
              <Button onClick={handleReset} disabled={loading || !token} variant="primary" size="md" align="center">
                {loading ? '...' : 'パスワードを更新'}
              </Button>
            </div>
            <hr />
            <div>
              <Button to="/login" disabled={loading} variant="black" size="md" align="center">
                Loginへ戻る
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
