// src/components/AppShell.jsx
import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Notebook, KeyRound } from 'lucide-react';

export default function AppShell({ info, error, children, showTabs = true }) {
  const location = useLocation();

  // 例：/password-lists/1/items/2 でも PASSWORD を active にしたい
  const activeGroup = useMemo(() => {
    const p = location.pathname;

    if (p.startsWith('/password-lists')) return 'password';
    if (p.startsWith('/notebooks') || p.startsWith('/notes')) return 'notebook';
    if (p.startsWith('/dashboard')) return 'dashboard';

    // 他ページのときは何も active にしない（好みで dashboard に寄せてもOK）
    return null;
  }, [location.pathname]);

  return (
    <div className={`app ${showTabs ? 'tabPage' : 'noTabs'}`}>
      <main className={`appMain`}>
        <div className="appMainInner">
          {(info || error) && (
            <div className="flashArea" role="status" aria-live="polite">
              {info && <p className="flashOk">{info}</p>}
              {error && <p className="flashErr">{error}</p>}
            </div>
          )}

          {children}
        </div>
      </main>

      {/* タブバー */}
      {showTabs ? (
        <footer className="appFooter appTabBar" role="navigation" aria-label="Footer tabs">
          <div className="appFooterInner appTabBarInner">
            <NavLink
              to="/dashboard"
              end
              className={`tabItem ${activeGroup === 'dashboard' ? 'isActive' : ''}`}
              aria-label="MENU"
            >
              <span className="tabIcon" aria-hidden="true">
                <LayoutGrid size={25} />
              </span>
              <span className="tabLabel">MENU</span>
            </NavLink>

            <NavLink
              to="/notebooks"
              className={`tabItem ${activeGroup === 'notebook' ? 'isActive' : ''}`}
              aria-label="NOTEBOOK"
            >
              <span className="tabIcon" aria-hidden="true">
                <Notebook size={25} />
              </span>
              <span className="tabLabel">NOTEBOOK</span>
            </NavLink>

            <NavLink
              to="/password-lists"
              className={`tabItem ${activeGroup === 'password' ? 'isActive' : ''}`}
              aria-label="PASSWORD"
            >
              <span className="tabIcon" aria-hidden="true">
                <KeyRound size={25} />
              </span>
              <span className="tabLabel">PASSWORD</span>
            </NavLink>
          </div>
        </footer>
      ) : (
        <div className="copy">Copyright © MemoApp All Rights Reserved.</div>
      )}
    </div>
  );
}