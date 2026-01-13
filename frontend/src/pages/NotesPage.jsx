import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import Modal from '../components/Modal.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { useNotesList } from '../hooks/useNotesList.js';

function bodyPreview(body) {
  if (!body) return '';
  const lines = String(body).split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.slice(0, 3).join('\n');
}

export default function NotesPage() {
  const { notebookId } = useParams();
  const nav = useNavigate();
  const flash = useFlash();
  const nl = useNotesList({ flash, notebookId });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title={`Notes（${nl.notebook?.title ?? '...' }）`}>
        {nl.loading && <p className="small">Loading...</p>}

        <div className="mt12 row">
          <Button onClick={() => nav('/notebooks')}>Notebook一覧へ</Button>
        </div>

        <div className="mt16" />

        {nl.notes.map((n) => {
          const pv = bodyPreview(n.body);
          return (
            <div key={n.id} className="listRow" style={{ display: 'block' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Link className="linkLike" to={`/notebooks/${notebookId}/notes/${n.id}`}>
                  📝 {n.title}
                </Link>

                <button
                  type="button"
                  className="linkLike danger"
                  onClick={() => {
                    const ok = confirm('このノートを削除しますか？');
                    if (!ok) return;
                    nl.deleteAction(n.id, { confirmed: true });
                  }}
                  disabled={nl.deletingId === n.id}
                >
                  {nl.deletingId === n.id ? '...' : '削除'}
                </button>
              </div>

              <div className="pwPreview">
                {pv ? pv : <span className="muted">（本文なし）</span>}
              </div>
            </div>
          );
        })}

        <div style={{ position: 'fixed', right: 24, bottom: 100 }}>
          <Button onClick={nl.openAdd}>＋</Button>
        </div>
      </Section>

      <Modal open={nl.addOpen} title="Note 追加" onClose={nl.closeAdd}>
        <TextField
          placeholder="ノートタイトル"
          value={nl.title}
          onChange={nl.setTitle}
          readOnly={nl.creating}
        />
        {nl.fieldErrors?.title && <p className="flashErr">{nl.fieldErrors.title[0]}</p>}

        <div className="mt8" />

        <textarea
          placeholder="本文（任意）"
          value={nl.body}
          onChange={(e) => nl.setBody(e.target.value)}
          rows={6}
          style={{ width: '100%' }}
          disabled={nl.creating}
        />
        {nl.fieldErrors?.body && <p className="flashErr">{nl.fieldErrors.body[0]}</p>}

        <div className="mt12 row">
          <Button
            onClick={async () => {
              const created = await nl.createAction();
              if (!created) return;
              nav(`/notebooks/${notebookId}/notes/${created.id}`, { replace: true });
            }}
            disabled={nl.creating || !nl.title}
          >
            {nl.creating ? '...' : '追加する'}
          </Button>
          <Button onClick={nl.closeAdd} disabled={nl.creating}>閉じる</Button>
        </div>
      </Modal>
    </AppShell>
  );
}