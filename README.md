# MENTECH | Plataforma académica conectada a Firebase

**Estado:** integración real con Firebase Authentication y Cloud Firestore; no existe modo demo ni datos precargados. Los registros se crean usando los formularios de MENTECH. La aplicación no brinda terapia real ni procesa pagos.

## Corrección del error de sesiones (noviembre de 2026)

Se corrigió el mensaje `Missing or insufficient permissions` que aparecía **después de iniciar sesión correctamente**. La causa estaba en `src/lib/repository.ts`: el primer acceso a una sesión intentaba `getDoc()` sobre un documento `sessions/{id}` inexistente. Las reglas exigían comparar el propietario del documento y denegaban la lectura. Ahora una sesión nueva se crea con `setDoc()` directamente; solamente las sesiones ya registradas se consultan y actualizan. También se evita la doble inicialización de la misma sesión durante el montaje de React en modo estricto.

**No hay que abrir permisos de Firestore ni eliminar usuarios.** Asegúrate de tener publicadas las reglas de `firestore.rules` que vienen con el proyecto. Para probar esta corrección después de `npm install`, ejecuta `npm run test:sessions` (prueba local simulada sin acceso a Firebase). Después prueba iniciar sesión desde el navegador y verificar que aparece un documento en `sessions`.

## 1. Inicio rápido en Windows (VS Code + PowerShell)

1. Descomprime `MENTECH-final-Firebase.zip` en **una carpeta nueva** (no lo mezcles con el ZIP anterior).
2. En VS Code, abre la carpeta `MENTECH` que contiene `package.json`.
3. Abre la terminal de PowerShell y ejecuta:

```powershell
npm install
npm run dev
```

4. Abre la URL de Vite (normalmente `http://localhost:5173`). **No uses el archivo HTML mediante doble clic**, porque se necesita el servidor Vite.
5. El proyecto ya tiene configurados en `src/lib/firebase.ts` los identificadores públicos de la app web Firebase `mentech-escolar`, según los datos facilitados para este trabajo. **No necesitas copiar el JavaScript de la consola a `.env.local`.**

### Importante sobre tu `.env.local` anterior

El ZIP anterior contenía un `.env.local` con un bloque `import { initializeApp } ...` copiado de la consola. **Ese formato es incorrecto para Vite**. Este nuevo ZIP no depende de ese archivo y arranca conectado a `mentech-escolar`. Si vas a reemplazar archivos dentro de la carpeta anterior en lugar de descomprimir una nueva, borra el `.env.local` mal formado o crea uno con sólo pares `VITE_FIREBASE_*=`. Las variables de `.env.local`, si las defines, tienen prioridad sobre la configuración integrada.

## 2. Firebase Console: tareas que debes realizar

**Proyecto Firebase:** `mentech-escolar`

1. **Authentication → Método de acceso:** debe estar activado **Correo electrónico/Contraseña** (ya lo activaste).
2. **Authentication → Configuración → Dominios autorizados:** `localhost` aparece autorizado en tus capturas. Para Vercel tendrás que agregar el dominio exacto de tu sitio publicado.
3. **Firestore Database → Reglas:** abre el archivo `firestore.rules` **DE ESTA VERSIÓN**, copia todo su contenido y pulsa **Publicar**. No uses las reglas antiguas ni `allow read, write: if true`.
4. **Authentication → Usuarios:** es normal que al principio esté vacío. **No necesitas usar “Agregar usuario” en la consola**. Registrarás las cuentas desde MENTECH para que también se creen sus documentos en Firestore.

La creación de usuarios agrega `users/{uid}` automáticamente. Registrar un profesional agrega además `professionals/{uid}` con estado `verified: false`. El formulario público **nunca** asigna un rol administrador.

## 3. Configurar las tres cuentas reales para la exposición

Usa **tres correos diferentes a los que tengas acceso** y contraseñas de prueba de al menos 8 caracteres. No se incluyen usuarios precreados; los datos persisten en Firestore.

### Cuenta 1: paciente

1. Desde `/registro` elige **Paciente**, escribe nombre, correo y contraseña y pulsa **Crear mi cuenta**.
2. Inmediatamente se abre `/paciente` sin actualizar la página.
3. Verifica en Firebase Console → **Authentication → Usuarios** que aparece la cuenta.
4. En Firestore → `users` verás un documento con ID igual al **UID de Authentication** y campo `role: "patient"`.
5. Usa **Salir** para registrar otra cuenta.

