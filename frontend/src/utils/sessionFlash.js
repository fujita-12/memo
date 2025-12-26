// src/utils/sessionFlash.js
const KEY_INFO = 'flashInfo';
const KEY_EMAIL = 'flashEmail';

export function setFlashInfo(message) {
  if (!message) return;
  sessionStorage.setItem(KEY_INFO, String(message));
}

export function setFlashEmail(email) {
  if (!email) return;
  sessionStorage.setItem(KEY_EMAIL, String(email));
}

export function consumeFlashInfo(delayMs = 500) {
  const v = sessionStorage.getItem(KEY_INFO) || '';
  if (v) {
    window.setTimeout(() => sessionStorage.removeItem(KEY_INFO), delayMs);
  }
  return v;
}

export function consumeFlashEmail(delayMs = 500) {
  const v = sessionStorage.getItem(KEY_EMAIL) || '';
  if (v) {
    window.setTimeout(() => sessionStorage.removeItem(KEY_EMAIL), delayMs);
  }
  return v;
}
