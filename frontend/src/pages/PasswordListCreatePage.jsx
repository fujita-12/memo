import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { usePasswordVault } from '../hooks/usePasswordVault.js';

export default function PasswordListCreatePage() {
  const flash = useFlash();
  const pv = usePasswordVault({ flash });
  const nav = useNavigate();

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="PasswordList 作成">
        <TextField
          placeholder="パスワードリストの名前"
          value={pv.listTitle}
          onChange={pv.setListTitle}
          readOnly={pv.creatingList}
        />
        {pv.listFieldErrors.title && <p className="flashErr">{pv.listFieldErrors.title[0]}</p>}

        <div className="mt12 row">
          <Button
            onClick={async () => {
              const created = await pv.createListAction();
              if (!created) return;
              nav(`/password-lists/${created.id}`, { replace: true });
            }}
            disabled={pv.creatingList || !pv.listTitle}
          >
            {pv.creatingList ? '...' : '作成する'}
          </Button>

          <Button onClick={() => nav('/password-lists')} disabled={pv.creatingList}>
            戻る
          </Button>
        </div>
      </Section>
    </AppShell>
  );
}