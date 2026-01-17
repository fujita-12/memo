import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { KeyRound, FilePlusCorner, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import FooterPlusButton from '../components/FooterPlusButton.jsx';

import BottomSheet from '../components/BottomSheet.jsx';
import SwipeRow from '../components/SwipeRow.jsx';
import { useIsMobileTouch } from '../hooks/useIsMobileTouch.js';

import { useFlash } from '../hooks/useFlash.js';
import { usePasswordVault } from '../hooks/usePasswordVault.js';

import '../styles/note-pass.css';

export default function PasswordListsPage() {
  const flash = useFlash();
  const pv = usePasswordVault({ flash });

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

  const openSheet = (l) => {
    setTarget(l);
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

    const updated = await pv.updateListAction(target.id, { title: trimmed });
    if (updated) closeSheet();
  };

  const doDelete = async () => {
    if (!target) return;
    const ok = confirm('このリストを削除しますか？中のパスワードも削除されます。');
    if (!ok) return;
    await pv.deleteListAction(target.id, { confirmed: true });
    closeSheet();
  };

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title="PasswordList 一覧" className="notePassPage">
        <div className="itemList mt36">
          <div className="itemLength">{pv.lists.length}個のリスト</div>

          {pv.lists.map((l) => {
            // PC: …ボタンだけ
            if (!isMobileTouch) {
              return (
                <div key={l.id} className="listRow listRowDesktop">
                  <Link className="linkLike rowLink" to={`/password-lists/${l.id}`}>
                    <KeyRound size={30} />
                    <span className="rowTitle">{l.title}</span>
                  </Link>

                  <button
                    type="button"
                    className="moreBtn"
                    onClick={() => openSheet(l)}
                    aria-label="メニュー"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              );
            }

            // スマホ: 左スワイプで右側に…/削除
            return (
              <div key={l.id} className="listRow listRowSwipe">
                <SwipeRow
                  rowId={l.id}
                  openRowId={openRowId}
                  setOpenRowId={setOpenRowId}
                  actionsWidth={140}
                  actions={
                    <div className="rowActionsBack">
                      <button type="button" className="backBtn backMenu" onClick={() => openSheet(l)}>
                        <MoreHorizontal size={18} />
                      </button>

                      <button
                        type="button"
                        className="backBtn backDelete"
                        onClick={async () => {
                          const ok = confirm('このリストを削除しますか？中のパスワードも削除されます。');
                          if (!ok) return;
                          await pv.deleteListAction(l.id, { confirmed: true });
                          setOpenRowId(null);
                        }}
                        disabled={pv.deletingListId === l.id}
                      >
                        {pv.deletingListId === l.id ? '...' : <Trash2 size={18} />}
                      </button>
                    </div>
                  }
                >
                  <Link className="linkLike rowLink" to={`/password-lists/${l.id}`} state={{ listTitle: l.title }}>
                    <KeyRound size={30} />
                    <span className="rowTitle">{l.title}</span>
                  </Link>
                </SwipeRow>
              </div>
            );
          })}
        </div>

        <FooterPlusButton to="/password-lists/create">
          <FilePlusCorner size={20} />
        </FooterPlusButton>
      </PageDefault>

      {/* 開いてる時の背景タップで閉じる */}
      {openRowId && (
        <div className="swipeDismissOverlay" onClick={() => setOpenRowId(null)} aria-hidden="true" />
      )}

      <BottomSheet open={sheetOpen} title="PasswordList メニュー" onClose={closeSheet}>
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