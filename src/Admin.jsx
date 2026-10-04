import { useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Award, BookOpen, ExternalLink, Eye, EyeOff, GraduationCap, LayoutDashboard, LogOut, Mail, Menu, MessageCircleQuestion, Pencil, Plus, ShoppingCart, Star, Tag, Trash2, Users, X } from 'lucide-react';
import { api, asset, fecha, money, SITE, SITE_URL } from './api.js';
import { useAuth } from './auth.jsx';
import { useLoad, LoadState, Empty, Badge, Modal, Button, Field, Alert, Stars, useToast } from './ui.jsx';
import { Cover } from './Cover.jsx';
import CourseEditor from './CourseEditor.jsx';

const NAV = [['', 'Resumen', LayoutDashboard], ['cursos', 'Cursos', BookOpen], ['compras', 'Compras', ShoppingCart], ['estudiantes', 'Estudiantes', Users], ['preguntas', 'Preguntas', MessageCircleQuestion], ['resenas', 'Reseñas', Star], ['certificados', 'Certificados', Award], ['ajustes', 'Cupones y categorías', Tag], ['mensajes', 'Mensajes', Mail]];

export default function Admin() {
  const { user, logout } = useAuth(), nav = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-navy-900 px-4 text-white lg:hidden">
        <b className="font-display">Panel · {SITE.full}</b>
        <button onClick={() => setOpen(!open)} aria-label="Menú" aria-expanded={open} className="rounded-lg p-2 hover:bg-white/10">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} fixed inset-x-0 bottom-0 top-14 z-30 overflow-y-auto bg-navy-900 p-4 text-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0`}>
        <p className="hidden px-2 pb-4 font-display text-lg font-extrabold lg:block">{SITE.full}<span className="block font-sans text-xs font-medium text-navy-200">Panel de administración</span></p>
        <nav className="space-y-1" aria-label="Administración">
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={`/${to}`} end={!to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold ${isActive ? 'bg-brand-500 text-white' : 'text-navy-100 hover:bg-white/10'}`}><Icon className="h-4 w-4" />{label}</NavLink>))}
        </nav>
        <div className="mt-6 space-y-1 border-t border-white/10 pt-4 text-sm">
          <p className="px-3 text-navy-200">{user.name}</p>
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-navy-100 hover:bg-white/10"><ExternalLink className="h-4 w-4" />Ver el sitio</a>
          <button onClick={() => { logout(); nav('/'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-navy-100 hover:bg-white/10"><LogOut className="h-4 w-4" />Cerrar sesión</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route index element={<Summary />} />
          <Route path="cursos" element={<Courses />} />
          <Route path="cursos/:id" element={<CourseEditor />} />
          <Route path="compras" element={<Orders />} />
          <Route path="estudiantes" element={<Students />} />
          <Route path="preguntas" element={<Questions />} />
          <Route path="resenas" element={<Reviews />} />
          <Route path="certificados" element={<Certificates />} />
          <Route path="ajustes" element={<Settings />} />
          <Route path="mensajes" element={<Messages />} />
        </Routes>
      </main>
    </div>
  );
}

export const Title = ({ children, action }) => <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{children}</h1>{action}</div>;
const Table = ({ head, children }) => <div className="card overflow-x-auto"><table className="w-full min-w-[640px]"><thead><tr className="border-b border-slate-200 bg-slate-50">{head.map((h) => <th key={h} className="th">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{children}</tbody></table></div>;
// Ejecuta una acción, avisa el resultado y recarga la lista.
export function useAct(reload) {
  const toast = useToast();
  return async (fn, ok, confirm) => {
    if (confirm && !(await toast.confirm(confirm[0], confirm[1], confirm[2]))) return false;
    try { await fn(); ok && toast.ok(ok); await reload?.(); return true; } catch (e) { toast.error(e.message); return false; }
  };
}
const post = (path, body) => () => api(path, { method: 'POST', body });
const del = (path) => () => api(path, { method: 'DELETE' });

function Summary() {
  const s = useLoad('/admin/summary');
  return (<><Title>Resumen</Title>
    <LoadState s={s}>{(d) => (<>
      {d.pendingOrders > 0 && <div className="mb-5"><Alert type="info">Tienes <b>{d.pendingOrders}</b> {d.pendingOrders === 1 ? 'compra pendiente' : 'compras pendientes'} de verificar. <Link to="/compras" className="font-semibold underline">Revisar ahora</Link></Alert></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Cursos', d.courses, `${d.published} publicados`, BookOpen, 'cursos'], ['Estudiantes', d.students, `${d.enrollments} matrículas`, GraduationCap, 'estudiantes'], ['Compras', d.orders, `${money(d.income).replace('Gratis', 'S/ 0')} aprobados`, ShoppingCart, 'compras'], ['Certificados', d.certificates, 'vigentes', Award, 'certificados'], ['Preguntas sin responder', d.pendingQa, 'de estudiantes', MessageCircleQuestion, 'preguntas'], ['Mensajes', d.messages, 'de contacto', Mail, 'mensajes']].map(([label, n, sub, Icon, to]) => (
          <Link key={label} to={`/${to}`} className="card flex items-center gap-4 p-5 hover:border-brand-500">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-900"><Icon className="h-5 w-5" /></span>
            <span><span className="block text-sm text-slate-600">{label}</span><b className="block font-display text-2xl">{n}</b><span className="text-xs text-slate-500">{sub}</span></span>
          </Link>))}
      </div></>)}
    </LoadState></>);
}

function Courses() {
  const s = useLoad('/admin/courses'), act = useAct(s.reload), nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const create = async () => { setBusy(true); try { const r = await api('/admin/courses', { method: 'POST', body: { title: 'Nuevo curso', price: 0, published: false } }); nav(`/cursos/${r.id}`); } finally { setBusy(false); } };
  return (<><Title action={<Button loading={busy} onClick={create}><Plus className="h-4 w-4" />Nuevo curso</Button>}>Cursos</Title>
    <LoadState s={s}>{(list) => list.length ? (
      <Table head={['Curso', 'Categoría', 'Precio', 'Lecciones', 'Estudiantes', 'Estado', '']}>{list.map((c) => (
        <tr key={c.id}>
          <td className="td"><div className="flex items-center gap-3"><Cover src={c.image} className="h-10 w-16 shrink-0 rounded" /><span><Link to={`/cursos/${c.id}`} className="font-semibold hover:text-brand-500">{c.title}</Link>{!!c.is_demo && <span className="block text-xs text-slate-500">Demostración</span>}</span></div></td>
          <td className="td">{c.category || '—'}</td><td className="td whitespace-nowrap">{money(c.price)}</td><td className="td">{c.lessons}</td><td className="td">{c.students}</td>
          <td className="td">{c.published ? <Badge tone="aprobada">Publicado</Badge> : <Badge tone="cancelada">Oculto</Badge>}</td>
          <td className="td"><div className="flex justify-end gap-1">
            <Link to={`/cursos/${c.id}`} className="btn-outline btn-sm"><Pencil className="h-4 w-4" />Editar</Link>
            <button className="btn-outline btn-sm text-red-700" aria-label={`Eliminar ${c.title}`} onClick={() => act(del(`/admin/courses/${c.id}`), 'Curso eliminado.', ['Eliminar curso', `Se eliminará "${c.title}" con todos sus módulos, lecciones y videos. Esta acción no se puede deshacer.`, 'Sí, eliminar'])}><Trash2 className="h-4 w-4" /></button>
          </div></td>
        </tr>))}</Table>
    ) : <Empty icon={BookOpen} title="Aún no hay cursos">Crea tu primer curso con el botón "Nuevo curso".</Empty>}</LoadState></>);
}

const METHOD = { yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia', gratis: 'Sin costo' };
function Orders() {
  const [status, setStatus] = useState('pendiente');
  const s = useLoad(`/admin/orders${status ? `?status=${status}` : ''}`), act = useAct(s.reload);
  const [reject, setReject] = useState(null), [note, setNote] = useState('');
  return (<><Title>Compras</Title>
    <div className="mb-4 flex flex-wrap gap-2">{[['pendiente', 'Pendientes'], ['aprobada', 'Aprobadas'], ['rechazada', 'Rechazadas'], ['cancelada', 'Canceladas'], ['', 'Todas']].map(([v, l]) => <button key={v} onClick={() => setStatus(v)} className={`btn btn-sm ${status === v ? 'bg-navy-900 text-white' : 'bg-white text-ink hover:bg-navy-50'}`}>{l}</button>)}</div>
    <LoadState s={s}>{(list) => list.length ? (
      <Table head={['Pedido', 'Estudiante', 'Curso', 'Total', 'Pago', 'Estado', '']}>{list.map((o) => (
        <tr key={o.id}>
          <td className="td whitespace-nowrap"><b>{o.code}</b><span className="block text-xs text-slate-500">{fecha(o.created_at)}</span></td>
          <td className="td">{o.student}<span className="block text-xs text-slate-500">{o.email}</span></td>
          <td className="td">{o.course}</td>
          <td className="td whitespace-nowrap font-semibold">{money(o.total)}{o.coupon_code && <span className="block text-xs font-normal text-slate-500">Cupón {o.coupon_code}</span>}</td>
          <td className="td">{METHOD[o.method] || o.method}{o.operation_ref && <span className="block text-xs text-slate-500">Op. {o.operation_ref}</span>}{o.voucher && <a href={asset(o.voucher)} target="_blank" rel="noreferrer" className="block text-xs font-semibold text-navy-700 underline">Ver comprobante</a>}</td>
          <td className="td"><Badge tone={o.status}>{o.status}</Badge>{o.note && <span className="block max-w-[160px] text-xs text-slate-500">{o.note}</span>}</td>
          <td className="td">{o.status === 'pendiente' && <div className="flex justify-end gap-1">
            <button className="btn-navy btn-sm" onClick={() => act(post(`/admin/orders/${o.id}/approve`), 'Compra aprobada: el estudiante ya tiene acceso al curso.', ['Aprobar compra', `Confirma que recibiste ${money(o.total)} de ${o.student}. Se le dará acceso al curso.`, 'Sí, aprobar'])}>Aprobar</button>
            <button className="btn-outline btn-sm text-red-700" onClick={() => { setReject(o); setNote(''); }}>Rechazar</button></div>}</td>
        </tr>))}</Table>
    ) : <Empty icon={ShoppingCart} title="No hay compras en esta lista" />}</LoadState>
    {reject && <Modal title={`Rechazar pedido ${reject.code}`} onClose={() => setReject(null)}>
      <Field label="Motivo (lo verá el estudiante)"><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: No encontramos el pago con ese número de operación." /></Field>
      <div className="mt-4 flex justify-end gap-2"><button className="btn-outline" onClick={() => setReject(null)}>Cancelar</button><button className="btn-primary" onClick={async () => { (await act(post(`/admin/orders/${reject.id}/reject`, { note }), 'Compra rechazada.')) && setReject(null); }}>Rechazar compra</button></div>
    </Modal>}</>);
}

function Students() {
  const s = useLoad('/admin/students'), courses = useLoad('/admin/courses'), act = useAct(s.reload);
  const [form, setForm] = useState(null);
  return (<><Title action={<button className="btn-primary" onClick={() => setForm({ email: '', courseId: '' })}><Plus className="h-4 w-4" />Matricular manualmente</button>}>Estudiantes</Title>
    <LoadState s={s}>{(list) => list.length ? (
      <Table head={['Estudiante', 'Registro', 'Cursos y avance']}>{list.map((u) => (
        <tr key={u.id}><td className="td"><b>{u.name}</b><span className="block text-xs text-slate-500">{u.email}{u.phone && ` · ${u.phone}`}</span></td><td className="td whitespace-nowrap">{fecha(u.created_at)}</td>
          <td className="td">{u.courses.length ? <ul className="space-y-1">{u.courses.map((c) => <li key={c.course_id} className="flex items-center gap-2"><span className="min-w-0 flex-1">{c.title}</span><b className="tabular-nums">{c.percent}%</b>
            <button aria-label="Quitar matrícula" className="rounded p-1 text-slate-400 hover:text-red-700" onClick={() => act(del(`/admin/enroll/${u.id}/${c.course_id}`), 'Matrícula retirada.', ['Quitar matrícula', `${u.name} perderá el acceso a "${c.title}".`, 'Sí, quitar'])}><X className="h-4 w-4" /></button></li>)}</ul> : <span className="text-slate-500">Sin cursos</span>}</td></tr>))}</Table>
    ) : <Empty icon={Users} title="Aún no hay estudiantes registrados" />}</LoadState>
    {form && <Modal title="Matricular manualmente" onClose={() => setForm(null)}>
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); (await act(post('/admin/enroll', form), 'Estudiante matriculado.')) && setForm(null); }}>
        <p className="text-sm text-slate-600">Da acceso a un curso sin pasar por la compra (por ejemplo, un pago recibido en persona).</p>
        <Field label="Correo del estudiante" required hint="Debe tener una cuenta registrada."><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Curso" required><select className="input" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}><option value="">Selecciona…</option>{courses.data?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>
        <button className="btn-primary w-full">Matricular</button>
      </form></Modal>}</>);
}

