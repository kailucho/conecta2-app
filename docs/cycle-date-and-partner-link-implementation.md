# Fecha del ciclo y vinculación de pareja

## 1. Diagnóstico original

El onboarding pedía una “última regla” ambigua y usaba `input type="date"`, por lo que el orden visual dependía del navegador. Aunque el dato se persistía como `YYYY-MM-DD`, `recalcularPromedio()` volvía a interpretarlo mediante `new Date(string)`, que trata ese formato como UTC.

Además, el onboarding generaba `coupleId` y `partnerId` locales. Ningún servicio compartido, endpoint o backend confirmaba esos IDs, pero los flujos creaban interacciones con ellos, las añadían a `colaSalida`, daban puntos y mostraban confirmaciones de envío.

## 2. Por qué los IDs anteriores eran placeholders

Los UUID se generaban en el mismo dispositivo con `generarId()` y no existía un proceso remoto de invitación/aceptación. `syncService.parejaVinculada()` devolvía siempre `false` y el código local mostrado en Ajustes no era canjeable en otro celular. Por ello, la mera presencia de ambos IDs nunca demostró una relación entre dos cuentas.

## 3. Nuevo modelo de vinculación

El perfil incorpora `estadoVinculacion` con los estados `no_vinculada`, `pendiente` y `vinculada`. Un perfil nuevo comienza así:

```js
{
  userId,
  coupleId: null,
  partnerId: null,
  estadoVinculacion: 'no_vinculada'
}
```

`parejaVinculada(perfil)` solo devuelve `true` si el estado es `vinculada`, existen ambos IDs y `partnerId !== userId`. `vinculacionDisponible()` declara explícitamente `false` en la versión local.

## 4. Estrategia de migración

`migrarVinculacionLegada()` se ejecuta antes de hidratar el contexto. Si encuentra `coupleId` y `partnerId` sin un estado explícito:

- cambia el perfil a `no_vinculada` y anula ambos IDs;
- conserva las interacciones dirigidas al placeholder, pero anula su destino y las marca `no_enviado_legacy`;
- vacía `colaSalida`, que en esos perfiles solo contenía destinos ficticios;
- guarda el perfil al final, de modo que un fallo intermedio pueda reintentarse;
- no modifica cuentas que ya tengan un estado explícito, incluida una cuenta `vinculada`.

La propia condición del perfil hace la migración idempotente; no se borra el resto de `localStorage`.

## 5. Interacciones protegidas

`AppContexto` separa `crearInteraccionLocal()` de `enviarInteraccionPareja()`. El segundo es el único guard de envíos y devuelve `{ ok, interaccion }` o `{ ok: false, motivo }`. Sin pareja usa `sin_pareja_vinculada`; ante un fallo de escritura usa `error_persistencia`.

Se revisaron la barra rápida, mensaje libre, emociones, necesidades, cariños, aprecio, propuestas, tarjeta Para hoy, SOS y pausa consciente. Ninguno otorga puntos, notifica, vibra, activa anti-spam ni muestra confirmación antes de `resultado.ok`.

`agregarInteraccion()` comprueba la escritura del historial y de la cola. Si la segunda falla, intenta restaurar el historial anterior y no informa éxito.

## 6. Funciones locales disponibles

Siguen funcionando sin pareja el calendario, predicciones, registro/corrección menstrual, clima, velocímetro, guía, configuración, síntomas, misiones, metas, deseos, reformulador, chat/guía SOS, registro local de SOS y temporizador. Solo se bloquean acciones que afirman enviar algo a otra persona.

## 7. Presentación Día/Mes/Año

`FechaDiaMesAnio` presenta tres controles etiquetados y ordenados como Día, Mes y Año. Usa nombres de mes en español, ofrece primero los 16 años recientes y mantiene “Otro año…” con entrada manual para no imponer un límite de antigüedad. Conserva áreas táctiles grandes y expone errores con `aria-invalid` y `aria-describedby`. No se añadió ninguna dependencia.

El componente distingue estados vacío, incompleto, inválido, futuro y válido. Rechaza fechas inexistentes comprobando que año, mes y día sobrevivan intactos a la construcción local.

## 8. Formato interno

La UI puede mostrar `19/07/2026`, pero el valor que emite y persiste continúa siendo `2026-07-19`. Las utilidades `esFechaISOValida`, `crearFechaISO`, `descomponerFechaISO` y `formatearFechaCorta` centralizan este contrato.

## 9. Prevención de errores UTC

