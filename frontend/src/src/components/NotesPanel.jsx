import Button from './Button.jsx';
import TextField from './TextField.jsx';

export default function NotesPanel({ state, actions }) {
  const {
    notebook,
    notes,
    noteTitle,
    noteBody,
    noteFieldErrors,
    creatingNote,
    updatingNoteId,
    deletingNoteId,
  } = state;

  const { setNoteTitle, setNoteBody, createNote, editNote, deleteNote } = actions;

  if (!notebook) return null;

  return (
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #ddd' }}>
      <h3>Notes in: {notebook.title}</h3>

      <TextField
        placeholder="ノートタイトル"
        value={noteTitle}
        onChange={setNoteTitle}
        readOnly={creatingNote}
      />
      {noteFieldErrors?.title && <p className="flashErr">{noteFieldErrors.title[0]}</p>}

      <div className="mt8" />
      <textarea
        placeholder="本文（任意）"
        value={noteBody}
        onChange={(e) => setNoteBody(e.target.value)}
        rows={4}
        style={{ width: '100%' }}
        disabled={creatingNote}
      />

      <div className="mt12 row">
        <Button onClick={createNote} disabled={creatingNote || !noteTitle}>
          {creatingNote ? '...' : 'Note追加'}
        </Button>
      </div>

      <ul style={{ marginTop: 12 }}>
        {notes.map((n) => {
          const updating = updatingNoteId === n.id;
          const deleting = deletingNoteId === n.id;

          return (
            <li key={n.id} style={{ marginBottom: 12 }}>
              <div>
                <b>{n.title}</b>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{n.body}</div>

              <div className="mt8 row">
                <Button onClick={() => editNote(n)} disabled={updating || deleting}>
                  {updating ? '...' : '編集'}
                </Button>

                <Button onClick={() => deleteNote(n.id)} disabled={deleting || updating}>
                  {deleting ? '...' : '削除'}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
