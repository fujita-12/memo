import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import FooterPlusButton from '../components/FooterPlusButton.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { useNotebooksIndex } from '../hooks/useNotebooksIndex.js';
import { Notebook, FilePlusCorner, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import '../styles/note-pass.css';

function useIsMobileTouch() {
  const [isMobileTouch, setIsMobileTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsMobileTouch(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return isMobileTouch;
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

// スワイプ行（スマホのみ使う）
function SwipeRow({ children, actions, actionsWidth = 140 }) {
  const xRef = useRef(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const [x, setX] = useState(0);

  const clamp = (v) => Math.max(-actionsWidth, Math.min(0, v));

  const onPointerDown = (e) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    xRef.current = x;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    setX(clamp(xRef.current + dx));
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const opened = x <= -actionsWidth * 0.35;
    setX(opened ? -actionsWidth : 0);
  };

  return (
    <div className="swipeWrap">
      {/* ✅ 背面（固定） */}
      <div className="swipeBack" style={{ width: actionsWidth }}>
        {actions}
      </div>

      {/* ✅ 前面（ここだけスライド） */}
      <div
        className="swipeFront"
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}

export default function NotebooksPage() {
  const flash = useFlash();
  const nb = useNotebooksIndex({ flash });

  const isMobileTouch = useIsMobileTouch();

  // sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState(null); // {id,title}

  const openSheet = (n) => {
    setTarget(n);
    setSheetOpen(true);
  };
  const closeSheet = () => {
    setSheetOpen(false);
    setTarget(null);
  };

  const doEdit = async () => {
    if (!target) return;
    const t = prompt('新しいタイトル', target.title);
    if (t == null) return;
    const trimmed = t.trim();
    if (!trimmed) return;

    const updated = await nb.updateAction(target.id, { title: trimmed });
    if (updated) closeSheet();
  };

  const doDelete = async () => {
    if (!target) return;
    const ok = confirm('このノートブックを削除しますか？（中のノートも消えます）');
    if (!ok) return;
    await nb.deleteAction(target.id, { confirmed: true });
    closeSheet();
  };

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title="Notebook一覧" className="notePassPage">
        <div className="itemList mt36">
          {nb.loading && <p className="small">Loading...</p>}
          <div className="itemLength">{nb.notebooks.length}個のノートブック</div>

          {nb.notebooks.map((n) => {
            // ✅ PC: …ボタンだけ
            if (!isMobileTouch) {
              return (
                <div key={n.id} className="listRow listRowDesktop">
                  <Link className="linkLike rowLink" to={`/notebooks/${n.id}`}>
                    <Notebook size={30} />
                    <span className="rowTitle">{n.title}</span>
                  </Link>

                  <button
                    type="button"
                    className="moreBtn"
                    onClick={() => openSheet(n)}
                    aria-label="メニュー"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              );
            }

            // ✅ スマホ: 左スワイプで右側に…/削除
            return (
              <div key={n.id} className="listRow listRowSwipe">
                <SwipeRow
                  actionsWidth={140}
                  actions={
                    <div className="rowActionsBack">
                      <button type="button" className="backBtn backMenu" onClick={() => openSheet(n)}>
                        <MoreHorizontal size={18} />
                      </button>
                      <button
                        type="button"
                        className="backBtn backDelete"
                        onClick={async () => {
                          const ok = confirm('このノートブックを削除しますか？（中のノートも消えます）');
                          if (!ok) return;
                          await nb.deleteAction(n.id, { confirmed: true });
                        }}
                        disabled={nb.deletingId === n.id}
                      >
                        {nb.deletingId === n.id ? '...' : '削除'}
                      </button>
                    </div>
                  }
                >
                  <Link className="linkLike rowLink" to={`/notebooks/${n.id}`}>
                    <Notebook size={30} />
                    <span className="rowTitle">{n.title}</span>
                  </Link>
                </SwipeRow>
              </div>
            );
          })}
        </div>

        <FooterPlusButton to="/notebooks/create">
          <FilePlusCorner size={20} />
        </FooterPlusButton>
      </PageDefault>

      <BottomSheet open={sheetOpen} title="Notebook メニュー" onClose={closeSheet}>
        <div className="sheetBtns">
          <button type="button" className="sheetBtn" onClick={doEdit}>
            <Pencil size={18} />
            編集（タイトル変更）
          </button>

          <button type="button" className="sheetBtn danger" onClick={doDelete}>
            <Trash2 size={18} />
            削除
          </button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}