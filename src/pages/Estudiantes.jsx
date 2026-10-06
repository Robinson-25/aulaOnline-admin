// Página "Estudiantes" del panel: buscador, filtros, orden y vista en cuadros o en lista.
import { useState } from 'react';
import { LayoutGrid, List, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { api, fecha } from '../api.js';
import { useLoad, LoadState, Empty, Modal, Field } from '../ui.jsx';
import { Title, useAct } from '../Admin.jsx';

const post = (path, body) => () => api(path, { method: 'POST', body });
const put = (path, body) => () => api(path, { method: 'PUT', body });
const del = (path) => () => api(path, { method: 'DELETE' });
const sinTildes = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const anio = (u) => String(u.created_at).slice(0, 4);
const avance = (u) => (u.courses.length ? u.courses.reduce((a, c) => a + c.percent, 0) / u.courses.length : -1);
const ORDEN = {
  recientes: ['Más recientes', (a, b) => b.id - a.id],
  antiguos: ['Más antiguos', (a, b) => a.id - b.id],
  nombre: ['Nombre A–Z', (a, b) => a.name.localeCompare(b.name, 'es')],
  avance: ['Mayor avance', (a, b) => avance(b) - avance(a)],
};

export default function Estudiantes() {
  const s = useLoad('/admin/students'), courses = useLoad('/admin/courses'), act = useAct(s.reload);
  const [form, setForm] = useState(null), [edit, setEdit] = useState(null);
  const [buscar, setBuscar] = useState(''), [year, setYear] = useState(''), [orden, setOrden] = useState('recientes'), [vista, setVista] = useState('lista');

  const Cursos = ({ u }) => u.courses.length ? <ul className="space-y-2">{u.courses.map((c) => <li key={c.course_id} className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="min-w-[9rem] flex-1">{c.title}</span>
    <span className="flex items-center gap-2" title={`Ha completado el ${c.percent}% de las lecciones`}><span className="h-2 w-20 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${c.percent}%` }} /></span><b className="whitespace-nowrap text-xs tabular-nums">{c.percent}% avance</b></span>
    <button className="whitespace-nowrap rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-700" onClick={() => act(del(`/admin/enroll/${u.id}/${c.course_id}`), 'Curso retirado.', ['Quitar curso', `${u.name} perderá el acceso a "${c.title}". Su cuenta no se elimina.`, 'Sí, quitar'])}>Quitar curso</button></li>)}</ul> : <span className="text-slate-500">Sin cursos</span>;
  const Acciones = ({ u }) => <div className="flex justify-end gap-1">
    <button className="btn-outline btn-sm" aria-label={`Editar a ${u.name}`} onClick={() => setEdit({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', password: '' })}><Pencil className="h-4 w-4" />Editar</button>
    <button className="btn-outline btn-sm text-red-700" aria-label={`Eliminar a ${u.name}`} onClick={() => act(del(`/admin/students/${u.id}`), 'Estudiante eliminado.', ['Eliminar estudiante',
      `Se eliminará la cuenta de ${u.name} (${u.email})${u.courses.length || u.orders || u.certificates ? `, junto con sus ${u.courses.length} matrícula(s), ${u.orders} compra(s) y ${u.certificates} certificado(s)` : ''}. Esta acción no se puede deshacer.`, 'Sí, eliminar'])}><Trash2 className="h-4 w-4" />Eliminar</button>
  </div>;
  const Datos = ({ u }) => <><b>{u.name}</b><span className="block break-all text-xs text-slate-500">{u.email}{u.phone && ` · ${u.phone}`}</span></>;

  return (<><Title action={<button className="btn-primary" onClick={() => setForm({ email: '', courseId: '' })}><Plus className="h-4 w-4" />Matricular manualmente</button>}>Estudiantes</Title>
    <LoadState s={s}>{(all) => {
      if (!all.length) return <Empty icon={Users} title="Aún no hay estudiantes registrados" />;
      const years = [...new Set(all.map(anio))].sort().reverse(), texto = sinTildes(buscar.trim());
      const list = all.filter((u) => (!year || anio(u) === year) && (!texto || sinTildes(`${u.name} ${u.email} ${u.phone || ''} ${u.courses.map((c) => c.title).join(' ')}`).includes(texto))).sort(ORDEN[orden][1]);
      return (<>
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <label className="relative min-w-[220px] flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input className="input pl-11" type="search" aria-label="Buscar estudiantes" placeholder="Buscar estudiantes…" value={buscar} onChange={(e) => setBuscar(e.target.value)} /></label>
          <select className="input w-auto font-semibold" aria-label="Año de registro" value={year} onChange={(e) => setYear(e.target.value)}><option value="">Todos los años</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
          <select className="input w-auto font-semibold" aria-label="Ordenar" value={orden} onChange={(e) => setOrden(e.target.value)}>{Object.entries(ORDEN).map(([k, [t]]) => <option key={k} value={k}>{t}</option>)}</select>
          <div className="flex rounded-xl border border-slate-300 p-1">{[['cuadros', LayoutGrid, 'Ver en cuadros'], ['lista', List, 'Ver en lista']].map(([k, Icon, t]) =>
            <button key={k} type="button" aria-label={t} title={t} aria-pressed={vista === k} onClick={() => setVista(k)} className={`rounded-lg p-2 ${vista === k ? 'bg-navy-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon className="h-5 w-5" /></button>)}</div>
        </div>
        <p className="mb-3 text-sm text-slate-600">{list.length} de {all.length} estudiante(s)</p>
        {!list.length ? <Empty icon={Search} title="Ningún estudiante coincide con la búsqueda" />
          : vista === 'lista' ? (
            <div className="card overflow-x-auto"><table className="w-full min-w-[640px]"><thead><tr className="border-b border-slate-200 bg-slate-50">{['Estudiante', 'Registro', 'Cursos y avance', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{list.map((u) => <tr key={u.id}><td className="td"><Datos u={u} /></td><td className="td whitespace-nowrap">{fecha(u.created_at)}</td><td className="td"><Cursos u={u} /></td><td className="td"><Acciones u={u} /></td></tr>)}</tbody></table></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((u) => <article key={u.id} className="card flex flex-col gap-3 p-4 text-sm">
              <div><Datos u={u} /><span className="mt-1 block text-xs text-slate-500">Registro: {fecha(u.created_at)}</span></div>
              <div className="flex-1 border-t border-slate-100 pt-3"><Cursos u={u} /></div><Acciones u={u} /></article>)}</div>
          )}
      </>);
    }}</LoadState>
    {edit && <Modal title="Editar estudiante" onClose={() => setEdit(null)}>
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); (await act(put(`/admin/students/${edit.id}`, edit), 'Estudiante actualizado.')) && setEdit(null); }}>
        <Field label="Nombre completo" required><input className="input" required minLength={3} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
        <Field label="Correo electrónico" required hint="Con este correo ingresa a su cuenta."><input className="input" type="email" required value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
        <Field label="Celular"><input className="input" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
        <Field label="Nueva contraseña" hint="Déjala vacía para no cambiarla. Mínimo 8 caracteres."><input className="input" type="text" minLength={8} autoComplete="off" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} /></Field>
        <button className="btn-primary w-full">Guardar cambios</button>
      </form></Modal>}
    {form && <Modal title="Matricular manualmente" onClose={() => setForm(null)}>
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); (await act(post('/admin/enroll', form), 'Estudiante matriculado.')) && setForm(null); }}>
        <p className="text-sm text-slate-600">Da acceso a un curso sin pasar por la compra (por ejemplo, un pago recibido en persona).</p>
        <Field label="Correo del estudiante" required hint="Debe tener una cuenta registrada."><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Curso" required><select className="input" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}><option value="">Selecciona…</option>{courses.data?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>
        <button className="btn-primary w-full">Matricular</button>
      </form></Modal>}</>);
}