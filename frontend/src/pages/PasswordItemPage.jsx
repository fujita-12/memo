import { useNavigate, useParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';
import Modal from '../components/Modal.jsx';

import { useFlash } from '../hooks/useFlash.js';
import { usePasswordEntries } from '../hooks/usePasswordEntries.js';

export default function PasswordItemPage() {
  const { listId, itemId } = useParams();
  const nav = useNavigate();
  const flash = useFlash();

  const pe = usePasswordEntries({ flash, itemId });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Password 詳細">
        {pe.loading && <p className="small">Loading...</p>}

        {pe.item && (
          <>
            <h3 style={{ marginTop: 0 }}>{pe.item.title}</h3>

            <div className="row mt12">
              <Button onClick={() => nav(`/password-lists/${listId}`)}>一覧へ戻る</Button>
            </div>

            <div className="mt16" />

            {/* entries を下に積む */}
            {pe.entries.length === 0 ? (
              <p className="muted">まだ詳細がありません。右下の「＋」から追加できます。</p>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {pe.entries.map((e) => (
                  <div key={e.id} className="pwEntryCard">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700 }}>{e.title}</div>

                      <button
                        type="button"
                        className="linkLike danger"
                        onClick={() => {
                          const ok = confirm('この詳細を削除しますか？');
                          if (!ok) return;
                          pe.deleteAction(e.id, { confirmed: true });
                        }}
                        disabled={pe.deletingId === e.id}
                      >
                        {pe.deletingId === e.id ? '...' : '削除'}
                      </button>
                    </div>

                    <div className="mt8" />

                    {/* ✅ タップでコピー（本文だけ） */}
                    <div
                      role="button"
                      tabIndex={0}
                      className="password-text"
                      onClick={() => pe.copy(e.body)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') pe.copy(e.body);
                      }}
                      title="タップでコピー"
                      style={{
                        textAlign: 'left',
                        maxWidth: '100%',
                        whiteSpace: 'pre-wrap',
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                      }}
                    >
                      {e.body}
                      <div style={{ marginTop: 6, fontSize: 12 }} className="muted">
                        Tap to copy
                      </div>
                    </div>

                    {e.created_at && (
                      <div style={{ marginTop: 8, fontSize: 12 }} className="muted">
                        {new Date(e.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 右下＋：この item に entry を追加 */}
        <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
          <Button onClick={pe.openAdd}>＋</Button>
        </div>
      </Section>

      {/* entry追加モーダル */}
      <Modal open={pe.addOpen} title="詳細を追加" onClose={pe.closeAdd}>
        <TextField
          placeholder="タイトル"
          value={pe.title}
          onChange={pe.setTitle}
          readOnly={pe.creating}
        />
        {pe.fieldErrors.title && <p className="flashErr">{pe.fieldErrors.title[0]}</p>}

        <div className="mt8" />

        <TextField
          placeholder="テキスト（タップでコピーできる）"
          value={pe.body}
          onChange={pe.setBody}
          readOnly={pe.creating}
        />
        {pe.fieldErrors.body && <p className="flashErr">{pe.fieldErrors.body[0]}</p>}

        <div className="mt12 row">
          <Button onClick={pe.createAction} disabled={pe.creating || !pe.title || !pe.body}>
            {pe.creating ? '...' : '追加する'}
          </Button>
          <Button onClick={pe.closeAdd} disabled={pe.creating}>
            閉じる
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}