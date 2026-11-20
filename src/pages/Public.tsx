import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Heart, BrainCircuit, CalendarDays, ShieldCheck, Search, HeartHandshake, MessageCircleHeart, ChevronRight, PhoneCall, Clock3, LockKeyhole, Check, X, AlertTriangle, BookHeart, CircleHelp, ArrowUpRight, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Banner, SpecialistCard, useFeedback } from '../components/Shared';
import { bookAppointment, watchProfessionals } from '../lib/repository';
import { money, topics } from '../lib/catalog';
import type { Specialist } from '../types';

const initialsDecor = [{letter:'S',color:'lavender'},{letter:'A',color:'peach'},{letter:'M',color:'mint'}];
function useSpecialists(){const [pros,setPros]=useState<Specialist[]>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);useEffect(()=>watchProfessionals(items=>{setPros(items);setLoading(false);},message=>{setError(message);setLoading(false);}),[]);return {pros,error,loading};}
export function Home(){
  const navigate=useNavigate();const {pros,loading,error}=useSpecialists();
  const [search,setSearch]=useState('');
  const top=pros.slice(0,3);
  return <>
    <section className="hero-section"><div className="container hero-grid">
      <div className="hero-copy">
        <h1>Cuidar de tu mente también es <em>cuidar de ti.</em></h1>
        <p>Encuentra acompañamiento profesional según lo que necesitas. Conectar con ayuda puede ser el primer paso.</p>
        <form className="hero-search" onSubmit={e=>{e.preventDefault();navigate('/especialistas?q='+encodeURIComponent(search));}}>
          <Search size={19}/><input aria-label="Buscar especialidad" value={search} onChange={e=>setSearch(e.target.value)} placeholder="¿En qué podemos acompañarte?"/><button type="submit">Buscar <ArrowRight size={18}/></button>
        </form>
        {error&&<Banner kind="error" message={error}/>}
        <div className="hero-proof"><span className="avatar-stack">{initialsDecor.map((x,i)=><span className={`stack-dot stack-${x.color}`} key={i}>{x.letter}</span>)}</span><span>Explora perfiles y elige a tu ritmo.<br/><strong>Proyecto escolar · sin consultas reales</strong></span></div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="hero-scene"><div className="hero-big-circle"/><div className="hero-outline-circle"/><div className="hero-person"><div className="person-face"><div className="person-hair"/><div className="person-head"><span className="eyes">•　•</span><span className="smile">⌣</span></div><div className="person-neck"/></div><div className="person-body"/></div>
        <div className="floating-card floating-upper"><div className="float-icon"><Heart size={20} fill="currentColor"/></div><div><strong>Tu bienestar importa</strong><span>Un día a la vez ✨</span></div></div>
        <div className="floating-card floating-lower"><div className="float-icon green"><Check size={20}/></div><div><strong>Acompañamiento</strong><span>A tu propio ritmo</span></div></div>
        <div className="sparkle sparkle-one">✦</div><div className="sparkle sparkle-two">✦</div>
      </div></div>
    </div></section>
    <section className="trust-strip"><div className="container trust-items"><span><HeartHandshake size={20}/> Tu espacio, tu ritmo</span><span><ShieldCheck size={20}/> Perfiles y permisos por rol</span><span><CalendarDays size={20}/> Solicitud de citas</span><span><LockKeyhole size={20}/> Acceso con autenticación</span></div></section>
    <section className="section container"><div className="section-heading"><div><span className="section-kicker">EMPIEZA POR AQUÍ</span><h2>¿Cómo podemos ayudarte?</h2><p>Selecciona un tema y descubre profesionales relacionados.</p></div></div>
      <div className="topic-grid">{[
        {icon:<BrainCircuit/>,title:'Ansiedad y estrés',sub:'Encuentra herramientas para tu día a día.',shade:'topic-purple'},
        {icon:<Heart/>,title:'Duelo y pérdidas',sub:'Acompañamiento en momentos de cambio.',shade:'topic-pink'},
        {icon:<MessageCircleHeart/>,title:'Depresión y bienestar',sub:'Un espacio para hablar y pedir apoyo.',shade:'topic-blue'},
        {icon:<BookHeart/>,title:'Autoestima y relaciones',sub:'Fortalece tu relación contigo y otros.',shade:'topic-green'}].map((t)=><button key={t.title} className={`topic-card ${t.shade}`} onClick={()=>navigate('/especialistas?tema='+encodeURIComponent(t.title))}><span className="topic-icon">{t.icon}</span><strong>{t.title}</strong><small>{t.sub}</small><span className="topic-arrow"><ArrowUpRight size={18}/></span></button>)}</div>
    </section>
    <section className="section section-alt"><div className="container"><div className="section-heading between"><div><span className="section-kicker">CONOCE A QUIEN PUEDE AYUDARTE</span><h2>Encuentra tu mejor conexión</h2><p>Los profesionales aprobados aparecen aquí automáticamente al registrarse y verificarse.</p></div><Link className="text-link" to="/especialistas">Ver todos <ArrowRight size={18}/></Link></div><div className="specialist-grid">{top.map(pro=><SpecialistCard key={pro.id} pro={pro} onChoose={()=>navigate('/especialistas')}/>)}</div>{loading&&<div className="empty-state"><span className="spinner"/> Cargando especialistas...</div>}{!loading&&top.length===0&&<div className="empty-state"><h3>Aún no hay especialistas disponibles</h3><p>Los perfiles aprobados aparecerán aquí automáticamente.</p><Link className="btn btn-outline" to="/registro">Crear cuenta profesional</Link></div>}</div></section>
    <section className="section container"><div className="steps-head"><span className="section-kicker">SIMPLE Y A TU RITMO</span><h2>Tres pasos para comenzar</h2></div><div className="steps-grid">{[
      {n:'01',icon:<Search/>,title:'Explora',desc:'Filtra por tema y encuentra a quien se adapte a tus necesidades.'},
      {n:'02',icon:<HeartHandshake/>,title:'Conecta',desc:'Consulta perfiles, especialidades y costos antes de elegir.'},
      {n:'03',icon:<CalendarDays/>,title:'Solicita una cita',desc:'Escoge una fecha y revisa el estado desde tu panel personal.'}].map(s=><div className="step-card" key={s.n}><span className="step-number">{s.n}</span><div className="step-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p></div>)}</div></section>
    <section className="container"><div className="help-cta"><div><span className="eyebrow light"><Heart size={15}/> No estás solo/a</span><h2>¿Necesitas ayuda inmediata?</h2><p>En situaciones de crisis no necesitas esperar una cita. Encuentra recursos públicos y gratuitos.</p><Link className="btn btn-white" to="/ayuda">Ver recursos de ayuda <ArrowRight size={18}/></Link></div><div className="cta-illustration"><HeartHandshake size={120} strokeWidth={1.1}/></div></div></section>
  </>;
}

function BookingDialog({pro,onClose,onBooked}:{pro:Specialist,onClose:()=>void,onBooked:()=>void}){
  const {user}=useAuth();const [date,setDate]=useState('');const [time,setTime]=useState('10:00');const [topic,setTopic]=useState(pro.specialty);const [working,setWorking]=useState(false);const {feedback,failure}=useFeedback();
  const now=new Date(); const earliest=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const submit=async(e:FormEvent)=>{e.preventDefault();if(!user)return;setWorking(true);try{await bookAppointment(user,pro,topic,date,time);onBooked();}catch(err){failure(err);}finally{setWorking(false);}};
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div role="dialog" aria-modal="true" aria-labelledby="booking-title" className="dialog"><button onClick={onClose} className="dialog-close icon-button" aria-label="Cerrar"><X size={20}/></button><span className="section-kicker">SOLICITAR UNA CITA</span><h2 id="booking-title">Da el siguiente paso</h2><div className="booking-pro"><Avatar person={pro}/><div><strong>{pro.name}</strong><small>{pro.specialty} · {money(pro.fee)}</small></div></div><form onSubmit={submit} className="form-stack">
    <label>Motivo principal <select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.filter(t=>t!=='Todas las especialidades').map(t=><option key={t}>{t}</option>)}</select></label>
    <div className="two-cols"><label>Fecha deseada <input type="date" required min={earliest} value={date} onChange={e=>setDate(e.target.value)}/></label><label>Horario <select value={time} onChange={e=>setTime(e.target.value)}>{['09:00','10:00','11:00','12:00','16:00','17:00','18:00'].map(t=><option key={t}>{t}</option>)}</select></label></div>
    <div className="inline-note"><Clock3 size={16}/> La solicitud se guarda en Firestore. MENTECH no procesa pagos ni brinda consultas clínicas reales.</div>
    {feedback&&<Banner kind={feedback.kind} message={feedback.message}/>}
    <button className="btn btn-primary btn-block" type="submit" disabled={working}>{working?'Guardando...':'Enviar solicitud'} <ArrowRight size={17}/></button>
  </form></div></div>;
}
export function Directory(){
  const {user}=useAuth();const navigate=useNavigate();const [params]=useSearchParams();const {pros,error,loading}=useSpecialists();const [text,setText]=useState(params.get('q')||'');const [topic,setTopic]=useState(params.get('tema')||'Todas las especialidades');const [selected,setSelected]=useState<Specialist|null>(null);const {feedback,success,failure,clear}=useFeedback();
  const filtered=useMemo(()=>pros.filter(p=>{const query=text.toLocaleLowerCase('es');return (topic==='Todas las especialidades'||p.specialty===topic)&&`${p.name} ${p.specialty} ${p.bio}`.toLocaleLowerCase('es').includes(query);}),[pros,text,topic]);
  const choose=(p:Specialist)=>{clear();if(!user){navigate('/login');return;}if(user.role!=='patient'){failure('Inicia sesión como paciente para solicitar una cita.');return;}setSelected(p);};
  return <section className="container directory-page"><div className="page-intro"><span className="section-kicker">EXPLORA MENTECH</span><h1>Encuentra al especialista <em>para ti.</em></h1><p>Conoce a profesionales por área de atención y solicita una cita desde tu cuenta.</p></div>
    {error&&<Banner kind="error" message={error}/>}{feedback&&<Banner kind={feedback.kind} message={feedback.message} onClose={clear}/>}
    <div className="filter-panel"><label className="search-field"><Search size={20}/><input value={text} onChange={e=>setText(e.target.value)} placeholder="Nombre o especialidad" aria-label="Buscar profesionales"/></label><label className="select-wrap"><Filter size={18}/><select aria-label="Filtrar por especialidad" value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(t=><option key={t}>{t}</option>)}</select></label></div>
    <div className="results-title"><strong>{loading?'Cargando especialistas...':`${filtered.length} especialistas encontrados`}</strong><span>Perfiles aprobados, registrados en Firestore</span></div>
    <div className="specialist-grid">{filtered.map(p=><SpecialistCard key={p.id} pro={p} onChoose={choose}/>)}</div>
    {!loading&&!filtered.length&&<div className="empty-state"><Search size={40}/><h3>No encontramos coincidencias</h3><p>Prueba otro filtro. Si no hay profesionales aprobados, crea uno y verifícalo desde el administrador.</p><button className="btn btn-outline" onClick={()=>{setText('');setTopic(topics[0]);}}>Mostrar todos</button></div>}
    {selected&&<BookingDialog pro={selected} onClose={()=>setSelected(null)} onBooked={()=>{setSelected(null);success('¡Solicitud registrada! Consulta el estado desde Mi panel.');}}/>}
  </section>;
}
export function Help(){const [open,setOpen]=useState<number|null>(0);const faqs=[
  {q:'¿MENTECH ofrece atención psicológica real?',a:'No. MENTECH es un proyecto académico. Los perfiles y solicitudes se guardan en Firebase, pero no brindamos consultas clínicas.'},
  {q:'¿Qué hago ante una emergencia de salud mental?',a:'Si hay riesgo inmediato, llama al 911 o busca servicios de urgencias. La plataforma no monitorea emergencias.'},
  {q:'¿Necesito una cuenta para consultar los recursos?',a:'No. El centro de ayuda es público, gratuito y accesible sin iniciar sesión.'},
  {q:'¿Se realizan cobros en la plataforma?',a:'No. Los precios de perfiles son cifras ilustrativas. No se procesan pagos reales.'}
];return <section className="container help-page"><div className="page-intro"><span className="section-kicker">CENTRO DE AYUDA</span><h1>Siempre hay un <em>siguiente paso.</em></h1><p>Si sientes que necesitas apoyo inmediato, puedes comunicarte con los recursos públicos disponibles en México.</p></div>
  <div className="urgent-banner"><AlertTriangle size={25}/><div><strong>¿Tú o alguien más está en peligro inmediato?</strong><p>No esperes una cita en MENTECH. Comunícate directamente con emergencias.</p></div><a href="tel:911" className="btn btn-danger"><PhoneCall size={17}/> Llamar al 911</a></div>
  <div className="help-grid"><article className="help-contact"><div className="contact-icon"><PhoneCall size={27}/></div><span className="section-kicker">EMERGENCIAS · MÉXICO</span><h2>911</h2><p>Servicios de emergencia ante situaciones de peligro inmediato.</p><a href="tel:911" className="btn btn-primary">Llamar al 911 <ArrowUpRight size={18}/></a></article><article className="help-contact"><div className="contact-icon purple"><HeartHandshake size={27}/></div><span className="section-kicker">ORIENTACIÓN GRATUITA</span><h2>Línea de la Vida</h2><p>Atención y orientación telefónica. Número en México: 800 911 2000.</p><a href="tel:8009112000" className="btn btn-outline">800 911 2000 <ArrowUpRight size={18}/></a></article></div>
  <div className="faq-block"><div><span className="section-kicker">PREGUNTAS FRECUENTES</span><h2>Resolvemos tus dudas</h2><p>Información clara sobre esta plataforma escolar.</p></div><div className="faq-list">{faqs.map((f,i)=><div className="faq-item" key={f.q}><button onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i}><span><CircleHelp size={19}/>{f.q}</span><ChevronRight className={open===i?'rotate':''} size={19}/></button>{open===i&&<p>{f.a}</p>}</div>)}</div></div>
  <div className="disclaimer-box"><ShieldCheck size={21}/><p>MENTECH no diagnostica, no ofrece intervención en crisis y no sustituye servicios de salud. No compartas datos clínicos reales en esta demostración.</p></div>
  </section>;}
