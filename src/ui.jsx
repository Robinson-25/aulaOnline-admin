import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Inbox, Loader2, Star, X } from 'lucide-react';
import { api, onLive, LIVE_SCOPES } from './api.js';

export const Spinner = ({ className = 'h-5 w-5' }) => <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
export const PageLoader = ({ text = 'Cargando…' }) => (
  <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-500" role="status"><Spinner /> {text}</div>
);
export const Alert = ({ type = 'error', children }) =>
  children ? (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm ${type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-navy-200 bg-navy-50 text-navy-900'}`}>
      {type === 'ok' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <div className="min-w-0">{children}</div>
    </div>
  ) : null;
export const Empty = ({ title, children, icon: Icon = Inbox }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
    <Icon className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
    <p className="mt-3 font-semibold text-ink">{title}</p>
    {children && <div className="mx-auto mt-1 max-w-md text-sm text-slate-600">{children}</div>}
  </div>
);
export const Button = ({ loading, children, className = 'btn-primary', ...p }) => (
  <button className={className} disabled={loading || p.disabled} {...p}>{loading && <Spinner className="h-4 w-4" />}{children}</button>
);
export function Field({ label, hint, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}{required && <span className="text-brand-500" aria-hidden="true"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
export function Stars({ value = 0, onChange, size = 'h-4 w-4' }) {
  return (
    <span className="inline-flex gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value || 0} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const s = <Star className={`${size} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden="true" />;
        return onChange ? <button type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} estrellas`} onClick={() => onChange(n)} className="rounded p-0.5">{s}</button> : <span key={n}>{s}</span>;
      })}
    </span>
  );
}
const STATUS = { pendiente: 'bg-amber-100 text-amber-800', aprobada: 'bg-emerald-100 text-emerald-800', rechazada: 'bg-red-100 text-red-800', cancelada: 'bg-slate-200 text-slate-700' };
export const Badge = ({ children, tone }) => <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS[tone] || tone || 'bg-slate-100 text-slate-700'}`}>{children}</span>;
export const ProgressBar = ({ value }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${value}%` }} />
  </div>
);

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-md'}`}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// Avisos breves + diálogo de confirmación, disponibles en toda la aplicación.
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ask, setAsk] = useState(null);
  const n = useRef(0);
  const push = useCallback((type, text) => { const id = ++n.current; setItems((l) => [...l, { id, type, text }]); setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4500); }, []);
  const value = useRef({ ok: (t) => push('ok', t), error: (t) => push('error', t), confirm: (title, text, action = 'Sí, continuar') => new Promise((resolve) => setAsk({ title, text, action, resolve })) }).current;
  const answer = (v) => { ask.resolve(v); setAsk(null); };
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${t.type === 'ok' ? 'bg-emerald-700' : 'bg-red-700'}`}>
            {t.type === 'ok' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}{t.text}
          </div>
        ))}
      </div>
      {ask && (
        <Modal title={ask.title} onClose={() => answer(false)}>
          <p className="text-sm text-slate-600">{ask.text}</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button className="btn-outline" onClick={() => answer(false)}>Cancelar</button>
            <button className="btn-primary" autoFocus onClick={() => answer(true)}>{ask.action}</button>
          </div>
        </Modal>
      )}
    </ToastCtx.Provider>
  );
}

// Carga datos de la API con estados de carga y error.
export function useLoad(path, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const reload = useCallback(() => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    return api(path).then((data) => setState({ data, error: null, loading: false })).catch((error) => setState({ data: null, error, loading: false }));
  }, [path]);
  useEffect(() => { reload(); }, [reload, ...deps]); // eslint-disable-line
  // Actualización en vivo: cuando el backend avisa de un cambio, se vuelven a pedir los datos
  // en silencio (sin pantalla de carga). Si la pestaña está oculta, se espera a que vuelva a verse.
  useEffect(() => {
    if (!path) return;
    let timer, pending = false, alive = true;
    const refresh = () => api(path).then((data) => alive && setState({ data, error: null, loading: false })).catch(() => {});
    const off = onLive((ev) => {
      if (!LIVE_SCOPES.includes(ev.scope)) return;
      clearTimeout(timer);
      timer = setTimeout(() => { if (document.hidden) pending = true; else refresh(); }, 400);
    });
    const onVisible = () => { if (!document.hidden && pending) { pending = false; refresh(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { alive = false; off(); clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [path]);
  return { ...state, reload };
}
export const LoadState = ({ s, children }) =>
  s.loading && !s.data ? <PageLoader /> : s.error ? (
    <div className="mx-auto max-w-md py-10"><Alert>{s.error.message}</Alert><button className="btn-outline mt-3" onClick={s.reload}>Reintentar</button></div>
  ) : children(s.data);
