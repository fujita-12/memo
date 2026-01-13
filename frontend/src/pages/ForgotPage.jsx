import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { forgotPassword } from '../api/client';

export default function ForgotPage() {
  // const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const resetMessages = () => {
    setInfo('');
    setError('');
    setFieldErrors({});
  };

  const handleForgot = async () => {
    resetMessages();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setInfo('パスワード再設定メールを送信しました。Mailpit（http://localhost:8025）を確認してください。');
    } catch (e) {
      const { message, fieldErrors } = pickLaravelErrors(e);
      setError(message || '送信に失敗しました');
      setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell info={info} error={error} showTabs={false}>
      <div className="default-box-bg">
        <h2>パスワード再設定</h2>
        <p className="small">登録したメールアドレスを入力すると、再設定リンクを送ります。</p>
        <table className="main-table">
          <tbody>
            <tr>
              <th>メールアドレス</th>
              <td>
                <TextField placeholder="メールアドレスを入力してください" value={email} onChange={setEmail} readOnly={loading} />
                {fieldErrors.email && <p className="flashErr">{fieldErrors.email[0]}</p>}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt36">
          <Button onClick={handleForgot} disabled={loading} variant="primary" size="md" align="center">
            {loading ? '...' : '送信'}
          </Button>
        </div>
        <hr />
        <div>
          <Button to="/login" disabled={loading} variant="black" size="md" align="center">
            ログインへ戻る
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
