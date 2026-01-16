// src/pages/NotesPage.jsx
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import FooterPlusButton from '../components/FooterPlusButton.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';

import SwipeRow from '../components/SwipeRow.jsx';
import { useIsMobileTouch } from '../hooks/useIsMobileTouch.js';

import { useFlash } from '../hooks/useFlash.js';
import { useNotesList } from '../hooks/useNotesList.js';

import { FilePlusCorner, MoreHorizontal, FileText, Trash2 } from 'lucide-react';

import '../styles/note-pass.css';

function bodyPreview(body) {
  if (!body) return '';
  const text = String(body).replace(/\r/g, '');
  // プレビューは改行を適度に残す（長すぎる場合はここでもカット）
  return text.length > 240 ? text.slice(0, 240) + '…' : text;
}

function formatYMD(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  // 例: 2026/01/14
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

// 下からスライドするメニュー（簡易 BottomSheet）
function BottomSheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sheetOverlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="sheetPanel">
        <div className="sheetHeader">
          <div className="sheetTitle">{title}</div>
          <button type="button" className="sheetClose" onClick={onClose}>
            閉じる
          </button>
        </div>
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { notebookId } = useParams();
  const nav = useNavigate();

  const flash = useFlash();
  const nl = useNotesList({ flash, notebookId });

  const isMobileTouch = useIsMobileTouch();

  //  スマホ：スワイプで開いてるRow
  const [openRowId, setOpenRowId] = useState(null);

  //  開いた状態で縦スクロールしたら閉じる
  useEffect(() => {
    if (!openRowId) return;
    const onScroll = () => setOpenRowId(null);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [openRowId]);

  //  PC：…押したら下から削除シート
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState(null); // {id,title}

  const openSheet = (note) => {
    setTarget({ id: note.id, title: note.title });
    setSheetOpen(true);
  };
  const closeSheet = () => {
    setSheetOpen(false);
    setTarget(null);
  };

  const doDelete = async () => {
    if (!target) return;
    const ok = confirm('このノートを削除しますか？');
    if (!ok) return;
    await nl.deleteAction(target.id, { confirmed: true });
    closeSheet();
  };

  const headerTitle = useMemo(() => {
    // PageDefault のtitleは短めがキレイ
    return 'Note一覧';
  }, []);

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title={headerTitle} className="notePassPage">
        <div className="itemList mt36">
          {nl.loading && <p className="small">Loading...</p>}

          <div className="itemLength">
            {nl.notes.length}個のノート
            {nl.notebook?.title ? (
              <span className="muted" style={{ marginLeft: 10 }}>
                ：{nl.notebook.title}
              </span>
            ) : null}
          </div>

          {nl.notes.map((n) => {
            const pv = bodyPreview(n.body);
            const dateLabel = formatYMD(n.updated_at || n.created_at);

            // PC：…ボタンだけ（削除はBottomSheetから）
            if (!isMobileTouch) {
              return (
                <div key={n.id} className="listRow listRowDesktop noteRow">
                  <Link className="linkLike rowLink noteRowLink" to={`/notebooks/${notebookId}/notes/${n.id}`}>
                    <FileText size={28} />
                    <div className="noteRowText">
                      <div className="noteRowTitle">{n.title}</div>
                      <div className="noteRowPreview">{pv ? pv : '（本文なし）'}</div>
                      {dateLabel && <div className="noteRowDate">{dateLabel}</div>}
                    </div>
                  </Link>

                  <button type="button" className="moreBtn" onClick={() => openSheet(n)} aria-label="メニュー">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              );
            }

            //  スマホ：左スワイプ → 削除のみ
            return (
              <div key={n.id} className="listRow listRowSwipe noteRow">
                <SwipeRow
                  rowId={n.id}
                  openRowId={openRowId}
                  setOpenRowId={setOpenRowId}
                  actionsWidth={70}
                  actions={
                    <div className="rowActionsBack">
                      <button
                        type="button"
                        className="backBtn backDelete"
                        onClick={async () => {
                          const ok = confirm('このノートを削除しますか？');
                          if (!ok) return;
                          await nl.deleteAction(n.id, { confirmed: true });
                          setOpenRowId(null);
                        }}
                        disabled={nl.deletingId === n.id}
                        aria-label="削除"
                      >
                        {nl.deletingId === n.id ? '...' : <Trash2 size={18} />}
                      </button>
                    </div>
                  }
                >
                  <Link
                    className="linkLike rowLink noteRowLink"
                    to={`/notebooks/${notebookId}/notes/${n.id}`}
                    onClick={() => {
                      if (openRowId) setOpenRowId(null);
                    }}
                  >
                    <FileText size={28} />
                    <div className="noteRowText">
                      <div className="noteRowTitle">{n.title}</div>
                      <div className="noteRowPreview">{pv ? pv : '（本文なし）'}</div>
                      {dateLabel && <div className="noteRowDate">{dateLabel}</div>}
                    </div>
                  </Link>
                </SwipeRow>
              </div>
            );
          })}
        </div>

        {/*  右下＋（見た目は同じ / でもモーダル開く） */}
        <FooterPlusButton onClick={nl.openAdd} ariaLabel="ノート追加">
          <FilePlusCorner size={20} />
        </FooterPlusButton>
      </PageDefault>

      {/*  開いてる時に背景タップで閉じる（スマホスワイプ用） */}
      {openRowId && (
        <div className="swipeDismissOverlay" onClick={() => setOpenRowId(null)} aria-hidden="true" />
      )}

      {/*  PC：BottomSheet（削除のみ） */}
      <BottomSheet open={sheetOpen} title="Note メニュー" onClose={closeSheet}>
        <div className="sheetBtns">
          <button type="button" className="sheetBtn danger" onClick={doDelete}>
            <Trash2 size={18} />
            削除
          </button>
        </div>
      </BottomSheet>

      {/*  追加モーダル（今まで通り） */}
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
            variant="primary"
            size="md"
            align="center"
          >
            {nl.creating ? '...' : '追加する'}
          </Button>

          <Button onClick={nl.closeAdd} disabled={nl.creating} variant="black" size="md" align="center">
            閉じる
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}