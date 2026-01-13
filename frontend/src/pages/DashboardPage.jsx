// src/pages/DashboardPage.jsx

import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { Notebook, KeyRound } from 'lucide-react';

export default function DashboardPage() {
  const flash = useFlash();;

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Dashboard">
        <div style={{ display: 'grid', gap: 12 }}>
          <Link className="linkLike" to="/notebooks/create">
            <Notebook size={20} />
            新規ノートブックを作成
          </Link>
          <Link className="linkLike" to="/password-lists/create">
            <KeyRound size={20} />
            新規パスワードを作成
          </Link>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <Link className="linkLike" to="/notebooks">
            <Notebook size={20} />
            Notebooks を開く
          </Link>

          <Link className="linkLike" to="/password-lists">
            <KeyRound size={20} />
            Password を開く
          </Link>
        </div>
        
      </Section>
    </AppShell>
  );
}