### Cuenta 2: profesional

1. En `/registro` elige **Profesional** y registra el segundo correo.
2. Debe abrir `/profesional` automáticamente.
3. En **Mi perfil profesional → Editar perfil**, selecciona una especialidad, escribe una descripción, años de experiencia y un precio **mayor a 0**. Guarda.
4. Hasta que el administrador lo apruebe, **no aparecerá en el directorio público**.
5. Verifica que exista `professionals/{uid}` en Firestore y cierra sesión.

### Cuenta 3: administrador

1. En `/registro` registra una tercera cuenta **como Paciente**, con el correo que usarás para mostrar administración.
2. Abre **Firestore Database → Datos → users → documento cuyo ID coincide con el UID de esa cuenta**.
3. Edita únicamente el campo `role`, de tipo **string**, y cambia `patient` a **`admin`**. Guarda.
4. El observador `onSnapshot` detecta el cambio. Si el usuario sigue conectado, debería abrir `/admin` automáticamente, sin recargar. Si no está conectado, inicia sesión normalmente.
5. El registro público no ofrece el rol `admin` porque sería inseguro.

> No registres cuentas únicamente desde el botón «Agregar usuario» de Authentication: ese botón no crea los documentos `users/{uid}` necesarios para que MENTECH conozca el rol. Si ya lo hiciste, crea manualmente el documento con los campos correctos o utiliza otra cuenta desde MENTECH.

## 4. Flujo integrado para la evaluación

1. **Admin:** en `/admin` identifica el profesional pendiente y pulsa **Verificar** (debe tener precio > $0).
2. **Paciente:** en `/especialistas` aparece el perfil verificado. Usa los filtros por especialidad, pulsa **Solicitar cita**, selecciona fecha, hora y motivo y envía.
3. **Paciente:** en `/paciente` aparece la solicitud con estado **Pendiente**.
4. **Profesional:** abre otro navegador (por ejemplo, Edge) con su cuenta y entra en `/profesional`. Verá la solicitud automáticamente gracias a `onSnapshot`.
5. **Profesional:** pulsa **Confirmar** y luego **Completar**.
6. **Paciente:** el estado cambia en su panel sin refrescar.
7. **Admin:** en `/admin` verá la cita terminada y el cálculo informativo de comisión del 15%. **No hay pagos reales.**

## 5. Los cuatro requisitos de la maestra

| Requisito | Implementación | Cómo comprobarlo |
|---|---|---|
| Autenticación por rol | Firebase Authentication + `users/{uid}.role` | Inicia sesión como paciente, profesional y admin; cada uno entra a su dashboard automáticamente |
| Multisesiones | Firebase Auth y colección `sessions` en Firestore | Inicia la **misma** cuenta en Chrome y Edge, abre `/sesiones` y observa dos accesos; finaliza uno desde el otro |
| Recuperación de contraseñas | `sendPasswordResetEmail` | En `/recuperar` escribe un correo que controles; abre el enlace **real** recibido y cambia la contraseña |
| Protección de rutas | React Router + `RequireRole` y Firestore Security Rules | Como paciente visita `/admin` y `/profesional`; no tendrás acceso. Las lecturas en Firestore también están protegidas |

**Límite de multisesiones:** el cierre remoto funciona cuando el cliente en línea recibe el cambio de Firestore. No revoca criptográficamente los tokens de Firebase: eso requiere un backend privilegiado con Admin SDK. No lo presentes como revocación centralizada.

**Recuperación:** Firebase envía el correo usando su infraestructura y su página de acción; se requiere conectividad a Internet y que el email exista. Si el correo no llega, revisa spam y las cuotas de correo de Firebase.

## 6. Datos y colecciones

- `users`: perfil de la cuenta autenticada y rol, con UID como ID.
- `professionals`: perfil creado por profesional; al aprobarlo puede encontrarse desde `/especialistas`.
- `appointments`: citas creadas por pacientes, visibles para cada parte de acuerdo con su UID.
- `sessions`: sesiones de navegador registradas en Firestore, observadas en tiempo real.

