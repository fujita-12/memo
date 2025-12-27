// src/pages/LoginPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';
import { login, getUser } from '../api/client';
import { consumeFlashInfo, consumeFlashEmail } from '../utils/sessionFlash.js';

export default function LoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // StrictModeでも1回だけ拾う
  const consumedRef = useRef(false);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    // ① state があれば最優先
    const stateInfo = location.state?.flashInfo || '';
    const stateEmail = location.state?.flashEmail || '';

    if (stateInfo) setInfo(stateInfo);
    if (stateEmail) setEmail(stateEmail);

    // ② state が無い/空なら sessionStorage から拾う（退会/ログアウト等の確実ルート）
    if (!stateInfo) {
      const v = consumeFlashInfo(500);
      if (v) setInfo(v);
    }
    if (!stateEmail) {
      const e = consumeFlashEmail(500);
      if (e) setEmail(e);
    }
  }, [location.state]);

  const resetMessages = () => {
    setInfo('');
    setError('');
    setFieldErrors({});
  };

  const handleLogin = async () => {
    resetMessages();
    setLoading(true);
    try {
      await login({ email, password });
      const u = await getUser();
      onLoggedIn?.(u);

      navigate('/auth', { replace: true });
    } catch (e) {
      const { message, fieldErrors } = pickLaravelErrors(e);
      setError(message || 'ログインに失敗しました');
      setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell info={info} error={error}>
      <h2>Login</h2>

      <TextField placeholder="email" value={email} onChange={setEmail} readOnly={loading} />
      {fieldErrors.email && <p className="flashErr">{fieldErrors.email[0]}</p>}

      <div className="mt8" />
      <TextField placeholder="password" type="password" value={password} onChange={setPassword} readOnly={loading} />
      {fieldErrors.password && <p className="flashErr">{fieldErrors.password[0]}</p>}

      <div className="mt12 row">
        <Button onClick={handleLogin} disabled={loading}>
          {loading ? '...' : 'Login'}
        </Button>

        <Button onClick={() => navigate('/forgot')} disabled={loading}>
          パスワードを忘れた
        </Button>

        <Button onClick={() => navigate('/register')} disabled={loading}>
          Registerへ
        </Button>
      </div>
    </AppShell>
  );
}
