import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { SITE } from './api.js';
import { useAuth } from './auth.jsx';
import { Alert, Button, Field } from './ui.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const [v, setV] = useState({ email: '', password: '' }), [error, setError] = useState(''), [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => { e.preventDefault(); setError(''); setLoading(true); try { await login(v.email, v.password); } catch (er) { setError(er.message); setLoading(false); } };
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-12">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <p className="flex items-center gap-2.5 font-display text-xl font-extrabold text-navy-900"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>{SITE.full}</p>
        <h1 className="mt-5 text-2xl font-extrabold">Panel de administración</h1>
        <p className="mt-1 text-[15px] text-slate-600">Ingresa con tu cuenta de administrador.</p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Alert>{error}</Alert>
          <Field label="Correo electrónico" required><input className="input" type="email" autoComplete="email" required value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label="Contraseña" required><input className="input" type="password" autoComplete="current-password" required value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
          <Button loading={loading} className="btn-primary w-full">Ingresar</Button>
        </form>
      </div>
    </div>);
}
