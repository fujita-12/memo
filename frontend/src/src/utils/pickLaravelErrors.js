export function pickLaravelErrors(e) {
  const status = e?.response?.status;
  const data = e?.response?.data;

  if (status === 422) {
    return {
      message: data?.message || '入力内容を確認してください',
      fieldErrors: data?.errors || {},
    };
  }

  if (status === 419) {
    return {
      message: 'セッションが切れました。画面をリロードして再度お試しください。',
      fieldErrors: {},
    };
  }

  if (status === 403) {
    return {
      message: data?.message || 'メール認証が必要です。',
      fieldErrors: {},
    };
  }

  if (status === 401) {
    return {
      message: data?.message || '認証が必要です。',
      fieldErrors: {},
    };
  }

  return {
    message: 'エラーが発生しました',
    fieldErrors: {},
  };
}
