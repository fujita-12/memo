// src/pages/NotePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import TextField from '../components/TextField.jsx';
import FooterPlusButton from '../components/FooterPlusButton.jsx';

import { useFlash } from '../hooks/useFlash.js';
import { useNoteEditor } from '../hooks/useNoteEditor.js';
import { listNotebooks } from '../api/client';
import { Notebook, FileText, Undo2 } from 'lucide-react';

import '../styles/note-pass.css';

export default function NotePage() {
  const { notebookId, noteId } = useParams();
  const nav = useNavigate();
  const flash = useFlash();

  const ed = useNoteEditor({ flash, noteId });

  const [notebookTitle, setNotebookTitle] = useState('');
  const fail = flash.fail;
  useEffect(() => {
    if (!notebookId) return;

    (async () => {
      try {
        const data = await listNotebooks();
        const found = data.find((x) => String(x.id) === String(notebookId));
        setNotebookTitle(found?.title || '');
      } catch (e) {
        fail(e, '取得に失敗しました');
      }
    })();
  }, [notebookId, fail]);

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title="Note" className="notePassPage no-title">
        <div className="itemnameFlex">
          <div className="itemname">
            <Notebook size={14} />
            {notebookTitle ? notebookTitle : '...'}
          </div>
          <div className="small muted">
            {ed.status || (ed.loading ? 'Loading...' : '')}
          </div>
        </div>
        <div className="createInput">
          <FileText size={30} />
          <TextField
            placeholder="ノートの名前"
            value={ed.title}
            onChange={ed.setTitle}
            readOnly={ed.loading}
          />
          {ed.fieldErrors?.title && <p className="flashErr">{ed.fieldErrors.title[0]}</p>}
        </div>

        <div className="mt12 textareaWrap">
          <textarea
            placeholder="本文"
            value={ed.body}
            onChange={(e) => ed.setBody(e.target.value)}
            rows={14}
            style={{ width: '100%' }}
            disabled={ed.loading}
            onBlur={() => {
              // フォーカス外れたら即 flush（保存漏れ減らす）
              ed.flushSave();
            }}
          />
          {ed.fieldErrors?.body && <p className="flashErr">{ed.fieldErrors.body[0]}</p>}
        </div>
        
        <FooterPlusButton
          onClick={async () => {
            // 戻る前にできる限り flush
            await ed.flushSave();
            nav(`/notebooks/${notebookId}`);
          }}
        >
          <Undo2 size={20} />
        </FooterPlusButton>
      </PageDefault>
    </AppShell>
  );
}