No hay perfiles de muestra, contraseñas preestablecidas, almacenamiento local de cuentas ni modo fuera de línea. `sessionStorage` guarda **únicamente un identificador aleatorio de sesión por pestaña** para identificarla en Firestore; **no guarda pacientes ni citas**, y Firebase administra la persistencia de autenticación según «Mantener mi sesión iniciada».

## 7. Comandos de control

```powershell
npm run dev          # servidor local
npm run check        # revisión de tipos TypeScript
npm run test:smoke   # verifica la estructura y que no exista modo demo
npm run build        # compila para producción
npm run preview      # prueba la compilación
```

Para la exposición, usa la guía `docs/PRUEBAS.md` y el guion `docs/PRESENTACION.md`.

## 8. Publicación con GitHub y Vercel

**GitHub:** crea un repositorio vacío, por ejemplo `MENTECH`. En la terminal PowerShell del proyecto:

```powershell
git init
git add .
git commit -m "feat: MENTECH conectado a Firebase y Firestore"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/MENTECH.git
git push -u origin main
```

Sustituye `TU_USUARIO`. Si ya tienes un repositorio inicializado, no vuelvas a crear el remoto: usa `git status`, `git add .`, `git commit` y `git push`.

**Vercel:** importa el repo, selecciona Vite, comando `npm run build` y directorio `dist`. `vercel.json` incluye las redirecciones de SPA. Al desplegar, **añade el dominio Vercel** a Firebase Authentication → Configuración → Dominios autorizados. Para este proyecto no hacen falta variables en Vercel: los identificadores **públicos** ya están incluidos en `src/lib/firebase.ts`. **Nunca** publiques credenciales de cuentas de servicio o claves privadas.

## 9. Errores frecuentes

- **`permission-denied`:** publicaste las reglas del ZIP anterior o el usuario no tiene el rol adecuado. Copia y publica `firestore.rules` de esta versión.
- **«No se encontró perfil en Firestore»:** la cuenta fue creada desde Authentication Console, o falló el registro a mitad de camino; revisa `users/{uid}`.
- **`auth/unauthorized-domain`:** agrega tu dominio exacto en Authentication → Configuración → Dominios autorizados.
- **`auth/invalid-credential`:** contraseña o correo incorrectos; usa «¿La olvidaste?».
- **No aparece el profesional:** debes completar su perfil y verificarlo desde `/admin`.
- **`Failed to fetch`:** revisa Internet y si el proyecto Firebase está activo.
- **No se actualiza en tiempo real:** verifica que estén publicadas las reglas nuevas y revisa los errores mostrados en la interfaz.
- **Vite falla tras editar `.env.local`:** elimina el archivo mal formado, reinicia con `Ctrl + C` y `npm run dev`.

## 10. Alcance

MENTECH es un **proyecto escolar** de conexión entre pacientes y perfiles profesionales. Los registros, sesiones y citas son persistentes en Firebase, pero **no** se realizan sesiones clínicas, diagnósticos, cobros, videollamadas ni pagos. Para mostrar el sistema, usa datos ficticios introducidos por ustedes en la base real de Firestore (no expedientes ni información de salud real).


## Nota de corrección — navegación tras iniciar sesión (20 nov 2026)

En la versión anterior, si el registro de la sesión en la colección `sessions` fallaba
(por ejemplo, por reglas de seguridad antiguas), `AuthContext.tsx` cerraba
automáticamente Firebase Authentication y el usuario regresaba a `/login`.
Ahora el login válido **no se revierte por un fallo secundario**: se muestra un
aviso visible y un error detallado en la consola del navegador. Para que también
funcione la gestión de multisesiones, **publica `firestore.rules` de esta carpeta**.

Si después de la corrección no puedes entrar, verifica en este orden:

1. Que `Authentication → Usuarios → UID` coincida **exactamente** con el ID del
   documento `Firestore → users/{uid}` del mismo correo.
2. Que el campo `role` sea `patient`, `professional` o `admin` (texto sin espacios).
3. Que las reglas de este ZIP estén publicadas en Firestore → Reglas.
4. Que Chrome/Edge DevTools → Consola (F12) no muestre `permission-denied`
   o errores de Firebase.
5. Que no haya variables de otro Firebase en `.env.local`; reinicia `npm run dev`.

Los documentos `users` no equivalen a cuentas en Firebase Authentication: tienen
que existir **ambos** registros.
