// src/hooks/useLogoutAction.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/client';
import { setFlashInfo } from '../utils/sessionFlash';

export function useLogoutAction({ flash, onLoggedOut }) {
  const navigate = useNavigate();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const logoutAction = async () => {
    flash?.reset?.();
    setLoadingLogout(true);
    try {
      await logout(); // 401はclient.js側で握る設計
      setFlashInfo('ログアウトしました。');
      onLoggedOut?.();
      navigate('/auth', { replace: true });
    } catch (e) {
      flash?.fail?.(e, 'ログアウトに失敗しました');
    } finally {
      setLoadingLogout(false);
    }
  };

  return { loadingLogout, logoutAction };
}
