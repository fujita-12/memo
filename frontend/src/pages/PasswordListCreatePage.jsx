import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import TextField from '../components/TextField.jsx';
import Button from '../components/Button.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { usePasswordVault } from '../hooks/usePasswordVault.js';
import { KeyRound } from 'lucide-react';

import '../styles/note-pass.css';

export default function PasswordListCreatePage() {
  const flash = useFlash();
  const pv = usePasswordVault({ flash });
  const nav = useNavigate();

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title="PasswordList作成" className="notePassPage">
        <div className="createInput">
          <KeyRound size={30} />
          <TextField
            id="passwor-title"
            name="password-title"
            placeholder="パスワードリストの名前"
            value={pv.listTitle}
            onChange={pv.setListTitle}
            readOnly={pv.creatingList}
          />
          {pv.listFieldErrors.title && <p className="flashErr">{pv.listFieldErrors.title[0]}</p>}
        </div>
        <div className="mt36">
          <Button
            onClick={async () => {
              const created = await pv.createListAction();
              if (!created) return;
              nav(`/password-lists/${created.id}`, { replace: true });
            }}
            disabled={pv.creatingList || !pv.listTitle}
            variant="primary" 
            size="md" 
            align="center"
          >
            {pv.creatingList ? '...' : '作成する'}
          </Button>
        </div>
        <div className="mt24">
          <Button to="/password-lists" disabled={pv.creatingList} variant="black" size="md" align="center">
            戻る
          </Button>
        </div>
      </PageDefault>
    </AppShell>
  );
}