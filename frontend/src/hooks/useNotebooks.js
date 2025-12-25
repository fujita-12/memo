import { useEffect, useRef, useState } from 'react';
import {
  listNotebooks,
  createNotebook,
  deleteNotebook,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../api/client';

export function useNotebooks({ flash }) {
  // notebooks/notes
  const [notebooks, setNotebooks] = useState([]);
  const [nbTitle, setNbTitle] = useState('');
  const [selectedNotebook, setSelectedNotebook] = useState(null);

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const [nbFieldErrors, setNbFieldErrors] = useState({});
  const [noteFieldErrors, setNoteFieldErrors] = useState({});

  // loading（用途別）
  const [creatingNotebook, setCreatingNotebook] = useState(false);
  const [openingNotebookId, setOpeningNotebookId] = useState(null);
  const [deletingNotebookId, setDeletingNotebookId] = useState(null);

  const [creatingNote, setCreatingNote] = useState(false);
  const [updatingNoteId, setUpdatingNoteId] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // ✅ 競合対策：最後に押した open だけ反映
  const openNotesReqId = useRef(0);

  // 初回 notebooks 取得
  useEffect(() => {
    (async () => {
      try {
        const items = await listNotebooks();
        setNotebooks(items);
      } catch (e) {
        // ここは静かにしてもOK。必要なら flash.fail でもOK
        console.error(e);
      }
    })();
  }, []);

  // notebook 切替時：noteフォームとエラーをクリア（事故防止）
  useEffect(() => {
    setNoteTitle('');
    setNoteBody('');
    setNoteFieldErrors({});
  }, [selectedNotebook?.id]);

  // unmount 時：進行中 open を無効化（念のため）
  useEffect(() => {
    return () => {
      openNotesReqId.current++;
    };
  }, []);

  const createNotebookAction = async () => {
    flash.reset();
    setNbFieldErrors({});
    setCreatingNotebook(true);

    try {
      const nb = await createNotebook(nbTitle);
      setNotebooks((prev) => [nb, ...prev]);
      setNbTitle('');
    } catch (e) {
      const errs = flash.fail(e, '追加に失敗しました');
      setNbFieldErrors(errs);
    } finally {
      setCreatingNotebook(false);
    }
  };

  const deleteNotebookAction = async (id, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingNotebookId(id);
    try {
      await deleteNotebook(id);
      setNotebooks((prev) => prev.filter((n) => n.id !== id));

      if (selectedNotebook?.id === id) {
        setSelectedNotebook(null);
        setNotes([]);
      }
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingNotebookId(null);
    }
  };

  const openNotebookAction = async (nb) => {
    flash.reset();

    const reqId = ++openNotesReqId.current;

    setOpeningNotebookId(nb.id);
    setSelectedNotebook(nb);

    try {
      const items = await listNotes(nb.id);

      if (reqId !== openNotesReqId.current) return;
      setNotes(items);
    } catch (e) {
      if (reqId !== openNotesReqId.current) return;
      flash.fail(e, 'ノートの取得に失敗しました');
    } finally {
      if (reqId === openNotesReqId.current) {
        setOpeningNotebookId(null);
      }
    }
  };

  const createNoteAction = async () => {
    if (!selectedNotebook) return;

    flash.reset();
    setNoteFieldErrors({});
    setCreatingNote(true);

    try {
      const n = await createNote(selectedNotebook.id, { title: noteTitle, body: noteBody });
      setNotes((prev) => [n, ...prev]);
      setNoteTitle('');
      setNoteBody('');
    } catch (e) {
      const errs = flash.fail(e, 'ノート作成に失敗しました');
      setNoteFieldErrors(errs);
    } finally {
      setCreatingNote(false);
    }
  };

  const updateNoteAction = async (noteId, payload) => {
    flash.reset();
    setUpdatingNoteId(noteId);

    try {
      const updated = await updateNote(noteId, payload);
      setNotes((prev) => prev.map((x) => (x.id === noteId ? updated : x)));
      return updated;
    } catch (e) {
      flash.fail(e, '更新に失敗しました');
      return null;
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const deleteNoteAction = async (noteId, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;

    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((x) => x.id !== noteId));
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingNoteId(null);
    }
  };

  return {
    notebooks,
    nbTitle,
    setNbTitle,
    nbFieldErrors,

    selectedNotebook,
    notes,
    noteTitle,
    setNoteTitle,
    noteBody,
    setNoteBody,
    noteFieldErrors,

    creatingNotebook,
    openingNotebookId,
    deletingNotebookId,
    creatingNote,
    updatingNoteId,
    deletingNoteId,

    createNotebookAction,
    deleteNotebookAction,
    openNotebookAction,
    createNoteAction,
    updateNoteAction,
    deleteNoteAction,
  };
}
