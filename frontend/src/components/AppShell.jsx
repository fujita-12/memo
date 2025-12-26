export default function AppShell({ info, error, children }) {
  return (
    <div className="app">
      <main className="appMain">
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

      <footer className="appFooter">
        <div className="appFooterInner">
          <small className="muted">© {new Date().getFullYear()} Memo App</small>
        </div>
      </footer>
    </div>
  );
}
