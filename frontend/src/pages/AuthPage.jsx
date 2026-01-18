// src/pages/AuthPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../api/client';

export default function AuthPage({ onUserUpdated }) {
  const nav = useNavigate();
  const [booting, setBooting] = useState(true);

  //  StrictModeで2回走っても1回だけ実行
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const u = await getUser(); // 401 -> null想定
        onUserUpdated?.(u);

        if (!u) {
          nav('/login', { replace: true });
          return;
        }

        if (!u.email_verified_at) {
          nav('/verify', { replace: true });
          return;
        }

        nav('/dashboard', { replace: true });
      } catch (e) {
        console.error(e);
        nav('/login', { replace: true });
      } finally {
        setBooting(false);
      }
    })();
  }, [nav, onUserUpdated]);

  if (booting) return <div style={{ padding: 20 }}>Loading...</div>;
  return null;
}
