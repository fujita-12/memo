import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { useNotebooksIndex } from '../hooks/useNotebooksIndex.js';

export default function NotebooksPage() {
  const flash = useFlash();
  const nav = useNavigate();
  const nb = useNotebooksIndex({ flash });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Notebook 一覧">
        {nb.loading && <p className="small">Loading...</p>}

        {nb.notebooks.map((n) => (
          <div key={n.id} className="listRow">
            <Link className="linkLike" to={`/notebooks/${n.id}`}>
              📓 {n.title}
            </Link>

            <button
              type="button"
              className="linkLike danger"
              onClick={() => {
                const ok = confirm('このノートブックを削除しますか？（中のノートも消えます）');
                if (!ok) return;
                nb.deleteAction(n.id, { confirmed: true });
              }}
              disabled={nb.deletingId === n.id}
            >
              {nb.deletingId === n.id ? '...' : '削除'}
            </button>
          </div>
        ))}

        <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
          <Button onClick={() => nav('/notebooks/create')}>＋</Button>
        </div>
      </Section>
    </AppShell>
  );
}