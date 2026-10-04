import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api, getToken, setToken } from './api.js';
import { PageLoader } from './ui.jsx';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());
  useEffect(() => {
    if (!getToken()) return;
    api('/me').then(setUser).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);
  const value = {
    user, ready,
    login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(({ token, user }) => { setToken(token); setUser(user); return user; }),
    logout: () => { setToken(null); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Solo deja pasar a cuentas con rol de administrador (el backend lo vuelve a comprobar en cada petición).
export function AdminOnly({ children }) {
  const { user, ready, logout } = useAuth();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (user.role !== 'admin') return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Lock className="h-12 w-12 text-navy-700" aria-hidden="true" />
      <p className="mt-4 font-display text-5xl font-extrabold text-brand-500">403</p>
      <h1 className="mt-2 text-2xl font-extrabold">No tienes acceso al panel</h1>
      <p className="mt-2 max-w-md text-slate-600">Esta cuenta no es de administrador.</p>
      <button className="btn-primary mt-6" onClick={logout}>Ingresar con otra cuenta</button>
    </div>);
  return children;
}
