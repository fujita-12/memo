import { Link, useParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import Modal from '../components/Modal.jsx';

import { useFlash } from '../hooks/useFlash.js';
import { usePasswordItems } from '../hooks/usePasswordItems.js';

export default function PasswordItemsPage() {
  const { listId } = useParams();
  const flash = useFlash();
  const pw = usePasswordItems({ flash, listId });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Password 一覧">
        {pw.loadingList && <p className="small">Loading...</p>}

        {pw.items.map((it) => {
          const preview = it.latest_entry?.body ?? '';

          return (
            <div key={it.id} className="listRow" style={{ display: 'block' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Link className="linkLike" to={`/password-lists/${listId}/items/${it.id}`}>
                  🔑 {it.title}
                </Link>

                <button
                  type="button"
                  className="linkLike danger"
                  onClick={() => {
                    const ok = confirm('削除しますか？（詳細も削除されます）');
                    if (!ok) return;
                    pw.deleteAction(it.id, { confirmed: true });
                  }}
                  disabled={pw.deletingId === it.id}
                >
                  {pw.deletingId === it.id ? '...' : '削除'}
                </button>
              </div>

              <div className="pwPreview">
                {preview ? preview : <span className="muted">（まだ詳細がありません）</span>}
              </div>
            </div>
          );
        })}

        {/* 右下＋：Password（箱）を追加（名前だけ） */}
        <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
          <Button onClick={pw.openAdd}>＋</Button>
        </div>
      </Section>

      {/* 追加モーダル（名前だけ） */}
      <Modal open={pw.addOpen} title="Password 追加" onClose={pw.closeAdd}>
        <TextField
          placeholder="Passwordの名前"
          value={pw.title}
          onChange={pw.setTitle}
          readOnly={pw.creating}
        />
        {pw.fieldErrors.title && <p className="flashErr">{pw.fieldErrors.title[0]}</p>}

        <div className="mt12 row">
          <Button onClick={pw.createAction} disabled={pw.creating || !pw.title}>
            {pw.creating ? '...' : '追加する'}
          </Button>
          <Button onClick={pw.closeAdd} disabled={pw.creating}>
            閉じる
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}