import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Notebook, FilePlusCorner, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import FooterPlusButton from '../components/FooterPlusButton.jsx';

import BottomSheet from '../components/BottomSheet.jsx';
import SwipeRow from '../components/SwipeRow.jsx';
import { useIsMobileTouch } from '../hooks/useIsMobileTouch.js';

import { useFlash } from '../hooks/useFlash.js';
import { useNotebooksIndex } from '../hooks/useNotebooksIndex.js';


import '../styles/note-pass.css';

export default function NotebooksPage() {
  const flash = useFlash();
  const nb = useNotebooksIndex({ flash });
  const isMobileTouch = useIsMobileTouch();

  const [openRowId, setOpenRowId] = useState(null);

  // 開いた状態で縦スクロールしたら閉じる
  useEffect(() => {
    if (!openRowId) return;

    const onScroll = () => setOpenRowId(null);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [openRowId]);

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
            // PC: …ボタンだけ
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

            //  スマホ: 左スワイプで右側に…/削除
            return (
              <div key={n.id} className="listRow listRowSwipe">
                <SwipeRow
                  rowId={n.id}
                  openRowId={openRowId}
                  setOpenRowId={setOpenRowId}
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
                          setOpenRowId(null); // 削除したら閉じる
                        }}
                        disabled={nb.deletingId === n.id}
                      >
                        {nb.deletingId === n.id ? '...' : <Trash2 size={18} />}
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

      {openRowId && (
        <div
          className="swipeDismissOverlay"
          onClick={() => setOpenRowId(null)}
          aria-hidden="true"
        />
      )}

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