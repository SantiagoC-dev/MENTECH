import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const firebase = read('src/lib/firebase.ts');
const context = read('src/context/AuthContext.tsx');
const pages = read('src/pages/Auth.tsx');

assert.match(firebase, /initializeAuth\(app,\s*\{\s*persistence:\s*browserSessionPersistence/);
assert.doesNotMatch(firebase, /browserLocalPersistence/);
console.log('✓ Firebase usa persistencia independiente por pestaña');

assert.match(context, /signInWithEmailAndPassword\(auth/);
assert.doesNotMatch(context, /setPersistence\(auth,\s*remember/);
assert.doesNotMatch(pages, /Mantener mi sesión iniciada/);
console.log('✓ El login no vuelve a activar persistencia compartida');

assert.match(context, /sendPasswordResetEmail\(auth/);
assert.match(context, /url:\s*continueUrl/);
assert.match(context, /window\.location\.origin/);
assert.match(pages, /Esta confirmación no garantiza la entrega/);
console.log('✓ Recuperación configurada con retorno al dominio y mensaje preciso');

console.log('Revisión estática de autenticación aprobada.');
console.log('Pendiente: confirmar sesiones y correo contra Firebase desde el sitio Vercel.');
