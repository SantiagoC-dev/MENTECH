# MENTECH — Pruebas de aceptación para la maestra

Las pruebas siguientes usan **Firebase real**. Realízalas desde Chrome y Edge, con cuentas de evaluación creadas manualmente a través de MENTECH. Son una lista de validación; no declaramos que se hayan probado contra el proyecto remoto hasta ejecutarlas.

| # | Acción | Resultado esperado | Evidencia |
|---|---|---|---|
| 1 | Registrar paciente en `/registro` | Authentication crea UID y Firestore `users/{uid}` con `role: patient`; `/paciente` se abre automáticamente | Login + Firestore + panel |
| 2 | Registrar profesional en `/registro` | Se crean `users/{uid}` y `professionals/{uid}`; `/profesional` se abre automáticamente | Firestore + panel |
| 3 | Cambiar tercer usuario a `admin` desde Firestore Console | Menú y dashboard cambian a `/admin` sin refrescar | Console + panel admin |
| 4 | Paciente escribe `/admin` | Redirige a `/paciente` | URL y panel |
| 5 | Profesional escribe `/paciente` | Redirige a `/profesional` | URL y panel |
| 6 | Visitar `/sesiones` sin sesión | Redirige a `/login` | URL login |
| 7 | Iniciar la misma cuenta en dos navegadores diferentes | Se crean dos documentos en `sessions` y ambos aparecen en la lista | Dos navegadores + Firestore |
| 8 | Finalizar una sesión desde la otra | El otro navegador cierra sesión al recibir el evento de Firestore | Dos navegadores |
| 9 | Usar `/recuperar` con correo real | Llega correo Firebase, se cambia contraseña y se puede iniciar sesión con la nueva | Correo + login |
| 10 | Completar y verificar el profesional | Su perfil aparece en directorio automáticamente | Admin + directorio |
| 11 | Paciente solicita cita; profesional confirma | Las dos pantallas muestran actualización instantánea | Chrome + Edge |
| 12 | Profesional completa la cita | Admin ve nueva comisión estimada | Panel admin |
| 13 | Profesional no verificado | No aparece en el directorio público | Panel profesional + directorio |
| 14 | Paciente intenta acceder a documentos privados ajenos desde SDK/Console Rules Playground | Reglas deniegan lectura de otros usuarios | Captura Rules Playground |

**Problemas comunes:** si la web enseña `permission-denied`, publica `firestore.rules` de esta versión. Si en Firebase Authentication ya existe el correo pero falta `users/{uid}`, no lo recrees desde la pantalla; revisa el registro parcial desde Firebase Console.

## Evidencia de la entrega

- Captura del repositorio GitHub.
- Captura de Authentication → Usuarios con las tres cuentas.
- Captura de Firestore → `users`, `professionals`, `appointments`, `sessions`.
- Video o capturas de cada panel por rol.
- Demostración de bloqueo de rutas.
- Captura del correo real de recuperación (oculta información privada).
- Dos navegadores abiertos mostrando multisesiones.
- Captura de cambios de estado de cita en tiempo real.
