import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { useNotebooksIndex } from '../hooks/useNotebooksIndex.js';

export default function NotebookCreatePage() {
  const flash = useFlash();
  const nav = useNavigate();
  const nb = useNotebooksIndex({ flash }); // 既存の hook を使う（作成だけ使う）

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Notebook 作成">
        <TextField
          placeholder="ノートブックの名前"
          value={nb.title}
          onChange={nb.setTitle}
          readOnly={nb.creating}
        />
        {nb.fieldErrors?.title && <p className="flashErr">{nb.fieldErrors.title[0]}</p>}

        <div className="mt12 row">
          <Button
            onClick={async () => {
              const created = await nb.createAction();
              if (!created) return;
              nav(`/notebooks/${created.id}`, { replace: true });
            }}
            disabled={nb.creating || !nb.title}
          >
            {nb.creating ? '...' : '作成する'}
          </Button>

          <Button onClick={() => nav('/notebooks')} disabled={nb.creating}>
            戻る
          </Button>
        </div>
      </Section>
    </AppShell>
  );
}