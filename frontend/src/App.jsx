import { useEffect, useState } from 'react';
import { getUser } from './api/client';
import AppRoutes from './router/AppRoutes.jsx';
import Header from './components/Header.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const onUserUpdated = (u) => setUser(u);
  const onLoggedOut = () => setUser(null);

  if (booting) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      <Header user={user} onLoggedOut={onLoggedOut} />
      <AppRoutes user={user} onUserUpdated={onUserUpdated} onLoggedOut={onLoggedOut} />
    </>
  );
}
