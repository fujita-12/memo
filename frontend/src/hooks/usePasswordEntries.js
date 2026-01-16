// src/hooks/usePasswordEntries.js
import { useEffect, useRef, useState } from 'react';
import {
  listPasswordEntries,
  createPasswordEntry,
  deletePasswordEntry,
  getPasswordItem,
  updatePasswordItem,
  updatePasswordEntry, // ✅ 追加（client.jsに追加する）
} from '../api/client';
import { copyToClipboard } from '../utils/clipboard';

export function usePasswordEntries({ flash, itemId }) {
  const [item, setItem] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ PasswordItemタイトル編集用
  const [itemTitle, setItemTitle] = useState('');
  const [itemFieldErrors, setItemFieldErrors] = useState({});
  const [itemSaving, setItemSaving] = useState(false);
  const itemTimerRef = useRef(null);

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const reqRef = useRef(0);

  // ✅ entries編集用drafts
  const [drafts, setDrafts] = useState({}); // { [entryId]: { title, body, saving } }
  const timersRef = useRef(new Map()); // entryId -> timer

  useEffect(() => {
    if (!itemId) return;

    const reqId = ++reqRef.current;
    setLoading(true);

    (async () => {
      try {
        const it = await getPasswordItem(itemId);
        const en = await listPasswordEntries(itemId);

        if (reqId !== reqRef.current) return;

        setItem(it);
        setItemTitle(it?.title ?? '');

        const sorted = Array.isArray(en) ? [...en].reverse() : [];
        setEntries(sorted);

        // drafts同期
        const next = {};
        for (const e of sorted) {
          next[e.id] = {
            title: e.title ?? '',
            body: e.body ?? '',
            saving: false,
          };
        }
        setDrafts(next);
      } catch (e) {
        if (reqId !== reqRef.current) return;
        flash.fail(e, '取得に失敗しました');
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [itemId]);

  // ------------------------
  // PasswordItem タイトル即保存
  // ------------------------
  const updateItemAction = async (payload) => {
    flash.reset();
    setItemFieldErrors({});
    setItemSaving(true);

    try {
      const updated = await updatePasswordItem(itemId, payload);
      setItem(updated);
      return updated;
    } catch (e) {
      const errs = flash.fail(e, '更新に失敗しました');
      setItemFieldErrors(errs);
      return null;
    } finally {
      setItemSaving(false);
    }
  };

  const scheduleItemSave = () => {
    if (!itemId) return;

    if (itemTimerRef.current) clearTimeout(itemTimerRef.current);

    itemTimerRef.current = setTimeout(async () => {
      await updateItemAction({ title: itemTitle });
      itemTimerRef.current = null;
    }, 450);
  };

  // ------------------------
  // entries add
  // ------------------------
  const openAdd = () => {
    setFieldErrors({});
    setTitle('');
    setBody('');
    setAddOpen(true);
  };
  const closeAdd = () => setAddOpen(false);

  const createAction = async () => {
    flash.reset();
    setFieldErrors({});
    setCreating(true);

    try {
      const created = await createPasswordEntry(itemId, { title, body });
      setEntries((p) => [...p, created]);
      setDrafts((prev) => ({
        ...prev,
        [created.id]: { title: created.title ?? '', body: created.body ?? '', saving: false },
      }));
      setAddOpen(false);
    } catch (e) {
      const errs = flash.fail(e, '追加に失敗しました');
      setFieldErrors(errs);
    } finally {
      setCreating(false);
    }
  };

  // ------------------------
  // entries delete
  // ------------------------
  const deleteAction = async (entryId, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingId(entryId);
    try {
      await deletePasswordEntry(entryId);
      setEntries((p) => p.filter((x) => x.id !== entryId));
      setDrafts((p) => {
        const next = { ...p };
        delete next[entryId];
        return next;
      });
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  // ------------------------
  // entries update（✅ これがないと保存されない）
  // ------------------------
  const updateEntryAction = async (entryId, payload) => {
    try {
      const updated = await updatePasswordEntry(entryId, payload);
      // entries反映
      setEntries((prev) => prev.map((x) => (x.id === entryId ? updated : x)));
      return updated;
    } catch (e) {
      flash.fail(e, '更新に失敗しました');
      return null;
    }
  };

  const setDraftField = (entryId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [entryId]: {
        ...(prev[entryId] || { title: '', body: '', saving: false }),
        [key]: value,
      },
    }));
  };

  const scheduleSave = (entryId) => {
    const old = timersRef.current.get(entryId);
    if (old) clearTimeout(old);

    const t = setTimeout(async () => {
      const d = drafts[entryId];
      if (!d) return;

      setDrafts((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], saving: true },
      }));

      try {
        await updateEntryAction(entryId, { title: d.title, body: d.body });
      } finally {
        setDrafts((prev) => ({
          ...prev,
          [entryId]: { ...prev[entryId], saving: false },
        }));
      }
    }, 450);

    timersRef.current.set(entryId, t);
  };

  const flushSave = async (entryId) => {
    const old = timersRef.current.get(entryId);
    if (old) clearTimeout(old);

    const d = drafts[entryId];
    if (!d) return;

    setDrafts((prev) => ({
      ...prev,
      [entryId]: { ...prev[entryId], saving: true },
    }));

    try {
      await updateEntryAction(entryId, { title: d.title, body: d.body });
    } finally {
      setDrafts((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], saving: false },
      }));
    }
  };

  // ------------------------
  // copy
  // ------------------------
  const copy = async (text) => {
    const ok = await copyToClipboard(text ?? '');
    return ok;
  };

  return {
    item,
    entries,
    loading,

    // ✅ item title edit
    itemTitle,
    setItemTitle,
    itemFieldErrors,
    itemSaving,
    scheduleItemSave,

    // add modal
    addOpen,
    openAdd,
    closeAdd,

    title,
    setTitle,
    body,
    setBody,

    fieldErrors,
    creating,
    createAction,

    deletingId,
    deleteAction,

    // entry edit
    drafts,
    setDraftField,
    scheduleSave,
    flushSave,

    // copy
    copy,
  };
}