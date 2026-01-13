// src/pages/DashboardPage.jsx

import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import Section from '../components/Section.jsx';
import { useFlash } from '../hooks/useFlash.js';

export default function DashboardPage() {
  const flash = useFlash();;

  return (
    <AppShell info={flash.info} error={flash.error}>
      <Section title="Dashboard">
        <div style={{ display: 'grid', gap: 12 }}>
          <Link className="linkLike" to="/notebooks">
            📓 Notebooks を開く
          </Link>

          <Link className="linkLike" to="/password-lists">
            🔑 Password を開く
          </Link>
        </div>
      </Section>
    </AppShell>
  );
}
