import { useEffect, useRef, useState } from 'react';
import {
  listPasswordItems,
  createPasswordItem,
  deletePasswordItem,
} from '../api/client';

export function usePasswordItems({ flash, listId }) {
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // add modal (name only)
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!listId) return;

    const reqId = ++reqIdRef.current;
    setLoadingList(true);

    (async () => {
      try {
        const data = await listPasswordItems(listId);
        if (reqId !== reqIdRef.current) return;
        setItems(data);
      } catch (e) {
        if (reqId !== reqIdRef.current) return;
        flash.fail(e, '取得に失敗しました');
      } finally {
        if (reqId === reqIdRef.current) setLoadingList(false);
      }
    })();
  }, [listId]);

  const openAdd = () => {
    setFieldErrors({});
    setTitle('');
    setAddOpen(true);
  };

  const closeAdd = () => setAddOpen(false);

  const createAction = async () => {
    flash.reset();
    setFieldErrors({});
    setCreating(true);

    try {
      const created = await createPasswordItem(listId, { title });

      // created には latest_entry は付かないので、ここでは空のままOK
      setItems((p) => [created, ...p]);

      setAddOpen(false);
    } catch (e) {
      const errs = flash.fail(e, '追加に失敗しました');
      setFieldErrors(errs);
    } finally {
      setCreating(false);
    }
  };

  const deleteAction = async (id, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deletePasswordItem(id);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    items,
    loadingList,

    addOpen,
    openAdd,
    closeAdd,

    title,
    setTitle,

    fieldErrors,
    creating,
    createAction,

    deletingId,
    deleteAction,
  };
}