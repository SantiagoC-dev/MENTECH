import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrainCircuit, Menu, X, ArrowRight, LogOut, ShieldCheck, LifeBuoy, LayoutDashboard, CalendarDays, UsersRound } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext';
import { Banner } from './Shared';

export function Brand(){return <Link className="brand" to="/" aria-label="MENTECH, ir al inicio"><span className="brand-icon"><BrainCircuit size={23}/></span><span>MEN<span className="brand-gradient">TECH</span><small>bienestar que conecta</small></span></Link>;}
export function Shell(){
  const {user,logout,error:authWarning}=useAuth();
  const [menu,setMenu]=useState(false);
  const nav=useNavigate();
  const close=()=>setMenu(false);
  return <div className="app-shell">
    <div className="academic-bar"><span className="academic-dot"/> MENTECH · Proyecto académico · Autenticación y datos con Firebase</div>
    <header className="site-header"><div className="container header-inner">
      <Brand/>
      <button className="mobile-menu icon-button" onClick={()=>setMenu(!menu)} aria-label={menu?'Cerrar menú':'Abrir menú'}>{menu?<X size={23}/>:<Menu size={23}/>}</button>
      <nav className={`primary-nav ${menu?'open':''}`} aria-label="Menú principal">
        <NavLink onClick={close} end to="/">Inicio</NavLink>
        <NavLink onClick={close} to="/especialistas">Especialistas</NavLink>
        <NavLink onClick={close} to="/ayuda">Centro de ayuda</NavLink>
        {user?<>
          <NavLink onClick={close} to={homeFor(user.role)}><LayoutDashboard size={16}/> Mi panel</NavLink>
          <NavLink onClick={close} to="/sesiones"><UsersRound size={16}/> Sesiones</NavLink>
          <button className="nav-logout" onClick={()=>{void logout().then(()=>nav('/'));close();}}><LogOut size={17}/> Salir</button>
        </>:<><Link onClick={close} className="nav-login" to="/login">Ingresar</Link><Link onClick={close} className="btn btn-primary btn-nav" to="/registro">Crear cuenta <ArrowRight size={16}/></Link></>}
      </nav>
    </div></header>
    {user&&authWarning&&<div className="container system-auth-notice"><Banner kind="error" message={authWarning}/></div>}
    <main className="main-content"><Outlet/></main>
    <footer className="site-footer"><div className="container footer-main">
      <div className="footer-brand"><Brand/><p>Un espacio para encontrar acompañamiento y herramientas para tu bienestar.</p><span className="tiny-note"><ShieldCheck size={14}/> Proyecto escolar: datos de Firebase, sin atención clínica ni pagos reales.</span></div>
      <div className="footer-links"><strong>Explorar</strong><Link to="/especialistas"><CalendarDays size={15}/> Especialistas</Link><Link to="/ayuda"><LifeBuoy size={15}/> Recursos de ayuda</Link></div>
      <div className="footer-links"><strong>Emergencias en México</strong><a href="tel:911">911 · Emergencias</a><a href="tel:8009112000">800 911 2000 · Línea de la Vida</a><small>En peligro inmediato, llama al 911.</small></div>
    </div><div className="container footer-bottom"><span>© 2026 MENTECH · Proyecto académico</span><span>Desarrollado con React + Firebase</span></div></footer>
  </div>;
}
