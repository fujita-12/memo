import Button from './Button.jsx';
import TextField from './TextField.jsx';

export default function NotebookList({ state, actions }) {
  const {
    notebooks,
    nbTitle,
    nbFieldErrors,
    creatingNotebook,
    openingNotebookId,
    deletingNotebookId,
  } = state;

  const { setNbTitle, createNotebook, openNotebook, deleteNotebook } = actions;

  return (
    <div>
      <div className="row">
        <TextField
          placeholder="新しいNotebook名"
          value={nbTitle}
          onChange={setNbTitle}
          readOnly={creatingNotebook}
        />
        <Button onClick={createNotebook} disabled={creatingNotebook || !nbTitle}>
          {creatingNotebook ? '...' : '追加'}
        </Button>
      </div>

      {nbFieldErrors?.title && <p className="flashErr">{nbFieldErrors.title[0]}</p>}

      <ul style={{ marginTop: 12 }}>
        {notebooks.map((nb) => {
          const opening = openingNotebookId === nb.id;
          const deleting = deletingNotebookId === nb.id;

          return (
            <li key={nb.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span>
                #{nb.id} {nb.title}
              </span>

              <Button onClick={() => openNotebook(nb)} disabled={opening}>
                {opening ? '...' : '開く'}
              </Button>

              <Button onClick={() => deleteNotebook(nb.id)} disabled={deleting}>
                {deleting ? '...' : '削除'}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
