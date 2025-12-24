import { useState } from 'react';
import { requestEmailChange } from '../api/client';

export function useEmailChangeRequest({ flash, refreshUser }) {
  const [newEmail, setNewEmail] = useState('');
  const [emailChangePw, setEmailChangePw] = useState('');
  const [emailFieldErrors, setEmailFieldErrors] = useState({});
  const [loadingEmail, setLoadingEmail] = useState(false);

  const requestEmailChangeAction = async () => {
    flash.reset();
    setEmailFieldErrors({});
    setLoadingEmail(true);

    try {
      await requestEmailChange({
        new_email: newEmail,
        current_password: emailChangePw,
      });

      flash.ok(
        '旧メールアドレスに承認/拒否リンクを送信しました。Mailpit（http://localhost:8025）を確認してください。'
      );

      setNewEmail('');
      setEmailChangePw('');
      await refreshUser?.();
    } catch (e) {
      const errs = flash.fail(e, '送信に失敗しました');
      setEmailFieldErrors(errs);
    } finally {
      setLoadingEmail(false);
    }
  };

  return {
    newEmail,
    setNewEmail,
    emailChangePw,
    setEmailChangePw,
    emailFieldErrors,
    loadingEmail,
    requestEmailChangeAction,
  };
}
