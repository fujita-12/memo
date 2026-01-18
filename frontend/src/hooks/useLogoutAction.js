// src/hooks/useLogoutAction.js
import { useState, useRef } from 'react'; //  useRef追加
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/client';
import { setFlashInfo } from '../utils/sessionFlash';

export function useLogoutAction({ flash, onLoggedOut }) {
  const navigate = useNavigate();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const busyRef = useRef(false); //  追加

  const logoutAction = async () => {
    if (busyRef.current) return; //  追加（連打/StrictMode対策）
    busyRef.current = true;

    flash?.reset?.();
    setLoadingLogout(true);
    try {
      await logout(); // 401はclient.js側で握る設計
      setFlashInfo('ログアウトしました。');
      onLoggedOut?.();
      navigate('/auth', { replace: true });
    } catch (e) {
      // flash が無い画面（Headerだけ等）でも最低限わかるようにするならここでalert等
      flash?.fail?.(e, 'ログアウトに失敗しました');
      if (!flash?.fail) {
        console.error(e);
        alert('ログアウトに失敗しました');
      }
    } finally {
      setLoadingLogout(false);
      busyRef.current = false; //  追加
    }
  };

  return { loadingLogout, logoutAction };
}
