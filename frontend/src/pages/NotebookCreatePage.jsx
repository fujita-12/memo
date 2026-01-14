import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { useNotebooksIndex } from '../hooks/useNotebooksIndex.js';
import { Notebook } from 'lucide-react';

import '../styles/note-pass.css';

export default function NotebookCreatePage() {
  const flash = useFlash();
  const nav = useNavigate();
  const nb = useNotebooksIndex({ flash }); // 既存の hook を使う（作成だけ使う）

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title="Notebook作成" className="notePassPage">
        <div className="createInput">
          <Notebook size={30} />
          <TextField
            id="notebook-title"
            name="notebook-title"
            placeholder="ノートブックの名前"
            value={nb.title}
            onChange={nb.setTitle}
            readOnly={nb.creating}
          />
          {nb.fieldErrors?.title && <p className="flashErr">{nb.fieldErrors.title[0]}</p>}
        </div>
        <div className="mt36">
          <Button
            onClick={async () => {
              const created = await nb.createAction();
              if (!created) return;
              nav(`/notebooks/${created.id}`, { replace: true });
            }}
            disabled={nb.creating || !nb.title}
            variant="primary" 
            size="md" 
            align="center"
          >
            {nb.creating ? '...' : '作成する'}
          </Button>
        </div>
        <div className="mt24">
          <Button to="/notebooks" disabled={nb.creating} variant="black" size="md" align="center">
            戻る
          </Button>
        </div>
      </PageDefault>
    </AppShell>
  );
}