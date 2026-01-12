import AppShell from '../../components/AppShell.jsx';
import Section from '../../components/Section.jsx';
import { Link } from 'react-router-dom';

export default function SettingsIndexPage({ user }) {
  return (
    <AppShell>
      <p>ログイン中: {user.email}</p>

      <Section title="アカウント設定">
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <Link className="btnLike" to="/settings/email">メール変更</Link>
          <Link className="btnLike" to="/settings/password">パスワード変更</Link>
          <Link className="btnLike danger" to="/settings/delete">退会</Link>
        </div>

        <p className="small mt12">
          ※ 旧メール承認 → 新メール確定のフローは「メール変更」から行えます。
        </p>
      </Section>
    </AppShell>
  );
}