`aMedianoche('2026-07-19')` construye `new Date(2026, 6, 19)` en hora local. `recalcularPromedio()` ahora valida las cadenas ISO y usa `aMedianoche()` en lugar de `new Date(fechaInicio)`. No se agregan horas ni conversiones UTC a fechas de calendario.

## 10. Cambios en Mes

Sin registros, `Mes` muestra el selector manual y conserva el atajo “Mi regla empezó hoy”. Con registros, muestra “Último inicio registrado” y permite corregir el más reciente previa confirmación. La corrección conserva el `id`, actualiza la fecha, registra `corregidoPor`, `rolCorreccion` y `corregidoEl`, y recalcula promedio y variabilidad.

## 11. Tratamiento de SOS

Elegir un escenario siempre ejecuta `registrarSOS()` y abre el protocolo local. Solo un perfil realmente vinculado intenta crear la interacción remota. El temporizador siempre comienza; sin pareja muestra que la pausa empezó en este dispositivo y no guarda ningún mensaje dirigido a otra persona.

## 12. Modal y navegación

`ParejaRequerida` reutiliza `ModalHoja` y explica el bloqueo sin errores técnicos. Su CTA cambia la pestaña a `ajustes`, cierra overlays y enfoca mediante ref la sección `InvitarPareja`. No se añadió React Router ni un selector DOM frágil.

`InvitarPareja` ya no muestra códigos locales ni mensajes en espera. Explica que la conexión entre celulares no está disponible y deja preparada la presentación de los tres estados del modelo.

## 13. Archivos de producción modificados

- `src/App.jsx`
- `src/contexto/AppContexto.jsx`
- `src/motor/fechas.js`
- `src/motor/motorCiclo.js`
- `src/servicios/storageService.js`
- `src/servicios/syncService.js`
- `src/pantallas/Onboarding.jsx`
- `src/pantallas/Mes.jsx`
- `src/pantallas/Hoy.jsx`
- `src/pantallas/Ajustes.jsx`
- `src/componentes/comunes/FechaDiaMesAnio.jsx`
- `src/componentes/vinculacion/ParejaRequerida.jsx`
- `src/componentes/ajustes/InvitarPareja.jsx`
- `src/componentes/comunicacion/BarraComunicacion.jsx`
- `src/componentes/comunicacion/usarEnvioInteraccion.js`
- `src/componentes/comunicacion/FlujoEmocion.jsx`
- `src/componentes/comunicacion/FlujoNecesidad.jsx`
- `src/componentes/comunicacion/FlujoCarino.jsx`
- `src/componentes/comunicacion/FlujoJuntos.jsx`
- `src/componentes/comunicacion/MensajeLibre.jsx`
- `src/componentes/hoy/TarjetaParaHoy.jsx`
- `src/componentes/sos/FlujoSOS.jsx`
- `src/componentes/sos/TimerEnfriamiento.jsx`

## 14. Pruebas creadas o actualizadas

Se crearon pruebas para fechas, selector, sincronización, migración, guard central, onboarding, Mes y SOS. También se actualizaron los perfiles sembrados de las pruebas existentes para declarar `estadoVinculacion: 'vinculada'` cuando corresponde.

La cobertura comprueba fechas imposibles y bisiestas, fecha futura controlada, persistencia exacta, día 1/día 2, cambios de mes/año, promedio local, condiciones de vinculación, cuenta legada, cola ficticia, error de persistencia, ausencia de puntos/confirmación, borrador de mensaje, navegación accesible, corrección con el mismo ID y temporizador local.

## 15. Resultado de `npm test`

Resultado final: 16 archivos de prueba aprobados y 92 pruebas aprobadas. El proceso terminó con código 0.

## 16. Resultado de `npm run build`

Vite generó correctamente el bundle de producción. `vite-plugin-pwa` ejecutó `generateSW` y produjo `dist/sw.js` y el archivo Workbox, manteniendo la PWA instalable y offline.

## 17. Limitación actual y Fase 2

La aplicación continúa siendo local: no hay backend, almacenamiento compartido, autenticación de pareja, invitaciones canjeables ni transporte entre dispositivos. Por tanto, la UI no permite pasar a `vinculada` ni promete envíos posteriores.

Una Fase 2 deberá implementar autenticación, creación/aceptación segura y expirable de invitaciones, confirmación remota de ambos miembros, asignación del `coupleId` por servidor, autorización por pareja, transporte y acuses de entrega, reintentos idempotentes, resolución de conflictos, privacidad/cifrado, desvinculación y migración versionada. Solo después de una confirmación del servicio debe persistirse `estadoVinculacion: 'vinculada'` y comenzar a drenar una cola nueva; nunca deben reutilizarse las interacciones `no_enviado_legacy`.
