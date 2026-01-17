import { useEffect, useRef, useState } from 'react';
import { getNotebook, listNotes, createNote, deleteNote } from '../api/client';

export function useNotesList({ flash, notebookId }) {
  const [notebook, setNotebook] = useState(null);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // add modal
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const reqIdRef = useRef(0);

  const reload = async () => {
    if (!notebookId) return;

    const reqId = ++reqIdRef.current;
    setLoading(true);

    try {
      // タイトル用（notesも付くけど、ここではタイトル目的）
      const nb = await getNotebook(notebookId);
      if (reqId !== reqIdRef.current) return;
      setNotebook({ id: nb.id, title: nb.title });

      const items = await listNotes(notebookId);
      if (reqId !== reqIdRef.current) return;
      setNotes(items);
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
  }, [notebookId]);

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
      const created = await createNote(notebookId, { title, body: body || null });
      setNotes((p) => [created, ...p]);
      setAddOpen(false);
      return created;
    } catch (e) {
      const errs = flash.fail(e, '作成に失敗しました');
      setFieldErrors(errs);
      return null;
    } finally {
      setCreating(false);
    }
  };

  const deleteAction = async (noteId, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingId(noteId);
    try {
      await deleteNote(noteId);
      setNotes((p) => p.filter((x) => x.id !== noteId));
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    notebook,
    notes,
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

    reload,
  };
}