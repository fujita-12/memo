import AppShell from '../../components/AppShell.jsx';
import { Link } from 'react-router-dom';

export default function SettingsIndexPage({ user }) {
  return (
    <AppShell>
      <div className={`default-box-bg`}>
        <h2>アカウント設定</h2>
        <table className="main-table">
          <tbody>
            <tr>
              <th>ユーザーネーム</th>
              <td>{user.name}</td>
            </tr>
            <tr>
              <th>メールアドレス</th>
              <td>{user.email}</td>
            </tr>
          </tbody>
        </table> 
        <div className="mt36">
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Link className="btnLike" to="/settings/email">メール変更</Link>
            <Link className="btnLike" to="/settings/password">パスワード変更</Link>
            <Link className="btnLike danger" to="/settings/delete">退会</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}