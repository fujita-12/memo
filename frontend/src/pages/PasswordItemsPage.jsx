import { Link, useParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import Modal from '../components/Modal.jsx';

import { useFlash } from '../hooks/useFlash.js';
import { usePasswordItems } from '../hooks/usePasswordItems.js';

function toOneLine(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

function clipText(s, n = 48) {
  const t = toOneLine(s);
  if (t.length <= n) return t;
  return t.slice(0, n) + '…';
}

export default function PasswordItemsPage() {
  const { listId } = useParams();
  const flash = useFlash();
  const pw = usePasswordItems({ flash, listId });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Password 一覧">
        {pw.loadingList && <p className="small">Loading...</p>}

        {pw.items.map((it) => {
          const previews = it.preview_entries ?? [];

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

              {/* ✅ 3行プレビュー（古い順） */}
              <div className="pwPreview">
                {previews.length === 0 ? (
                  <span className="muted">（まだ詳細がありません）</span>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {previews.map((e) => (
                      <div
                        key={e.id}
                        className="pwPreviewRow"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '120px 1fr 34px',
                          gap: 10,
                          alignItems: 'center',
                        }}
                      >
                        {/* label */}
                        <div className="muted" style={{ fontSize: 12 }}>
                          {clipText(e.title, 18)}
                        </div>

                        {/* value */}
                        <div
                          title="クリックでコピー"
                          role="button"
                          tabIndex={0}
                          onClick={() => pw.copyBody(e.body)}
                          onKeyDown={(ev) => {
                            if (ev.key === 'Enter' || ev.key === ' ') pw.copyBody(e.body);
                          }}
                          style={{
                            fontSize: 13,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                          }}
                        >
                          {clipText(e.body, 60)}
                        </div>

                        {/* copy icon */}
                        <button
                          type="button"
                          className="pwCopyBtn"
                          onClick={() => pw.copyBody(e.body)}
                          title="コピー"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          📋
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 右下＋：Password（箱）を追加（名前だけ） */}
        <div style={{ position: 'fixed', right: 24, bottom: 100 }}>
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