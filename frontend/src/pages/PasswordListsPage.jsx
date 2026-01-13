import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useFlash } from '../hooks/useFlash.js';
import { usePasswordVault } from '../hooks/usePasswordVault.js';

export default function PasswordListsPage() {
  const flash = useFlash();
  const nav = useNavigate();
  const pv = usePasswordVault({ flash });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="PasswordList 一覧">
        <div className="mt16" />

        {pv.lists.map((l) => (
          <div key={l.id} className="listRow">
            <Link className="linkLike" to={`/password-lists/${l.id}`}>
              🔑 {l.title}
            </Link>

            <button
              type="button"
              className="linkLike danger"
              onClick={() => {
                const ok = confirm('このリストを削除しますか？中のパスワードも削除されます。');
                if (!ok) return;
                pv.deleteListAction(l.id, { confirmed: true });
              }}
              disabled={pv.deletingListId === l.id}
            >
              {pv.deletingListId === l.id ? '...' : '削除'}
            </button>
          </div>
        ))}

        <div style={{ position: 'fixed', right: 24, bottom: 100 }}>
          <Button onClick={() => nav('/password-lists/create')}>＋</Button>
        </div>
      </Section>
    </AppShell>
  );
}