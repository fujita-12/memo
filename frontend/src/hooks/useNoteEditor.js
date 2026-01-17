import { useEffect, useRef, useState } from 'react';
import { getNote, updateNote } from '../api/client';

export function useNoteEditor({ flash, noteId }) {
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState(null); // サーバー最新
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [status, setStatus] = useState(''); // '', '保存済み', '保存中...', '未保存'
  const [fieldErrors, setFieldErrors] = useState({});

  const saveTimerRef = useRef(null);
  const saveReqIdRef = useRef(0);
  const lastSavedRef = useRef({ title: '', body: '' });

  // 初回取得
  useEffect(() => {
    (async () => {
      setLoading(true);
      flash.reset();
      try {
        const d = await getNote(noteId);
        setNote(d);
        setTitle(d.title ?? '');
        setBody(d.body ?? '');
        lastSavedRef.current = { title: d.title ?? '', body: d.body ?? '' };
        setStatus('保存済み');
      } catch (e) {
        flash.fail(e, '取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveReqIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const scheduleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    // タイトル必須なので空なら保存しない
    if (!title.trim()) {
      setStatus('未保存（タイトル必須）');
      return;
    }

    // 変更がないなら何もしない
    const last = lastSavedRef.current;
    if (last.title === title && (last.body ?? '') === (body ?? '')) {
      setStatus('保存済み');
      return;
    }

    setStatus('未保存');

    saveTimerRef.current = setTimeout(async () => {
      const reqId = ++saveReqIdRef.current;
      setFieldErrors({});
      setStatus('保存中...');

      try {
        const updated = await updateNote(noteId, { title, body: body || null });

        if (reqId !== saveReqIdRef.current) return; // 古いリクエストは無視
        setNote(updated);

        lastSavedRef.current = { title: updated.title ?? title, body: updated.body ?? (body || '') };
        setStatus('保存済み');
      } catch (e) {
        if (reqId !== saveReqIdRef.current) return;
        const errs = flash.fail(e, '保存に失敗しました');
        setFieldErrors(errs);
        setStatus('未保存（エラー）');
      }
    }, 600); // 0.6秒止まったら保存
  };

  // title/body 変更で保存予約
  useEffect(() => {
    if (loading) return;
    scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  // 画面離脱前に最後の保存（できる範囲で）
  const flushSave = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    if (!title.trim()) return;

    const last = lastSavedRef.current;
    if (last.title === title && (last.body ?? '') === (body ?? '')) return;

    const reqId = ++saveReqIdRef.current;
    setFieldErrors({});
    setStatus('保存中...');

    try {
      const updated = await updateNote(noteId, { title, body: body || null });
      if (reqId !== saveReqIdRef.current) return;
      setNote(updated);
      lastSavedRef.current = { title: updated.title ?? title, body: updated.body ?? (body || '') };
      setStatus('保存済み');
    } catch (e) {
      if (reqId !== saveReqIdRef.current) return;
      const errs = flash.fail(e, '保存に失敗しました');
      setFieldErrors(errs);
      setStatus('未保存（エラー）');
    }
  };

  return {
    loading,
    note,

    title,
    setTitle,
    body,
    setBody,

    status,
    fieldErrors,

    flushSave,
  };
}