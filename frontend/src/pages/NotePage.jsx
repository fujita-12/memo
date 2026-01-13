import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { useNoteEditor } from '../hooks/useNoteEditor.js';

export default function NotePage() {
  const { notebookId, noteId } = useParams();
  const nav = useNavigate();
  const flash = useFlash();

  const ed = useNoteEditor({ flash, noteId });

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Note 編集（自動保存）">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Button
            onClick={async () => {
              // 戻る前にできる限り flush
              await ed.flushSave();
              nav(`/notebooks/${notebookId}`);
            }}
          >
            一覧へ戻る
          </Button>

          <div className="small muted">
            {ed.status || (ed.loading ? 'Loading...' : '')}
          </div>
        </div>

        <div className="mt16" />

        <TextField
          placeholder="タイトル（必須）"
          value={ed.title}
          onChange={ed.setTitle}
          readOnly={ed.loading}
        />
        {ed.fieldErrors?.title && <p className="flashErr">{ed.fieldErrors.title[0]}</p>}

        <div className="mt12" />

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

        <div className="mt12 small muted">
          入力が止まったら自動で保存します（約0.6秒）。タイトルは必須です。
        </div>
      </Section>
    </AppShell>
  );
}