// src/components/Header.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogoutAction } from '../hooks/useLogoutAction';
import styles from './Header.module.css';

export default function Header({ user, onLoggedOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const { loadingLogout, logoutAction } = useLogoutAction({ onLoggedOut });

  useEffect(() => {
    const onMouseDown = (e) => {
      if (!open) return;
      if (rootRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKeyDown = (e) => {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Memo App
        </Link>

        <div className={styles.right}>
          {user ? (
            <div ref={rootRef} className={styles.menuRoot}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className={styles.iconButton}
                title={user.email}
              >
                {(user.email?.[0] ?? 'A').toUpperCase()}
              </button>

              {open && (
                <div role="menu" className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownLabel}>Signed in as</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>          
                  </div>
                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={styles.menuButton}
                  >
                    アカウント設定
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      await logoutAction();
                    }}
                    disabled={loadingLogout}
                    className={[
                      styles.menuButton,
                      loadingLogout ? styles.menuButtonDisabled : '',
                    ].join(' ')}
                  >
                    {loadingLogout ? '...' : 'ログアウト'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </header>
  );
}
