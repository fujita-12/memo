// src/hooks/useAccountDeletion.js
import { useState } from 'react';
import { deleteAccount, logout } from '../api/client';

export function useAccountDeletion({ flash, onDeleted }) {
  const [deletePw, setDeletePw] = useState('');
  const [deleteFieldErrors, setDeleteFieldErrors] = useState({});
  const [loadingDelete, setLoadingDelete] = useState(false);

  const deleteAccountAction = async ({ confirmed } = { confirmed: false }) => {
    flash?.reset?.();
    setDeleteFieldErrors({});
    if (!confirmed) return;

    setLoadingDelete(true);
    try {
      await deleteAccount(deletePw);

      // ✅ 念のためセッションも切る（サーバ側で消えててもOK）
      await logout().catch(() => {});

      onDeleted?.();
    } catch (e) {
      const errs = flash?.fail?.(e, '退会に失敗しました') || {};
      setDeleteFieldErrors(errs);
    } finally {
      setLoadingDelete(false);
    }
  };

  return {
    deletePw,
    setDeletePw,
    deleteFieldErrors,
    loadingDelete,
    deleteAccountAction,
  };
}
