// src/pages/DashboardPage.jsx

import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import PageDefault from '../components/PageDefault.jsx';
import { useFlash } from '../hooks/useFlash.js';
import { Notebook, KeyRound } from 'lucide-react';

import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const flash = useFlash();;

  return (
    <AppShell info={flash.info} error={flash.error}>
      <PageDefault title="Dashboard">
        <div className={`${styles.contentFlex} mt36`}>
          <Link className={`${styles.linkButtonA} ${styles.colorA} linkLike`} to="/notebooks/create">
            <p>
              <Notebook size={30} />
                +新規ノートブック<br className="sp"/>を作成
            </p>
            <span>+Notebook</span>
          </Link>
          <Link className={`${styles.linkButtonA} ${styles.colorB} linkLike`} to="/password-lists/create">
            <p>
              <KeyRound size={30} />
                +新規パスワード<br className="sp"/>を作成
            </p>
            <span>+Password</span>
          </Link>
        </div>
        <hr className={styles.hr} />
        <div className={`${styles.contentFlex} mt24`}>
          <Link className={`${styles.linkButtonB} ${styles.colorC} linkLike`} to="/notebooks">
            <div className={styles.buttonText}>
              <div className={styles.buttonIcon}>
                <Notebook size={30} />
              </div>
              <p>
                <span>Notebook</span><br />
                ノートブック一覧
              </p>
            </div>
          </Link>
          <Link className={`${styles.linkButtonB} ${styles.colorC} linkLike`} to="/password-lists">
            <div className={styles.buttonText}>
              <div className={styles.buttonIcon}>
                <KeyRound size={30} />
              </div>
              <p>
                <span>Password</span><br />
                パスワードリスト一覧
              </p>
            </div>
          </Link>
        </div>
      </PageDefault>
    </AppShell>
  );
}
