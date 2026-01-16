// src/pages/PasswordItemPage.jsx
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import FooterPlusButton from '../components/FooterPlusButton.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import TextField from '../components/TextField.jsx';

import SwipeRow from '../components/SwipeRow.jsx';
import { useIsMobileTouch } from '../hooks/useIsMobileTouch.js';

import { useFlash } from '../hooks/useFlash.js';
import { usePasswordEntries } from '../hooks/usePasswordEntries.js';

import {
  KeyRound,
  FilePlusCorner,
  MoreHorizontal,
  Trash2,
  ClipboardCopy,
  FileText,
  Undo2,
} from 'lucide-react';

import '../styles/note-pass.css';

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

export default function PasswordItemPage() {
  const { listId, itemId } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  // 一覧 → 詳細へ遷移するときに state で受け取れる場合は使う
  const listTitle = location.state?.listTitle || '';

  const flash = useFlash();
  const pe = usePasswordEntries({ flash, itemId });

  const isMobileTouch = useIsMobileTouch();

  // ✅ SP：スワイプで開いてるRow
  const [openRowId, setOpenRowId] = useState(null);

  // 開いた状態で縦スクロールしたら閉じる
  useEffect(() => {
    if (!openRowId) return;
    const onScroll = () => setOpenRowId(null);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [openRowId]);

  // ✅ PC：…押したらBottomSheet（削除だけ）
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState(null); // {id,title}

  const openSheet = (entry) => {
    setTarget({ id: entry.id, title: entry.title });
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setTarget(null);
  };

  const doDeleteFromSheet = async () => {
    if (!target) return;
    const ok = confirm('この詳細を削除しますか？');
    if (!ok) return;
    await pe.deleteAction(target.id, { confirmed: true });
    closeSheet();
  };

  // ✅ コピー用：小さな吹き出しを3秒だけ出す（entryIdごと）
  const [toastEntryId, setToastEntryId] = useState(null);
  const toastTimerRef = useRef(null);

  const showInlineToast = (entryId) => {
    setToastEntryId(entryId);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastEntryId(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ✅ PasswordItemのタイトル（編集対象）
  const itemTitle = useMemo(() => pe.item?.title ?? '', [pe.item]);

  return (
    <AppShell info={''} error={''}>
      <PageDefault title="Password" className="notePassPage no-title">
        {/* 上：PasswordList名 & 状態 */}
        <div className="itemnameFlex">
          <div className="itemname">
            <KeyRound size={14} />
            {/* ✅ ここは「PasswordListのタイトル」にしたい */}
            <span>{listTitle ? listTitle : '...'}</span>
          </div>

          <div className="small muted">
            {pe.loading ? 'Loading...' : pe.itemSaving ? '保存中…' : ''}
          </div>
        </div>

        {/* ✅ PasswordItemタイトル編集（Noteと同じ感じ） */}
        <div className="createInput">
          <FileText size={30} />
          <TextField
            placeholder="パスワードの名前"
            value={pe.itemTitle}
            onChange={(v) => {
              pe.setItemTitle(v);
              pe.scheduleItemSave();
            }}
            readOnly={pe.loading}
          />
          {pe.itemFieldErrors?.title && (
            <p className="flashErr">{pe.itemFieldErrors.title[0]}</p>
          )}
        </div>

        {/* entries */}
        {pe.entries.length === 0 ? (
          <p className="muted mt12">
            まだ詳細がありません。右下の「＋」から追加できます。
          </p>
        ) : (
          <div className="pwEntryList mt12">
            {pe.entries.map((e) => {
              const d = pe.drafts[e.id] || { title: e.title ?? '', body: e.body ?? '', saving: false };

              const EntryFront = (
                <div className="pwEntryFront">
                  {/* ✅ 横並び：タイトル | 本文 | copy */}
                  <div className="pwEntryRowGrid">
                    {/* 左：タイトル */}
                    <input
                      className="pwEntryTitleInput"
                      value={d.title}
                      onChange={(ev) => {
                        pe.setDraftField(e.id, 'title', ev.target.value);
                        pe.scheduleSave(e.id);
                      }}
                      onBlur={() => pe.flushSave(e.id)}
                      placeholder="タイトル"
                      disabled={pe.deletingId === e.id}
                    />

                    {/* 中：本文 */}
                    <textarea
                      className="pwEntryTextarea"
                      value={d.body}
                      onChange={(ev) => {
                        pe.setDraftField(e.id, 'body', ev.target.value);
                        pe.scheduleSave(e.id);
                      }}
                      onBlur={() => pe.flushSave(e.id)}
                      placeholder="内容"
                      rows={2}
                      disabled={pe.deletingId === e.id}
                    />

                    {/* 右：コピー */}
                    <div className="pwEntrySide">
                      <button
                        type="button"
                        className="pwEntryCopyBtn"
                        title="コピー"
                        onClick={async (ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          await pe.copy(d.body);
                          showInlineToast(e.id);
                        }}
                      >
                        <ClipboardCopy size={16} />
                      </button>

                      {toastEntryId === e.id && (
                        <div className="pwInlineToast">コピーしました</div>
                      )}
                    </div>
                  </div>

                  {/* PCだけ… */}
                  {!isMobileTouch && (
                    <div className="pwEntryMoreLine">
                      <button
                        type="button"
                        className="moreBtn"
                        onClick={() => openSheet(e)}
                        aria-label="メニュー"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  )}

                  <div className="pwEntryMeta">
                    {d.saving ? <span className="muted">保存中…</span> : <span className="muted"> </span>}
                  </div>
                </div>
              );

              // ✅ PC：Swipeなし
              if (!isMobileTouch) {
                return (
                  <div key={e.id} className="pwEntryRow">
                    {EntryFront}
                  </div>
                );
              }

              // ✅ SP：Swipeで削除
              return (
                <div key={e.id} className="pwEntryRow">
                  <SwipeRow
                    rowId={e.id}
                    openRowId={openRowId}
                    setOpenRowId={setOpenRowId}
                    actionsWidth={70}
                    actions={
                      <div className="rowActionsBack">
                        <button
                          type="button"
                          className="backBtn backDelete"
                          onClick={async (ev) => {
                            ev.preventDefault();
                            ev.stopPropagation(); // ✅ これ重要（反応しない対策）
                            const ok = confirm('この詳細を削除しますか？');
                            if (!ok) return;
                            await pe.deleteAction(e.id, { confirmed: true });
                            setOpenRowId(null);
                          }}
                          onPointerDown={(ev) => {
                            ev.stopPropagation(); // ✅ SwipeRowにイベント取られないように
                          }}
                          disabled={pe.deletingId === e.id}
                          aria-label="削除"
                        >
                          {pe.deletingId === e.id ? '...' : <Trash2 size={18} />}
                        </button>
                      </div>
                    }
                  >
                    <div
                      className="pwEntrySwipeFront"
                      onClick={() => {
                        if (openRowId) setOpenRowId(null);
                      }}
                    >
                      {EntryFront}
                    </div>
                  </SwipeRow>
                </div>
              );
            })}

            {/* 戻るボタン */}
            <div className="mt12">
              <Button
                onClick={() => nav(`/password-lists/${listId}`, { replace: true })}
                variant="black"
                size="md"
                align="center"
              >
                一覧へ戻る
              </Button>
            </div>
          </div>
        )}

        {/* 右下＋（見た目はNotebooksと同じ / モーダル発火） */}
        <FooterPlusButton onClick={pe.openAdd} ariaLabel="詳細を追加">
          <FilePlusCorner size={20} />
        </FooterPlusButton>
      </PageDefault>

      {/* Swipe開いてる時、背景タップで閉じる */}
      {openRowId && (
        <div
          className="swipeDismissOverlay"
          onClick={() => setOpenRowId(null)}
          aria-hidden="true"
        />
      )}

      {/* PC：BottomSheet（削除のみ） */}
      <BottomSheet open={sheetOpen} title="詳細メニュー" onClose={closeSheet}>
        <div className="sheetBtns">
          <button type="button" className="sheetBtn danger" onClick={doDeleteFromSheet}>
            <Trash2 size={18} />
            削除
          </button>
        </div>
      </BottomSheet>

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
          placeholder="内容"
          value={pe.body}
          onChange={pe.setBody}
          readOnly={pe.creating}
        />
        {pe.fieldErrors.body && <p className="flashErr">{pe.fieldErrors.body[0]}</p>}

        <div className="mt12 row">
          <Button
            onClick={pe.createAction}
            disabled={pe.creating || !pe.title || !pe.body}
            variant="primary"
            size="md"
            align="center"
          >
            {pe.creating ? '...' : '追加する'}
          </Button>

          <Button
            onClick={pe.closeAdd}
            disabled={pe.creating}
            variant="black"
            size="md"
            align="center"
          >
            閉じる
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}