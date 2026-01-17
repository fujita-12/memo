// src/pages/PasswordItemPage.jsx
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

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
import { listPasswordLists } from '../api/client';

import {
  KeyRound,
  FilePlusCorner,
  MoreHorizontal,
  Trash2,
  Undo2,
  ClipboardCopy,
  FileText,
} from 'lucide-react';

import '../styles/note-pass.css';

// BottomSheet
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

  // 一覧→詳細のstate（あれば最優先）
  const passedListTitle =
    typeof location.state?.listTitle === 'string' ? location.state.listTitle : '';

  // APIで補完する用のstate
  const [fetchedListTitle, setFetchedListTitle] = useState('');

  // 表示するタイトルは「state優先、無ければAPI」
  const listTitle = passedListTitle?.trim() ? passedListTitle : fetchedListTitle;

  useEffect(() => {
    // stateで渡ってきてるならAPI取りに行かない
    if (passedListTitle?.trim()) return;
    if (!listId) return;

    (async () => {
      try {
        const lists = await listPasswordLists();
        const found = lists.find((x) => String(x.id) === String(listId));
        setFetchedListTitle(found?.title || '');
      } catch {
        setFetchedListTitle('');
      }
    })();
  }, [listId, passedListTitle]);

  const flash = useFlash();
  const pe = usePasswordEntries({ flash, itemId });

  const isMobileTouch = useIsMobileTouch();

  // SP：スワイプで開いてるRow
  const [openRowId, setOpenRowId] = useState(null);

  useEffect(() => {
    if (!openRowId) return;
    const onScroll = () => setOpenRowId(null);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [openRowId]);

  // PC：…押したらBottomSheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState(null);

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

  // コピーtoast（3秒）
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

  // 保存完了メッセージ（0.8秒だけ表示）
  const [savedMsg, setSavedMsg] = useState('');
  const [savedKey, setSavedKey] = useState(0);
  const savedTimerRef = useRef(null);
  const prevSavingRef = useRef(false);

  useEffect(() => {
  if (pe.loading) return;

  const prev = prevSavingRef.current;
  const now = pe.anySaving;

  // 「保存中 → 保存完了」に変わった瞬間だけ発火
  if (prev === true && now === false) {
    queueMicrotask(() => {
      setSavedKey((k) => k + 1);
      setSavedMsg('保存しました');
    });

    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
        setSavedMsg('');
        savedTimerRef.current = null;
      }, 800);
    }

    prevSavingRef.current = now;
  }, [pe.anySaving, pe.loading]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return (
    <AppShell info={''} error={''}>
      <PageDefault title="Password" className="notePassPage no-title">
        {/* 上：PasswordList名 & 状態 */}
        <div className="itemnameFlex">
          <div className="itemname">
            <KeyRound size={14} />
            <span>{listTitle?.trim() ? listTitle : '...'}</span>
          </div>

          <div className="small muted">
            {pe.loading ? (
              'Loading...'
            ) : pe.anySaving ? (
              '保存中…'
            ) : savedMsg ? (
              <span key={savedKey} className="saveDoneBubble">
                保存しました
              </span>
            ) : (
              ''
            )}
          </div>
        </div>

        {/* PasswordItemタイトル編集 */}
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
              const d = pe.drafts[e.id] || {
                title: e.title ?? '',
                body: e.body ?? '',
                saving: false,
              };

              const EntryFront = (
                <div className="pwEntryFront">
                  <div className="pwEntryRowGrid">
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
                </div>
              );

              // PC
              if (!isMobileTouch) {
                return (
                  <div key={e.id} className="pwEntryRow">
                    {EntryFront}
                  </div>
                );
              }

              // SP：スワイプ削除
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
                          onPointerDown={(ev) => ev.stopPropagation()}
                          onClick={async (ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();
                            const ok = confirm('この詳細を削除しますか？');
                            if (!ok) return;
                            await pe.deleteAction(e.id, { confirmed: true });
                            setOpenRowId(null);
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

            {/* <div className="mt12">
              <Button
                onClick={() => nav(`/password-lists/${listId}`, { replace: true })}
                variant="black"
                size="md"
                align="center"
              >
                一覧へ戻る
              </Button>
            </div> */}
          </div>
        )}

        {/* 右下＋隣の戻るボタン */}
        <FooterPlusButton onClick={() => nav(`/password-lists/${listId}`, { replace: true })} variant="back" position="left">
          <Undo2 size={20} />
        </FooterPlusButton>

        {/* 右下＋ */}
        <FooterPlusButton onClick={pe.openAdd} ariaLabel="詳細を追加">
          <FilePlusCorner size={20} />
        </FooterPlusButton>
      </PageDefault>

      {/* {openRowId && (
        <div
          className="swipeDismissOverlay"
          onClick={() => setOpenRowId(null)}
          aria-hidden="true"
        />
      )} */}

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