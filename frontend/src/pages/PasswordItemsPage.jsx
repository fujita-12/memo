// src/pages/PasswordItemsPage.jsx
import { Link, useParams, useLocation } from 'react-router-dom';
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
import { usePasswordItems } from '../hooks/usePasswordItems.js';

import { copyToClipboard } from '../utils/clipboard';

import { KeyRound, FilePlusCorner, MoreHorizontal, Trash2, ClipboardCopy } from 'lucide-react';

import '../styles/note-pass.css';

// 1行化（プレビュー用）
function toOneLine(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

function clipText(s, n = 60) {
  const t = toOneLine(s);
  if (t.length <= n) return t;
  return t.slice(0, n) + '…';
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

export default function PasswordItemsPage() {
  const { listId } = useParams();
  const location = useLocation();

  const listTitle = location.state?.listTitle || '';

  const flash = useFlash();
  const pw = usePasswordItems({ flash, listId });

  const isMobileTouch = useIsMobileTouch();

  // 吹き出しトースト（コピーした行だけ表示）
  const [toast, setToast] = useState({ id: null, message: '' });
  const toastTimerRef = useRef(null);

  const showInlineToast = (id, message = 'コピーしました') => {
    setToast({ id, message });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast({ id: null, message: '' });
      toastTimerRef.current = null;
    }, 3000);
  };

  // コピー（上部フラッシュは出さない）
  const copyAndToast = async (rowId, body) => {
    const text = body ?? '';
    if (!text) {
      showInlineToast(rowId, 'コピーする内容がありません');
      return;
    }
    try {
      const ok = await copyToClipboard(text);
      showInlineToast(rowId, ok ? 'コピーしました' : 'コピーできませんでした');
    } catch {
      showInlineToast(rowId, 'コピーに失敗しました');
    }
  };

  // スマホ：スワイプで開いてるRow
  const [openRowId, setOpenRowId] = useState(null);

  // 開いた状態で縦スクロールしたら閉じる
  useEffect(() => {
    if (!openRowId) return;

    const onScroll = () => setOpenRowId(null);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [openRowId]);

  // PC：…押したらBottomSheet（削除のみ）
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState(null); // {id,title}

  const openSheet = (it) => {
    setTarget({ id: it.id, title: it.title });
    setSheetOpen(true);
  };
  const closeSheet = () => {
    setSheetOpen(false);
    setTarget(null);
  };

  const doDelete = async () => {
    if (!target) return;
    const ok = confirm('削除しますか？（詳細も削除されます）');
    if (!ok) return;
    await pw.deleteAction(target.id, { confirmed: true });
    closeSheet();
  };

  return (
    // ここ重要：上部フラッシュを使わない（コピーも含めて上に出したくない）
    <AppShell info="" error="" showTabs={true}>
      <PageDefault title="Password一覧" className="notePassPage">
        <div className="itemList mt36">
          {pw.loadingList && <p className="small">Loading...</p>}

          <div className="itemLength">
            {pw.items.length}個のパスワード
            {listTitle ? (
              <span className="muted" style={{ marginLeft: 10 }}>
                ：{listTitle}
              </span>
            ) : null}
          </div>

          {pw.items.map((it) => {
            const previews = it.preview_entries ?? [];
            const showPreviews = previews.slice(0, 3); // 最大3件だけ表示

            // PC：…ボタンだけ
            if (!isMobileTouch) {
              return (
                <div key={it.id} className="listRow listRowDesktop pwRow">
                  <Link className="linkLike rowLink pwRowLink" to={`/password-lists/${listId}/items/${it.id}`}>
                    <KeyRound size={28} />
                    <div className="pwRowText">
                      <div className="pwRowTitle">{it.title}</div>

                      <div className="pwRowPreview">
                        {showPreviews.length === 0 ? (
                          <span className="muted">（まだ詳細がありません）</span>
                        ) : (
                          <div className="pwPreviewGrid">
                            {showPreviews.map((e) => (
                              <div key={e.id} className="pwPreviewRow">
                                <div className="pwPreviewLabel">{clipText(e.title, 18)}</div>

                                {/* value欄：ここに吹き出し */}
                                <div className="pwValueWrap">
                                  {toast.id === e.id && (
                                    <div className="inlineToast" role="status" aria-live="polite">
                                      {toast.message}
                                    </div>
                                  )}

                                  <div
                                    className="pwPreviewValue"
                                    role="button"
                                    tabIndex={0}
                                    title="クリックでコピー"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      copyAndToast(e.id, e.body);
                                    }}
                                    onKeyDown={(ev) => {
                                      if (ev.key === 'Enter' || ev.key === ' ') {
                                        ev.preventDefault();
                                        copyAndToast(e.id, e.body);
                                      }
                                    }}
                                  >
                                    {clipText(e.body, 60)}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="pwCopyBtn"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    copyAndToast(e.id, e.body);
                                  }}
                                  title="コピー"
                                >
                                  <ClipboardCopy size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  <button type="button" className="moreBtn" onClick={() => openSheet(it)} aria-label="メニュー">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              );
            }

            // スマホ：左スワイプで削除のみ
            return (
              <div key={it.id} className="listRow listRowSwipe pwRow">
                <SwipeRow
                  rowId={it.id}
                  openRowId={openRowId}
                  setOpenRowId={setOpenRowId}
                  actionsWidth={70}
                  actions={
                    <div className="rowActionsBack">
                      <button
                        type="button"
                        className="backBtn backDelete"
                        onClick={async () => {
                          const ok = confirm('削除しますか？（詳細も削除されます）');
                          if (!ok) return;
                          await pw.deleteAction(it.id, { confirmed: true });
                          setOpenRowId(null);
                        }}
                        disabled={pw.deletingId === it.id}
                        aria-label="削除"
                      >
                        {pw.deletingId === it.id ? '...' : <Trash2 size={18} />}
                      </button>
                    </div>
                  }
                >
                  <Link
                    className="linkLike rowLink pwRowLink"
                    to={`/password-lists/${listId}/items/${it.id}`}
                    onClick={() => {
                      if (openRowId) setOpenRowId(null);
                    }}
                  >
                    <KeyRound size={28} />
                    <div className="pwRowText">
                      <div className="pwRowTitle">{it.title}</div>

                      <div className="pwRowPreview">
                        {showPreviews.length === 0 ? (
                          <span className="muted">（まだ詳細がありません）</span>
                        ) : (
                          <div className="pwPreviewGrid">
                            {showPreviews.map((e) => (
                              <div key={e.id} className="pwPreviewRow">
                                <div className="pwPreviewLabel">{clipText(e.title, 18)}</div>

                                {/* SPも同じ：吹き出し */}
                                <div className="pwValueWrap">
                                  {toast.id === e.id && (
                                    <div className="inlineToast" role="status" aria-live="polite">
                                      {toast.message}
                                    </div>
                                  )}

                                  <div
                                    className="pwPreviewValue"
                                    role="button"
                                    tabIndex={0}
                                    title="クリックでコピー"
                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      copyAndToast(e.id, e.body);
                                    }}
                                    onKeyDown={(ev) => {
                                      if (ev.key === 'Enter' || ev.key === ' ') {
                                        ev.preventDefault();
                                        copyAndToast(e.id, e.body);
                                      }
                                    }}
                                  >
                                    {clipText(e.body, 60)}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="pwCopyBtn"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    copyAndToast(e.id, e.body);
                                  }}
                                  title="コピー"
                                >
                                  <ClipboardCopy size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </SwipeRow>
              </div>
            );
          })}
        </div>

        {/* 右下＋（見た目はNotebooksと同じ / モーダル発火） */}
        <FooterPlusButton onClick={pw.openAdd} ariaLabel="Password追加">
          <FilePlusCorner size={20} />
        </FooterPlusButton>
      </PageDefault>

      {/* スワイプ開いてる時、背景タップで閉じる */}
      {openRowId && <div className="swipeDismissOverlay" onClick={() => setOpenRowId(null)} aria-hidden="true" />}

      {/* PC：BottomSheet（削除のみ） */}
      <BottomSheet open={sheetOpen} title="Password メニュー" onClose={closeSheet}>
        <div className="sheetBtns">
          <button type="button" className="sheetBtn danger" onClick={doDelete}>
            <Trash2 size={18} />
            削除
          </button>
        </div>
      </BottomSheet>

      {/* 追加モーダル（名前だけ） */}
      <Modal open={pw.addOpen} title="Password 追加" onClose={pw.closeAdd}>
        <TextField placeholder="Passwordの名前" value={pw.title} onChange={pw.setTitle} readOnly={pw.creating} />
        {pw.fieldErrors.title && <p className="flashErr">{pw.fieldErrors.title[0]}</p>}

        <div className="mt12 row">
          <Button onClick={pw.createAction} disabled={pw.creating || !pw.title} variant="primary" size="md" align="center">
            {pw.creating ? '...' : '追加する'}
          </Button>

          <Button onClick={pw.closeAdd} disabled={pw.creating} variant="black" size="md" align="center">
            閉じる
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}