function Questions() {
  const s = useLoad('/admin/qa'), act = useAct(s.reload);
  const [text, setText] = useState({});
  return (<><Title>Preguntas de estudiantes</Title>
    <LoadState s={s}>{(list) => list.length ? <div className="space-y-4">{list.map((q) => (
      <article key={q.id} className="card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm text-slate-600"><b className="text-ink">{q.student}</b> · {q.course} → {q.lesson} · {fecha(q.created_at)}</p>
          <div className="flex items-center gap-2">{q.answer ? <Badge tone="aprobada">Respondida</Badge> : <Badge tone="pendiente">Pendiente</Badge>}<button aria-label="Eliminar pregunta" className="rounded p-1 text-slate-400 hover:text-red-700" onClick={() => act(del(`/admin/qa/${q.id}`), 'Pregunta eliminada.', ['Eliminar pregunta', 'Se eliminará la pregunta y su respuesta.', 'Sí, eliminar'])}><Trash2 className="h-4 w-4" /></button></div></div>
        <p className="mt-2 whitespace-pre-line text-[15px]">{q.question}</p>
        <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); act(post(`/admin/qa/${q.id}/answer`, { answer: text[q.id] ?? q.answer }), 'Respuesta publicada.'); }}>
          <textarea className="input min-h-[44px] flex-1" rows={2} aria-label="Respuesta" placeholder="Escribe la respuesta…" value={text[q.id] ?? q.answer ?? ''} onChange={(e) => setText({ ...text, [q.id]: e.target.value })} />
          <button className="btn-navy btn-sm self-start">{q.answer ? 'Actualizar' : 'Responder'}</button></form>
      </article>))}</div> : <Empty icon={MessageCircleQuestion} title="No hay preguntas todavía" />}</LoadState></>);
}

