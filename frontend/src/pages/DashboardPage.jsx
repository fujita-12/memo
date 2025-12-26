// src/pages/DashboardPage.jsx
import { useCallback } from 'react';

import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import NotebookList from '../components/NotebookList.jsx';
import NotesPanel from '../components/NotesPanel.jsx';

import { useFlash } from '../hooks/useFlash.js';
import { useNotebooks } from '../hooks/useNotebooks.js';
import { useEmailChangeRequest } from '../hooks/useEmailChangeRequest.js';
import { usePasswordChange } from '../hooks/usePasswordChange.js';
import { useAccountDeletion } from '../hooks/useAccountDeletion.js';
import { useLogoutAction } from '../hooks/useLogoutAction.js';

import { getUser } from '../api/client';
import { setFlashInfo } from '../utils/sessionFlash.js';

export default function DashboardPage({ user, onUserUpdated, onLoggedOut }) {
  const flash = useFlash();

  const refreshUser = useCallback(async () => {
    const u = await getUser().catch(() => null);
    if (u) onUserUpdated?.(u);
  }, [onUserUpdated]);

  // notebooks/notes
  const nb = useNotebooks({ flash });

  // email change request
  const email = useEmailChangeRequest({ flash, refreshUser });

  // password
  const pw = usePasswordChange({ flash });

  // delete account（成功時の遷移とメッセージはここで統一）
  const del = useAccountDeletion({
    flash,
    onDeleted: () => {
      setFlashInfo('退会しました。ご利用ありがとうございました。');
      onLoggedOut?.();

      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      window.location.replace(`${base}/auth`);
    },
  });

  // logout（共通化）
  const { loadingLogout, logoutAction } = useLogoutAction({ flash, onLoggedOut });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <p>ログイン中: {user.email}</p>

      <Section title="Change Email（旧メール承認 → 新メール確定）">
        <p className="small">
          旧メールに「承認/拒否リンク」を送ります。承認後に新メールへ確定リンクが届きます。
        </p>

        {user.pending_email && (
          <p className="small">
            変更待ち: <b>{user.pending_email}</b>（旧メールの承認が必要）
          </p>
        )}

        <TextField
          placeholder="new email"
          value={email.newEmail}
          onChange={email.setNewEmail}
          readOnly={email.loadingEmail}
        />
        {email.emailFieldErrors.new_email && <p className="flashErr">{email.emailFieldErrors.new_email[0]}</p>}

        <div className="mt8" />
        <TextField
          placeholder="current password"
          type="password"
          value={email.emailChangePw}
          onChange={email.setEmailChangePw}
          readOnly={email.loadingEmail}
        />
        {email.emailFieldErrors.current_password && (
          <p className="flashErr">{email.emailFieldErrors.current_password[0]}</p>
        )}

        <div className="mt12 row">
          <Button
            onClick={email.requestEmailChangeAction}
            disabled={email.loadingEmail || !email.newEmail || !email.emailChangePw}
          >
            {email.loadingEmail ? '...' : '承認/拒否リンクを送る'}
          </Button>
        </div>
      </Section>

      <Section title="Notebooks">
        <NotebookList
          state={{
            notebooks: nb.notebooks,
            nbTitle: nb.nbTitle,
            nbFieldErrors: nb.nbFieldErrors,
            creatingNotebook: nb.creatingNotebook,
            openingNotebookId: nb.openingNotebookId,
            deletingNotebookId: nb.deletingNotebookId,
          }}
          actions={{
            setNbTitle: nb.setNbTitle,
            createNotebook: nb.createNotebookAction,
            openNotebook: nb.openNotebookAction,
            deleteNotebook: (id) => {
              const ok = confirm('このノートブックを削除しますか？');
              if (!ok) return;
              nb.deleteNotebookAction(id, { confirmed: true });
            },
          }}
        />

        {nb.selectedNotebook && (
          <NotesPanel
            state={{
              notebook: nb.selectedNotebook,
              notes: nb.notes,
              noteTitle: nb.noteTitle,
              noteBody: nb.noteBody,
              noteFieldErrors: nb.noteFieldErrors,
              creatingNote: nb.creatingNote,
              updatingNoteId: nb.updatingNoteId,
              deletingNoteId: nb.deletingNoteId,
            }}
            actions={{
              setNoteTitle: nb.setNoteTitle,
              setNoteBody: nb.setNoteBody,
              createNote: nb.createNoteAction,
              editNote: async (note) => {
                const newTitle2 = prompt('新しいタイトル', note.title);
                if (newTitle2 == null) return;
                const newBody2 = prompt('新しい本文', note.body ?? '');
                if (newBody2 == null) return;
                await nb.updateNoteAction(note.id, { title: newTitle2, body: newBody2 });
              },
              deleteNote: (noteId) => {
                const ok = confirm('削除しますか？');
                if (!ok) return;
                nb.deleteNoteAction(noteId, { confirmed: true });
              },
            }}
          />
        )}
      </Section>

      <Section title="Change Password">
        <TextField
          placeholder="current password"
          type="password"
          value={pw.currentPassword}
          onChange={pw.setCurrentPassword}
          readOnly={pw.loadingPw}
        />
        {pw.pwFieldErrors.current_password && <p className="flashErr">{pw.pwFieldErrors.current_password[0]}</p>}

        <div className="mt8" />
        <TextField
          placeholder="new password"
          type="password"
          value={pw.newPassword}
          onChange={pw.setNewPassword}
          readOnly={pw.loadingPw}
        />
        {pw.pwFieldErrors.password && <p className="flashErr">{pw.pwFieldErrors.password[0]}</p>}

        <div className="mt8" />
        <TextField
          placeholder="new password confirmation"
          type="password"
          value={pw.newPasswordConfirmation}
          onChange={pw.setNewPasswordConfirmation}
          readOnly={pw.loadingPw}
        />
        {pw.pwFieldErrors.password_confirmation && <p className="flashErr">{pw.pwFieldErrors.password_confirmation[0]}</p>}

        <div className="mt12 row">
          <Button onClick={pw.changePasswordAction} disabled={pw.loadingPw}>
            {pw.loadingPw ? '...' : '変更する'}
          </Button>
        </div>
      </Section>

      <Section title="退会（アカウント削除）">
        <p className="small">確認のため現在のパスワードを入力してください。</p>

        <TextField
          placeholder="現在のパスワード"
          type="password"
          value={del.deletePw}
          onChange={del.setDeletePw}
          readOnly={del.loadingDelete}
        />
        {del.deleteFieldErrors.current_password && <p className="flashErr">{del.deleteFieldErrors.current_password[0]}</p>}

        <div className="mt12 row">
          <Button
            onClick={() => {
              const ok = confirm('本当に退会しますか？ノート/ノートブックも全て削除されます。');
              if (!ok) return;
              del.deleteAccountAction({ confirmed: true });
            }}
            disabled={del.loadingDelete || !del.deletePw}
          >
            {del.loadingDelete ? '...' : '退会する'}
          </Button>
        </div>
      </Section>

      <div className="mt24">
        <Button onClick={logoutAction} disabled={loadingLogout}>
          {loadingLogout ? '...' : 'Logout'}
        </Button>
      </div>
    </AppShell>
  );
}
