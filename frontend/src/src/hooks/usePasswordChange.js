import { useState } from 'react';
import { updatePassword } from '../api/client';

export function usePasswordChange({ flash }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [pwFieldErrors, setPwFieldErrors] = useState({});
  const [loadingPw, setLoadingPw] = useState(false);

  const changePasswordAction = async () => {
    flash.reset();
    setPwFieldErrors({});
    setLoadingPw(true);

    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });

      flash.ok('パスワードを変更しました ✅');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (e) {
      const errs = flash.fail(e, 'パスワード変更に失敗しました');
      setPwFieldErrors(errs);
    } finally {
      setLoadingPw(false);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    newPasswordConfirmation,
    setNewPasswordConfirmation,
    pwFieldErrors,
    loadingPw,
    changePasswordAction,
  };
}
