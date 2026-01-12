// src/pages/DashboardPage.jsx

import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';

import NotebookList from '../components/NotebookList.jsx';
import NotesPanel from '../components/NotesPanel.jsx';

import { useFlash } from '../hooks/useFlash.js';
import { useNotebooks } from '../hooks/useNotebooks.js';

export default function DashboardPage() {
  const flash = useFlash();

  // notebooks/notes
  const nb = useNotebooks({ flash });

  return (
    <AppShell info={flash.info} error={flash.error}>

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
    </AppShell>
  );
}
