# MENTECH — Guion para presentación electrónica

**Materia:** Desarrollo web · **Proyecto:** MENTECH · **Tecnologías:** React + TypeScript + Vite + Firebase Authentication + Firestore + Security Rules + Tailwind CSS.

## Diapositiva 1 — Portada
MENTECH — Tecnología que conecta con acompañamiento. Proyecto académico de desarrollo web en equipo.

## Diapositiva 2 — Problema y objetivo
Una persona busca profesionales según un área de acompañamiento. MENTECH ofrece un directorio, solicitud de citas, paneles por rol y recursos públicos de ayuda. No presta servicios clínicos.

## Diapositiva 3 — Arquitectura
**Frontend:** React y React Router con vistas públicas y privadas. **Autenticación:** Firebase Authentication. **Base de datos:** Firestore con `onSnapshot`. **Autorización:** reglas en Firestore y rutas protegidas. **Entrega:** GitHub y Vercel.

## Diapositiva 4 — Modelo de datos
`users/{uid}` contiene rol y perfil; `professionals/{uid}` contiene oferta profesional y verificación; `appointments/{id}` contiene citas; `sessions/{id}` contiene identificadores de acceso.

## Diapositiva 5 — Autenticación por roles
Desde `/registro`, crear paciente y profesional. El administrador se promueve únicamente desde Firebase Console. Mostrar que cada cuenta accede directamente a su panel tras el inicio de sesión, sin recarga de página.

## Diapositiva 6 — Multisesiones
Abrir la misma cuenta en Chrome y Edge; consultar `/sesiones` y los documentos Firestore. Finalizar una sesión desde el otro navegador y mostrar la desconexión. Aclarar que el cierre depende del cliente en línea y no revoca tokens centralmente.

## Diapositiva 7 — Recuperación de contraseñas
Visitar `/recuperar`, escribir un correo de evaluación existente, recibir el email real de Firebase y cambiar la contraseña. Probar que la nueva contraseña permite iniciar sesión.

## Diapositiva 8 — Protección de rutas y datos
Como paciente, intentar `/admin`: no se permite. Como profesional, intentar `/paciente`: no se permite. Mostrar reglas Firestore que impiden modificar `role` desde el navegador.

## Diapositiva 9 — Flujo de la plataforma
El profesional completa el perfil; admin lo verifica; el paciente encuentra el perfil y solicita cita; el profesional confirma y completa; los cambios aparecen en vivo. Comisión del 15% informativa, sin cobros.

## Diapositiva 10 — Conclusión
Se cumplieron autenticación por usuario, multisesiones, recuperación de contraseñas y protección de rutas; se integraron datos persistentes en Firestore y actualizaciones en tiempo real. Proyecto limitado al entorno escolar, sin atención clínica ni pagos.

### Antes de presentar
Revisa las 14 pruebas en `docs/PRUEBAS.md` y ten preparadas las tres cuentas de evaluación. No uses correos ajenos ni datos clínicos reales.
