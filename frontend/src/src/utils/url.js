export function readModeParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get('mode') || null,
    token: params.get('token') || '',
    email: params.get('email') || '',
    verified: params.get('verified') === '1',
  };
}

export function clearUrlQuery() {
  window.history.replaceState({}, '', window.location.pathname);
}