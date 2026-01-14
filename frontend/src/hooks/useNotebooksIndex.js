import { useEffect, useRef, useState } from 'react';
import { listNotebooks, createNotebook, updateNotebook, deleteNotebook } from '../api/client';

export function useNotebooksIndex({ flash }) {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const reqIdRef = useRef(0);

  const reload = async () => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    try {
      const data = await listNotebooks();
      if (reqId !== reqIdRef.current) return;
      setNotebooks(data);
    } catch (e) {
      if (reqId !== reqIdRef.current) return;
      flash.fail(e, '取得に失敗しました');
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    return () => {
      reqIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAction = async () => {
    flash.reset();
    setFieldErrors({});
    setCreating(true);
    try {
      const created = await createNotebook(title);
      setNotebooks((p) => [created, ...p]);
      setTitle('');
      return created;
    } catch (e) {
      const errs = flash.fail(e, '作成に失敗しました');
      setFieldErrors(errs);
      return null;
    } finally {
      setCreating(false);
    }
  };

  // タイトル更新
  const updateAction = async (id, payload) => {
    flash.reset();
    setFieldErrors({});
    setUpdatingId(id);

    try {
      const updated = await updateNotebook(id, payload);

      setNotebooks((p) => p.map((x) => (x.id === id ? updated : x)));

      // メッセージが欲しければ
      flash.info = '更新しました';

      return updated;
    } catch (e) {
      const errs = flash.fail(e, '更新に失敗しました');
      setFieldErrors(errs);
      return null;
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteAction = async (id, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteNotebook(id);
      setNotebooks((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    notebooks,
    loading,

    title,
    setTitle,
    fieldErrors,

    creating,
    createAction,

    updatingId,
    updateAction,

    deletingId,
    deleteAction,

    reload,
  };
}