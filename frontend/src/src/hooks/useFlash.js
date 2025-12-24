import { useCallback, useState } from 'react';
import { pickLaravelErrors } from '../utils/pickLaravelErrors.js';

/**
 * ページ共通のフラッシュ（info/error）管理
 * - reset()
 * - fail(e, fallback): Laravelエラーを解釈して error を入れる（fieldErrors も返す）
 */
export function useFlash() {
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setInfo('');
    setError('');
  }, []);

  const fail = useCallback((e, fallbackMessage = 'エラーが発生しました') => {
    const { message, fieldErrors } = pickLaravelErrors(e);
    setInfo('');
    setError(message || fallbackMessage);
    return fieldErrors || {};
  }, []);

  const ok = useCallback((message) => {
    setError('');
    setInfo(message);
  }, []);

  return {
    info,
    error,
    setInfo,
    setError,
    reset,
    ok,
    fail,
  };
}
