import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'src/lib/repository.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(compiled.diagnostics?.length??0,0,'El repositorio no debe tener errores sintácticos de TypeScript');
const operations=[];
const store=new Map();
const firestore={
  doc:(_db,...pieces)=>pieces.join('/'),
  setDoc:async(ref,data)=>{operations.push('create');store.set(ref,data);},
  getDoc:async(ref)=>{operations.push('get');return {exists:()=>store.has(ref),data:()=>store.get(ref)};},
  updateDoc:async(ref,changes)=>{operations.push('update');if(!store.has(ref))throw Error('not-found');store.set(ref,{...store.get(ref),...changes});},
};
const context={exports:{},navigator:{userAgent:'Mozilla/5.0 (Windows NT 10.0)'},console,
  require:(name)=>name==='firebase/firestore'?firestore:name==='./firebase'?{db:{}}:require(name)};
vm.runInNewContext(compiled.outputText,context,{filename:'repository.compiled.js'});
const {startFirebaseSession}=context.exports;

await startFirebaseSession('new-session','user-1',true);
assert.deepEqual(operations,['create'],'Una sesión nueva se crea sin lectura previa');
assert.equal(store.get('sessions/new-session').userId,'user-1');
assert.equal(store.get('sessions/new-session').revoked,false);
operations.length=0;
await startFirebaseSession('new-session','user-1',false);
assert.deepEqual(operations,['get','update'],'Una sesión guardada se consulta y actualiza');
store.get('sessions/new-session').revoked=true;
operations.length=0;
await assert.rejects(startFirebaseSession('new-session','user-1',false),/ya no está disponible/);
assert.deepEqual(operations,['get'],'Una sesión revocada no se reactiva');
console.log('✓ Primera sesión: creación directa sin lecturas denegadas');
console.log('✓ Sesión anterior: lectura autorizada y actualización');
console.log('✓ Sesión revocada: no se reactiva');
