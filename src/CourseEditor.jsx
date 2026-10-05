import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, FileText, HelpCircle, Pencil, PlayCircle, Plus, Trash2, Upload, X } from 'lucide-react';
import { api, asset, SITE_URL, upload } from './api.js';
import { useLoad, LoadState, Modal, Button, Field, Alert, Badge, useToast } from './ui.jsx';
import { Cover } from './Cover.jsx';
import { Title, useAct } from './Admin.jsx';

const ICON = { video: PlayCircle, texto: FileText, cuestionario: HelpCircle };
const TYPE = { video: 'Video', texto: 'Lectura', cuestionario: 'Cuestionario' };

export default function CourseEditor() {
  const { id } = useParams();
  const s = useLoad(`/admin/courses/${id}`);
  return <LoadState s={s}>{(c) => (<>
    <Link to="/cursos" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline"><ArrowLeft className="h-4 w-4" />Todos los cursos</Link>
    <Title action={<a href={`${SITE_URL}/cursos/${c.slug}`} target="_blank" rel="noreferrer" className="btn-outline btn-sm"><ExternalLink className="h-4 w-4" />Ver página del curso</a>}>{c.title} {c.published ? <Badge tone="aprobada">Publicado</Badge> : <Badge tone="cancelada">Oculto</Badge>}</Title>
    <div className="grid gap-6 2xl:grid-cols-2">
      <Info key={c.id} course={c} reload={s.reload} />
      <Curriculum course={c} reload={s.reload} />
    </div></>)}</LoadState>;
}

function FileButton({ kind, accept, onDone, children }) {
  const [pct, setPct] = useState(null), toast = useToast();
  const pick = async (e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    setPct(0);
    try { onDone(await upload(kind, file, setPct)); } catch (er) { toast.error(er.message); } finally { setPct(null); }
  };
  return (
    <label className={`btn-outline btn-sm cursor-pointer ${pct !== null ? 'pointer-events-none opacity-70' : ''}`}>
      <Upload className="h-4 w-4" />{pct !== null ? `Subiendo… ${pct}%` : children}
      <input type="file" accept={accept} className="sr-only" onChange={pick} disabled={pct !== null} />
    </label>);
}

