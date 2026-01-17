import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { register, getUser } from '../api/client';

export default function RegisterPage({ onLoggedIn }) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

  const handleRegister = async () => {
    resetMessages();
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const u = await getUser();
      onLoggedIn?.(u);

      navigate('/auth', { replace: true });
    } catch (e) {
      const { message, fieldErrors } = pickLaravelErrors(e);
      setError(message || '登録に失敗しました');
      setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell info={info} error={error} showTabs={false}>
      <div className="default-box-bg">
        <h2>新規登録</h2>
        <table className="main-table">
          <tbody>
            <tr>
              <th>ユーザーネーム</th>
              <td>
                <TextField placeholder="お名前を入力してください" value={name} onChange={setName} readOnly={loading} />
                {fieldErrors.name && <p className="flashErr">{fieldErrors.name[0]}</p>}
              </td>
            </tr>
            <tr>
              <th>メールアドレス</th>
              <td>
                <TextField placeholder="メールアドレスを入力してください" value={email} onChange={setEmail} readOnly={loading} />
                {fieldErrors.email && <p className="flashErr">{fieldErrors.email[0]}</p>}
              </td>
            </tr>
            <tr>
              <th>パスワード</th>
              <td>
                <TextField placeholder="パスワードを入力してください" type="password" value={password} onChange={setPassword} readOnly={loading} />
                {fieldErrors.password && <p className="flashErr">{fieldErrors.password[0]}</p>}
              </td>
            </tr>
            <tr>
              <th>パスワード（確認）</th>
              <td>
                <TextField
                  placeholder="パスワード（確認）を入力してください"
                  type="password"
                  value={passwordConfirmation}
                  onChange={setPasswordConfirmation}
                  readOnly={loading}
                />
                {fieldErrors.password_confirmation && <p className="flashErr">{fieldErrors.password_confirmation[0]}</p>}
              </td>
            </tr>
          </tbody>
        </table> 
        <div className="mt36">
          <Button onClick={handleRegister} disabled={loading} variant="primary" size="md" align="center">
            {loading ? '...' : '新規登録する'}
          </Button>
        </div>
        <hr />
        <div>
          <Button to="/login" disabled={loading} variant="black" size="md" align="center">
            ログインへ
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
