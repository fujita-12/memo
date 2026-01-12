import { useEffect, useRef, useState } from 'react';
import {
  listPasswordEntries,
  createPasswordEntry,
  deletePasswordEntry,
  getPasswordItem,
} from '../api/client';
import { copyToClipboard } from '../utils/clipboard';

export function usePasswordEntries({ flash, itemId }) {
  const [item, setItem] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const reqRef = useRef(0);

  useEffect(() => {
    if (!itemId) return;

    const reqId = ++reqRef.current;
    setLoading(true);

    (async () => {
      try {
        // item名表示用（secretはもう使わない想定）
        const it = await getPasswordItem(itemId);
        const en = await listPasswordEntries(itemId);

        if (reqId !== reqRef.current) return;

        setItem(it);
        // 下に積む運用なので「古い→新しい」の順にしたいなら reverse など調整
        // APIはlatest()で返しているので「新しい→古い」になりがち。ここでは「下に積む」なので逆順にします。
        const sorted = Array.isArray(en) ? [...en].reverse() : [];
        setEntries(sorted);
      } catch (e) {
        if (reqId !== reqRef.current) return;
        flash.fail(e, '取得に失敗しました');
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    })();
  }, [itemId]);

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
      // 追加分は「一番下」に積む
      setEntries((p) => [...p, created]);
      setAddOpen(false);
    } catch (e) {
      const errs = flash.fail(e, '追加に失敗しました');
      setFieldErrors(errs);
    } finally {
      setCreating(false);
    }
  };

  const deleteAction = async (entryId, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingId(entryId);
    try {
      await deletePasswordEntry(entryId);
      setEntries((p) => p.filter((x) => x.id !== entryId));
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  const copy = async (text) => {
    flash.reset();
    const ok = await copyToClipboard(text ?? '');
    flash.info = ok ? 'コピーしました' : 'コピーできませんでした';
  };

  return {
    item,
    entries,
    loading,

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

    copy,
  };
}