function Reviews() {
  const s = useLoad('/admin/reviews'), act = useAct(s.reload);
  return (<><Title>Reseñas</Title>
    <LoadState s={s}>{(list) => list.length ? (
      <Table head={['Estudiante', 'Curso', 'Reseña', 'Estado', '']}>{list.map((r) => (
        <tr key={r.id} className={r.hidden ? 'bg-slate-50 text-slate-500' : ''}><td className="td">{r.student}<span className="block text-xs text-slate-500">{fecha(r.created_at)}</span></td><td className="td">{r.course}</td>
          <td className="td"><Stars value={r.rating} /><p className="max-w-sm">{r.comment}</p></td><td className="td">{r.hidden ? <Badge tone="cancelada">Oculta</Badge> : <Badge tone="aprobada">Visible</Badge>}</td>
          <td className="td"><div className="flex justify-end gap-1"><button className="btn-outline btn-sm" onClick={() => act(post(`/admin/reviews/${r.id}/toggle`), r.hidden ? 'Reseña visible.' : 'Reseña oculta.')}>{r.hidden ? <><Eye className="h-4 w-4" />Mostrar</> : <><EyeOff className="h-4 w-4" />Ocultar</>}</button>
            <button className="btn-outline btn-sm text-red-700" aria-label="Eliminar reseña" onClick={() => act(del(`/admin/reviews/${r.id}`), 'Reseña eliminada.', ['Eliminar reseña', 'La reseña se eliminará definitivamente.', 'Sí, eliminar'])}><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</Table>
    ) : <Empty icon={Star} title="Aún no hay reseñas" />}</LoadState></>);
}

function Certificates() {
  const s = useLoad('/admin/certificates'), act = useAct(s.reload);
  return (<><Title>Certificados</Title>
    <p className="-mt-3 mb-5 text-sm text-slate-600">Se emiten automáticamente cuando el estudiante completa todas las lecciones y aprueba el examen.</p>
    <LoadState s={s}>{(list) => list.length ? (
      <Table head={['Código', 'Estudiante', 'Curso', 'Emisión', 'Estado', '']}>{list.map((c) => (
        <tr key={c.id}><td className="td whitespace-nowrap font-semibold tabular-nums">{c.code}</td><td className="td">{c.student_name}<span className="block text-xs text-slate-500">{c.email}</span></td><td className="td">{c.course}</td><td className="td whitespace-nowrap">{fecha(c.issued_at)}</td>
          <td className="td">{c.revoked ? <Badge tone="rechazada">Anulado</Badge> : <Badge tone="aprobada">Vigente</Badge>}</td>
          <td className="td"><div className="flex justify-end gap-1"><a className="btn-outline btn-sm" href={asset(`/api/certificates/${c.code}/pdf`)} target="_blank" rel="noreferrer">PDF</a>
            <button className="btn-outline btn-sm" onClick={() => act(post(`/admin/certificates/${c.id}/toggle`), c.revoked ? 'Certificado restaurado.' : 'Certificado anulado.', c.revoked ? null : ['Anular certificado', `La página de verificación mostrará que el certificado ${c.code} ya no está vigente.`, 'Sí, anular'])}>{c.revoked ? 'Restaurar' : 'Anular'}</button></div></td></tr>))}</Table>
    ) : <Empty icon={Award} title="Aún no se han emitido certificados" />}</LoadState></>);
}

function Settings() {
  const cats = useLoad('/categories'), coupons = useLoad('/admin/coupons'), config = useLoad('/config');
  const actC = useAct(cats.reload), actK = useAct(coupons.reload);
  const [cat, setCat] = useState(''), [k, setK] = useState({ code: '', percent: 10 });
  return (<><Title>Cupones y categorías</Title>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="card p-5"><h2 className="text-lg font-bold">Categorías</h2>
        <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); (await actC(post('/admin/categories', { name: cat }), 'Categoría creada.')) && setCat(''); }}><input className="input" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Nueva categoría" aria-label="Nueva categoría" required /><button className="btn-navy">Agregar</button></form>
        <ul className="mt-4 divide-y divide-slate-100">{cats.data?.map((c) => <li key={c.id} className="flex items-center justify-between gap-2 py-2.5 text-[15px]"><span>{c.name} <span className="text-sm text-slate-500">· {c.courses} publicados</span></span><button aria-label={`Eliminar ${c.name}`} className="rounded p-1.5 text-slate-400 hover:text-red-700" onClick={() => actC(del(`/admin/categories/${c.id}`), 'Categoría eliminada.', ['Eliminar categoría', `¿Eliminar "${c.name}"?`, 'Sí, eliminar'])}><Trash2 className="h-4 w-4" /></button></li>)}</ul></section>
      <section className="card p-5"><h2 className="text-lg font-bold">Cupones de descuento</h2>
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); (await actK(post('/admin/coupons', k), 'Cupón creado.')) && setK({ code: '', percent: 10 }); }}>
          <input className="input min-w-0 flex-1 uppercase" value={k.code} onChange={(e) => setK({ ...k, code: e.target.value })} placeholder="CÓDIGO" aria-label="Código" required />
          <div className="flex items-center gap-1"><input className="input w-20" type="number" min="1" max="100" value={k.percent} onChange={(e) => setK({ ...k, percent: e.target.value })} aria-label="Porcentaje" required /><span>%</span></div><button className="btn-navy">Crear</button></form>
        <ul className="mt-4 divide-y divide-slate-100">{coupons.data?.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[15px]"><span><b className="tabular-nums">{c.code}</b> · {c.percent}% <span className="text-sm text-slate-500">· {c.uses} usos</span></span>
          <span className="flex items-center gap-1"><button className="btn-outline btn-sm" onClick={() => actK(post(`/admin/coupons/${c.id}/toggle`))}>{c.active ? 'Desactivar' : 'Activar'}</button><button aria-label={`Eliminar ${c.code}`} className="rounded p-1.5 text-slate-400 hover:text-red-700" onClick={() => actK(del(`/admin/coupons/${c.id}`), 'Cupón eliminado.', ['Eliminar cupón', `¿Eliminar el cupón ${c.code}?`, 'Sí, eliminar'])}><Trash2 className="h-4 w-4" /></button></span></li>)}</ul>
        <p className="mt-3 text-xs text-slate-500">DEMO100 es un cupón de prueba (100 %). Elimínalo antes de publicar el sitio.</p></section>
      <section className="card p-5 xl:col-span-2"><h2 className="text-lg font-bold">Métodos de pago activos</h2>
        <p className="mt-1 text-sm text-slate-600">Se configuran en el archivo <code className="rounded bg-slate-100 px-1">backend/.env</code>.</p>
        <ul className="mt-3 space-y-1 text-[15px]">{config.data?.methods.map((m) => <li key={m.id}><b>{m.name}:</b> {m.number || `${m.bank} ${m.account}`} · {m.holder}</li>)}{config.data && !config.data.methods.length && <li className="text-red-700">No hay métodos configurados: nadie podrá comprar.</li>}
          <li className="text-slate-500"><b>Tarjeta:</b> no disponible (requiere contratar una pasarela como Culqi, Izipay o Mercado Pago).</li>
          <li className="text-slate-500"><b>Correo:</b> {config.data?.mail ? 'SMTP configurado.' : 'sin SMTP; los correos se muestran en la consola del servidor.'}</li></ul></section>
    </div></>);
}

function Messages() {
  const s = useLoad('/admin/messages'), act = useAct(s.reload);
  return (<><Title>Mensajes de contacto</Title>
    <LoadState s={s}>{(list) => list.length ? <div className="space-y-3">{list.map((m) => (
      <article key={m.id} className="card p-4"><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span><b>{m.name}</b> · <a className="text-navy-700 underline" href={`mailto:${m.email}`}>{m.email}</a> · {fecha(m.created_at)}</span>
        <button aria-label="Eliminar mensaje" className="rounded p-1 text-slate-400 hover:text-red-700" onClick={() => act(del(`/admin/messages/${m.id}`), 'Mensaje eliminado.', ['Eliminar mensaje', '¿Eliminar este mensaje?', 'Sí, eliminar'])}><Trash2 className="h-4 w-4" /></button></div>
        <p className="mt-2 whitespace-pre-line text-[15px]">{m.message}</p></article>))}</div> : <Empty icon={Mail} title="No hay mensajes" />}</LoadState></>);
}
