import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { homeFor, useAuth } from './context/AuthContext';
import { Home, Directory, Help } from './pages/Public';
import { Login, Register, Forgot } from './pages/Auth';
import { PatientDashboard, ProfessionalDashboard, AdminDashboard, SessionsPage } from './pages/Dashboards';
import type { Role } from './types';

function RequireRole({role,children}:{role?:Role;children:ReactNode}){
  const {user,loading,hasFirebaseUser,error,logout}=useAuth();
  if(loading)return <div className="container centered-page"><span className="spinner"/> Comprobando sesión...</div>;
  if(!user && hasFirebaseUser) return <section className="container centered-page profile-error"><div className="panel"><h2>Tu cuenta necesita atención</h2><p>{error||"No se encontró el perfil en Firestore."}</p><button className="btn btn-primary" onClick={()=>void logout()}>Cerrar sesión y volver</button></div></section>;
  if(!user)return <Navigate to="/login" replace/>;
  if(role && user.role!==role)return <Navigate to={homeFor(user.role)} replace/>;
  return <>{children}</>;
}
function Guest({children}:{children:ReactNode}){const {user,loading,hasFirebaseUser,error,logout}=useAuth();if(loading)return <div className="centered-page"><span className="spinner"/></div>;if(user)return <Navigate to={homeFor(user.role)} replace/>;if(hasFirebaseUser)return <section className="container centered-page profile-error"><div className="panel"><h2>Falta completar tu perfil</h2><p>{error||"Comprueba el perfil asociado a esta cuenta en Firestore."}</p><button className="btn btn-primary" onClick={()=>void logout()}>Cerrar sesión y volver</button></div></section>;return <>{children}</>;}
function Missing(){return <section className="container empty-page"><span className="pill">404</span><h1>Esta página no existe.</h1><p>Regresemos a un lugar familiar.</p><a className="btn btn-primary" href="/">Volver al inicio</a></section>;}
export default function App(){return <Routes><Route element={<Shell/>}>
  <Route path="/" element={<Home/>}/>
  <Route path="/especialistas" element={<Directory/>}/>
  <Route path="/ayuda" element={<Help/>}/>
  <Route path="/login" element={<Guest><Login/></Guest>}/>
  <Route path="/registro" element={<Guest><Register/></Guest>}/>
  <Route path="/recuperar" element={<Guest><Forgot/></Guest>}/>
  <Route path="/paciente" element={<RequireRole role="patient"><PatientDashboard/></RequireRole>}/>
  <Route path="/profesional" element={<RequireRole role="professional"><ProfessionalDashboard/></RequireRole>}/>
  <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard/></RequireRole>}/>
  <Route path="/sesiones" element={<RequireRole><SessionsPage/></RequireRole>}/>
  <Route path="*" element={<Missing/>}/>
</Route></Routes>;}