function Info({ course, reload }) {
  const cats = useLoad('/categories'), toast = useToast();
  const [v, setV] = useState({ ...course, requirements: course.requirements.join('\n'), learn: course.learn.join('\n'), includes: course.includes.join('\n'), category_id: course.category_id || '', old_price: course.old_price || '' });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const bind = (k) => ({ value: v[k] ?? '', onChange: (e) => setV({ ...v, [k]: e.target.value }) });
  const save = async (e, extra = {}) => {
    e?.preventDefault(); setError(''); setBusy(true);
    try { await api(`/admin/courses/${course.id}`, { method: 'PUT', body: { ...v, ...extra } }); setV((x) => ({ ...x, ...extra })); toast.ok('Curso guardado.'); await reload(); } catch (er) { setError(er.message); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">Información del curso</h2>
      <Field label="Título" required><input className="input" required {...bind('title')} /></Field>
      <Field label="Descripción corta" hint="Aparece en la tarjeta del catálogo."><input className="input" maxLength={200} {...bind('short_desc')} /></Field>
      <Field label="Descripción completa"><textarea className="input min-h-[120px]" {...bind('description')} /></Field>
      <div>
        <span className="label">Imagen de portada</span>
        <div className="flex flex-wrap items-center gap-3"><Cover src={v.image} className="h-20 w-32 rounded-lg" alt="Portada actual" />
          <FileButton kind="image" accept="image/*" onDone={(r) => setV((x) => ({ ...x, image: r.url }))}>Subir imagen</FileButton>
          {v.image && <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => setV({ ...v, image: '' })}>Quitar</button>}</div>
        <p className="mt-1 text-xs text-slate-500">Recomendado: 1280 × 800 px, JPG o WEBP de menos de 300 KB.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Precio (S/)" required hint="Usa 0 para un curso gratuito."><input className="input" type="number" min="0" step="0.01" required {...bind('price')} /></Field>
        <Field label="Precio anterior (S/)" hint="Opcional: se muestra tachado."><input className="input" type="number" min="0" step="0.01" {...bind('old_price')} /></Field>
        <Field label="Categoría"><select className="input" {...bind('category_id')}><option value="">Sin categoría</option>{cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Nivel"><select className="input" {...bind('level')}>{['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'].map((l) => <option key={l}>{l}</option>)}</select></Field>
        <Field label="Duración (horas)"><input className="input" type="number" min="0" step="0.5" {...bind('duration_hours')} /></Field>
        <Field label="Idioma"><input className="input" {...bind('language')} /></Field>
        <Field label="Instructor"><input className="input" {...bind('instructor')} /></Field>
        <Field label="Cargo del instructor"><input className="input" {...bind('instructor_title')} /></Field>
      </div>
      <Field label="Lo que aprenderá el estudiante" hint="Una línea por punto."><textarea className="input min-h-[90px]" {...bind('learn')} /></Field>
      <Field label="Requisitos" hint="Una línea por punto."><textarea className="input min-h-[70px]" {...bind('requirements')} /></Field>
      <Field label="Qué incluye" hint="Una línea por punto."><textarea className="input min-h-[70px]" {...bind('includes')} /></Field>
      <label className="flex items-center gap-2.5 text-[15px]"><input type="checkbox" className="h-4 w-4" checked={!!v.has_certificate} onChange={(e) => setV({ ...v, has_certificate: e.target.checked })} />Entregar certificado al completar el curso</label>
      <Alert>{error}</Alert>
      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <Button loading={busy} className="btn-primary">Guardar cambios</Button>
        <button type="button" className="btn-outline" disabled={busy} onClick={() => save(null, { published: !v.published })}>{v.published ? 'Ocultar del catálogo' : 'Guardar y publicar'}</button>
      </div>
    </form>);
}

function Curriculum({ course, reload }) {
  const act = useAct(reload);
  const [name, setName] = useState(''), [lesson, setLesson] = useState(null), [renaming, setRenaming] = useState(null);
  const req = (path, method = 'POST', body) => () => api(`/admin${path}`, { method, body });
  const IconBtn = ({ label, onClick, icon: Icon, danger }) => <button type="button" aria-label={label} title={label} onClick={onClick} className={`rounded p-1.5 text-slate-500 hover:bg-slate-100 ${danger ? 'hover:text-red-700' : 'hover:text-ink'}`}><Icon className="h-4 w-4" /></button>;
  const rename = (m) => setRenaming({ id: m.id, title: m.title });
  const saveRename = async (e) => {
    e.preventDefault();
    if (await act(req(`/modules/${renaming.id}`, 'PUT', { title: renaming.title }), 'Módulo renombrado.')) setRenaming(null);
  };
  return (
    <section className="card h-fit p-5">
      <h2 className="text-lg font-bold">Temario: módulos y lecciones</h2>
      <p className="mt-1 text-sm text-slate-600">Agrega módulos y, dentro de cada uno, lecciones en video, lecturas o cuestionarios con preguntas.</p>
      <div className="mt-4 space-y-4">
        {course.modules.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 rounded-t-xl bg-slate-50 px-3 py-2"><b className="min-w-0 flex-1 text-[15px]">{m.title}</b>
              <IconBtn label="Subir módulo" icon={ArrowUp} onClick={() => act(req(`/modules/${m.id}/move`, 'POST', { dir: 'up' }))} /><IconBtn label="Bajar módulo" icon={ArrowDown} onClick={() => act(req(`/modules/${m.id}/move`, 'POST', { dir: 'down' }))} />
              <IconBtn label="Renombrar módulo" icon={Pencil} onClick={() => rename(m)} />
              <IconBtn danger label="Eliminar módulo" icon={Trash2} onClick={() => act(req(`/modules/${m.id}`, 'DELETE'), 'Módulo eliminado.', ['Eliminar módulo', `Se eliminará "${m.title}" con sus ${m.lessons.length} lecciones.`, 'Sí, eliminar'])} /></div>
            <ul className="divide-y divide-slate-100">{m.lessons.map((l) => { const Icon = ICON[l.type]; return (
              <li key={l.id} className="flex items-center gap-2 px-3 py-2 text-sm"><Icon className="h-4 w-4 shrink-0 text-slate-500" />
                <button className="min-w-0 flex-1 text-left font-medium hover:text-brand-500" onClick={() => setLesson({ ...l, module_id: m.id })}>{l.title}
                  <span className="block text-xs font-normal text-slate-500">{TYPE[l.type]}{l.type === 'video' && (l.video_url ? ' · video cargado' : ' · sin video')}{l.type === 'cuestionario' && ` · ${l.questions.length} preguntas`}{l.is_free && ' · muestra gratuita'}</span></button>
                <IconBtn label="Subir lección" icon={ArrowUp} onClick={() => act(req(`/lessons/${l.id}/move`, 'POST', { dir: 'up' }))} /><IconBtn label="Bajar lección" icon={ArrowDown} onClick={() => act(req(`/lessons/${l.id}/move`, 'POST', { dir: 'down' }))} />
                <IconBtn label="Editar lección" icon={Pencil} onClick={() => setLesson({ ...l, module_id: m.id })} />
                <IconBtn danger label="Eliminar lección" icon={Trash2} onClick={() => act(req(`/lessons/${l.id}`, 'DELETE'), 'Lección eliminada.', ['Eliminar lección', `Se eliminará "${l.title}" y el avance de los estudiantes en ella.`, 'Sí, eliminar'])} /></li>); })}</ul>
            <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3">{Object.entries(TYPE).map(([t, label]) => (
              <button key={t} className="btn-soft btn-sm" onClick={() => setLesson({ module_id: m.id, type: t, title: '', content: '', duration_min: 0, is_free: false, video_url: '', video_kind: null, resources: [], questions: [], pass_percent: 70 })}><Plus className="h-4 w-4" />{label}</button>))}</div>
          </div>))}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={async (e) => { e.preventDefault(); (await act(req(`/courses/${course.id}/modules`, 'POST', { title: name }), 'Módulo agregado.')) && setName(''); }}>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del nuevo módulo (ej.: Tema 1: Introducción)" aria-label="Nuevo módulo" required /><button className="btn-navy shrink-0"><Plus className="h-4 w-4" />Módulo</button>
      </form>
      {renaming && (
        <Modal title="Renombrar módulo" onClose={() => setRenaming(null)}>
          <form onSubmit={saveRename} className="space-y-4">
            <Field label="Nombre del módulo" required hint="Ejemplo: Tema 1: Comprensión lectora">
              <input className="input" required autoFocus maxLength={150} value={renaming.title} onFocus={(e) => e.target.select()} onChange={(e) => setRenaming({ ...renaming, title: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button type="button" className="btn-outline" onClick={() => setRenaming(null)}>Cancelar</button>
              <button className="btn-primary" disabled={!renaming.title.trim()}>Guardar nombre</button>
            </div>
          </form>
        </Modal>
      )}
      {lesson && <LessonForm initial={lesson} onClose={() => setLesson(null)} onSaved={() => { setLesson(null); reload(); }} />}
    </section>);
}

function LessonForm({ initial, onClose, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState(initial), [preview, setPreview] = useState(initial.video_preview), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(initial.video_kind === 'file' ? 'file' : 'link');
  useEffect(() => setError(''), [v]);
  const set = (k, val) => setV((x) => ({ ...x, [k]: val }));
  const setQ = (i, patch) => set('questions', v.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api(v.id ? `/admin/lessons/${v.id}` : `/admin/modules/${v.module_id}/lessons`, { method: v.id ? 'PUT' : 'POST', body: v }); toast.ok('Lección guardada.'); onSaved(); } catch (er) { setError(er.message); setBusy(false); }
  };
  return (
    <Modal wide title={`${v.id ? 'Editar' : 'Nueva'} lección · ${TYPE[v.type]}`} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Título" required><input className="input" required autoFocus value={v.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Duración (min)"><input className="input" type="number" min="0" value={v.duration_min} onChange={(e) => set('duration_min', e.target.value)} /></Field>
        </div>
        {v.type === 'video' && (
          <div className="rounded-lg border border-slate-200 p-4">
            <span className="label">Video de la lección</span>
            <div className="mb-3 flex gap-2">{[['link', 'Enlace (YouTube / Vimeo)'], ['file', 'Subir archivo']].map(([m, l]) => <button type="button" key={m} onClick={() => setMode(m)} className={`btn btn-sm ${mode === m ? 'bg-navy-900 text-white' : 'bg-slate-100'}`}>{l}</button>)}</div>
            {mode === 'link' ? (
              <Field label="Enlace del video" hint="Pega el enlace de YouTube (puede ser 'No listado') o Vimeo."><input className="input" type="url" placeholder="https://www.youtube.com/watch?v=…" value={v.video_kind === 'file' ? '' : v.video_url || ''} onChange={(e) => setV({ ...v, video_url: e.target.value.trim(), video_kind: 'enlace' })} /></Field>
            ) : (
              <div className="space-y-3">
                {v.video_kind === 'file' && v.video_url && preview && <video src={asset(preview)} controls className="aspect-video w-full max-w-md rounded-lg bg-black" />}
                <div className="flex flex-wrap items-center gap-3">
                  <FileButton kind="video" accept="video/mp4,video/webm,video/quicktime" onDone={(r) => { setV((x) => ({ ...x, video_url: r.path, video_kind: 'file' })); setPreview(r.preview); }}>{v.video_kind === 'file' && v.video_url ? 'Reemplazar video' : 'Elegir video (MP4)'}</FileButton>
                  {v.video_kind === 'file' && v.video_url && <button type="button" className="text-sm font-semibold text-red-700 hover:underline" onClick={() => setV({ ...v, video_url: '', video_kind: null })}>Quitar video</button>}
                </div>
                <p className="text-xs text-slate-500">MP4 (H.264) hasta 2 GB. Solo los estudiantes matriculados podrán verlo. Para que cargue rápido, expórtalo en 720p.</p>
              </div>)}
          </div>)}
        {v.type === 'cuestionario' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <Field label="Instrucciones"><input className="input" value={v.content} onChange={(e) => set('content', e.target.value)} /></Field>
              <Field label="Nota para aprobar (%)"><input className="input" type="number" min="1" max="100" value={v.pass_percent} onChange={(e) => set('pass_percent', e.target.value)} /></Field>
            </div>
            <div className="space-y-4">
              {v.questions.map((q, i) => (
                <fieldset key={i} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-2"><Field className="flex-1" label={`Pregunta ${i + 1}`} required><input className="input" required value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} /></Field>
                    <button type="button" aria-label="Eliminar pregunta" className="mt-8 rounded p-1.5 text-slate-400 hover:text-red-700" onClick={() => set('questions', v.questions.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button></div>
                  <p className="mb-1.5 mt-3 text-xs font-semibold text-slate-600">Opciones (marca la respuesta correcta)</p>
                  <div className="space-y-2">{q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`ok${i}`} className="h-4 w-4 accent-emerald-600" aria-label={`Opción ${oi + 1} es la correcta`} checked={q.correct_index === oi} onChange={() => setQ(i, { correct_index: oi })} />
                      <input className="input" required aria-label={`Opción ${oi + 1}`} placeholder={`Opción ${oi + 1}`} value={o} onChange={(e) => setQ(i, { options: q.options.map((x, j) => (j === oi ? e.target.value : x)) })} />
                      {q.options.length > 2 && <button type="button" aria-label="Quitar opción" className="rounded p-1.5 text-slate-400 hover:text-red-700" onClick={() => setQ(i, { options: q.options.filter((_, j) => j !== oi), correct_index: q.correct_index === oi ? 0 : q.correct_index > oi ? q.correct_index - 1 : q.correct_index })}><X className="h-4 w-4" /></button>}
                    </div>))}</div>
                  {q.options.length < 6 && <button type="button" className="mt-2 text-sm font-semibold text-navy-700 hover:underline" onClick={() => setQ(i, { options: [...q.options, ''] })}>+ Agregar opción</button>}
                </fieldset>))}
              <button type="button" className="btn-soft btn-sm" onClick={() => set('questions', [...v.questions, { text: '', options: ['', '', ''], correct_index: 0 }])}><Plus className="h-4 w-4" />Agregar pregunta</button>
            </div>
          </>
        ) : (
          <>
            <Field label={v.type === 'texto' ? 'Contenido de la lectura' : 'Descripción o notas (opcional)'}><textarea className="input min-h-[140px]" value={v.content} onChange={(e) => set('content', e.target.value)} /></Field>
            <div>
              <span className="label">Materiales descargables</span>
              <ul className="mb-2 space-y-1.5">{v.resources.map((r, i) => <li key={r.url} className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-slate-500" /><span className="min-w-0 flex-1 truncate">{r.name}</span><button type="button" aria-label={`Quitar ${r.name}`} className="rounded p-1 text-slate-400 hover:text-red-700" onClick={() => set('resources', v.resources.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button></li>)}</ul>
              <FileButton kind="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv,.png,.jpg,.jpeg" onDone={(r) => setV((x) => ({ ...x, resources: [...x.resources, r] }))}>Agregar archivo</FileButton>
            </div>
            <label className="flex items-center gap-2.5 text-[15px]"><input type="checkbox" className="h-4 w-4" checked={!!v.is_free} onChange={(e) => set('is_free', e.target.checked)} />Muestra gratuita (visible sin comprar el curso)</label>
          </>)}
        <Alert>{error}</Alert>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" className="btn-outline" onClick={onClose}>Cancelar</button><Button loading={busy} className="btn-primary">Guardar lección</Button></div>
      </form>
    </Modal>);
}