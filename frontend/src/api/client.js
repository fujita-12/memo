import api from '../lib/axios';

export async function csrf() {
  await api.get('/sanctum/csrf-cookie');
}

export async function register(data) {
  await csrf();
  await api.post('/api/register', data);
}

export async function login(data) {
  await csrf();
  await api.post('/api/login', data);
}

export async function logout() {
  await csrf();
  try {
    await api.post('/api/logout');
  } catch (e) {
    if (e?.response?.status !== 401) throw e;
  }
}

export async function getUser() {
  try {
    const { data } = await api.get('/api/user');
    return data;
  } catch (e) {
    if (e?.response?.status === 401) return null;
    throw e;
  }
}

// ノートブック
export async function listNotebooks() {
  const { data } = await api.get('/api/notebooks');
  return data;
}
export async function getNotebook(notebookId) {
  const { data } = await api.get(`/api/notebooks/${notebookId}`);
  return data;
}
export async function createNotebook(title) {
  const { data } = await api.post('/api/notebooks', { title });
  return data;
}
export async function updateNotebook(id, payload) {
  const { data } = await api.patch(`/api/notebooks/${id}`, payload);
  return data;
}
export async function deleteNotebook(id) {
  await api.delete(`/api/notebooks/${id}`);
}

// ノート
export async function listNotes(notebookId) {
  const { data } = await api.get(`/api/notebooks/${notebookId}/notes`);
  return data;
}
export async function getNote(noteId) {
  const { data } = await api.get(`/api/notes/${noteId}`);
  return data;
}
export async function createNote(notebookId, payload) {
  const { data } = await api.post(`/api/notebooks/${notebookId}/notes`, payload);
  return data;
}
export async function updateNote(noteId, payload) {
  const { data } = await api.patch(`/api/notes/${noteId}`, payload);
  return data;
}
export async function deleteNote(noteId) {
  await api.delete(`/api/notes/${noteId}`);
}

// メール認証
export async function resendVerification() {
  await csrf();
  await api.post('/api/email/verification-notification');
}

// パスワード変更(ログイン前)
export async function forgotPassword(data) {
  await csrf();
  await api.post('/api/forgot-password', data);
}

export async function resetPassword(data) {
  await csrf();
  await api.post('/api/reset-password', data);
}

// パスワード変更(ログイン後)
export async function updatePassword(data) {
  await csrf();
  await api.put('/api/password', data);
}

// アカウント削除
export async function deleteAccount(currentPassword) {
  await csrf();
  await api.delete('/api/account', {
    data: { current_password: currentPassword }, // axiosのDELETEはdataで送る
  });
}

// =======
// メールアドレス変更（堅牢版）
// =======
export async function requestEmailChange(data) {
  // data: { new_email, current_password }
  await csrf();
  await api.post('/api/email/change-request', data);
}

export async function confirmEmailChange(data) {
  // data: { token, email }
  await csrf();
  const res = await api.post('/api/email/change-confirm', data);
  return res.data;
}

export async function cancelEmailChange(data) {
  await csrf();
  const res = await api.post('/api/email/change-cancel', data);
  return res.data;
}

export async function approveEmailChange(data) {
  await csrf();
  const res = await api.post('/api/email/change-approve', data); // { token }
  return res.data;
}

// PasswordList
export async function listPasswordLists() {
  const { data } = await api.get('/api/password-lists');
  return data;
}
export async function createPasswordList(title) {
  const { data } = await api.post('/api/password-lists', { title });
  return data;
}
export async function updatePasswordList(listId, payload) {
  const { data } = await api.patch(`/api/password-lists/${listId}`, payload);
  return data;
}
export async function deletePasswordList(id) {
  await api.delete(`/api/password-lists/${id}`);
}

// Password items
export async function listPasswordItems(listId) {
  const { data } = await api.get(`/api/password-lists/${listId}/items`);
  return data;
}
export async function createPasswordItem(listId, payload) {
  const { data } = await api.post(`/api/password-lists/${listId}/items`, payload);
  return data;
}
export async function getPasswordItem(itemId) {
  const { data } = await api.get(`/api/password-items/${itemId}`);
  return data; // { secret } を含む
}
export async function updatePasswordItem(itemId, payload) {
  const { data } = await api.patch(`/api/password-items/${itemId}`, payload);
  return data;
}
export async function deletePasswordItem(itemId) {
  await api.delete(`/api/password-items/${itemId}`);
}

// password entries
export async function listPasswordEntries(itemId) {
  const { data } = await api.get(`/api/password-items/${itemId}/entries`);
  return data;
}
export async function createPasswordEntry(itemId, payload) {
  const { data } = await api.post(`/api/password-items/${itemId}/entries`, payload);
  return data;
}
// password entries
export async function updatePasswordEntry(entryId, payload) {
  const { data } = await api.patch(`/api/password-entries/${entryId}`, payload);
  return data;
}
export async function deletePasswordEntry(entryId) {
  await api.delete(`/api/password-entries/${entryId}`);
}