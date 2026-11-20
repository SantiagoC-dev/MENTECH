import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const required={
  'Autenticación Firebase':'src/context/AuthContext.tsx',
  'Rutas protegidas':'src/App.tsx',
  'Gestión de sesiones':'src/pages/Dashboards.tsx',
  'Recuperación de contraseña':'src/pages/Auth.tsx',
  'Reglas de Firestore':'firestore.rules',
  'Pantalla de catálogo':'src/pages/Public.tsx',
  'Variables de ejemplo':'.env.example',
  'Deployment Vercel':'vercel.json',
};
let failures=0;
for(const [name,file] of Object.entries(required)){
  const exists=fs.existsSync(path.join(root,file));
  console.log(`${exists?'✓':'✗'} ${name}: ${file}`);
  if(!exists) failures++;
}
const app=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8');
for(const route of ['/login','/registro','/recuperar','/paciente','/profesional','/admin','/sesiones']){
  const ok=app.includes(`path="${route}"`);
  console.log(`${ok?'✓':'✗'} Ruta ${route}`);
  if(!ok) failures++;
}
for(const removed of ['src/lib/demo.ts','src/lib/samples.ts','scripts/test-demo.mjs']) {
  const ok=!fs.existsSync(path.join(root,removed));
  console.log(`${ok?'✓':'✗'} Sin módulo demo: ${removed}`);
  if(!ok) failures++;
}
for(const file of ['src/context/AuthContext.tsx','src/lib/repository.ts','src/pages/Public.tsx','src/pages/Auth.tsx']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  if(source.includes('localStorage')||source.includes("../lib/demo")||source.includes("../lib/samples")){
    console.log('✗ Aún quedan referencias a almacenamiento o datos locales en',file);failures++;
  }
}
const auth=fs.readFileSync(path.join(root,'src/context/AuthContext.tsx'),'utf8');
for(const feature of ['onAuthStateChanged','onSnapshot','sendPasswordResetEmail','createUserWithEmailAndPassword','signInWithEmailAndPassword']) {
 if(!auth.includes(feature)){console.log('✗ Falta: '+feature);failures++;}
}
const rules=fs.readFileSync(path.join(root,'firestore.rules'),'utf8');
for(const pattern of ["match /users/{uid}","match /sessions/{id}","match /appointments/{id}","request.resource.data.role in ['patient','professional']", "allow delete: if false"]){
  if(!rules.includes(pattern)){console.log('✗ Falta regla:',pattern);failures++;}
}
console.log(`\nComprobaciones estáticas: ${failures?'fallaron':'correctas'}.`);
console.log('Nota: no sustituyen npm run build ni las pruebas funcionales en el navegador.');
process.exitCode=failures?1:0;
