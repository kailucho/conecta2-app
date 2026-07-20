# Implementación de la simplificación UX — "Conecta2"

> Etapa 2 (implementación). Guiada por `docs/ux-simplification-plan.md`. Todos los cambios preservan el modelo de datos, la identidad visual por rol y la PWA.

## Resumen de la solución

La pantalla `Hoy` pasó de ~11 tarjetas-formulario apiladas a **5 áreas ligeras + una barra de comunicación fija** estilo compositor: `[ ＋ | "Dile algo a tu amor…" | 💗 ]`. Toda la interacción secundaria vive ahora en un **centro de interacciones** progresivo (bottom sheet accesible) con 4 categorías. El personaje es interactivo y reacciona con las expresiones existentes. No se perdió ninguna función: se reorganizaron. No hubo migraciones de datos.

## Archivos creados

**Componentes de comunicación** (`src/componentes/comunicacion/`):
- `BarraComunicacion.jsx` — barra fija; ＋ abre el centro, el área central abre el compositor, 💗 envía reacción rápida (anti-doble-envío + long-press para elegir tipo).
- `CentroInteracciones.jsx` — bottom sheet con la máquina de estados `categorias → flujo → confirmacion`.
- `FlujoEmocion.jsx` — "Cómo me siento" (unifica ánimo + estado, con pregunta opcional de necesidad).
- `FlujoNecesidad.jsx` — "Necesito algo" (frecuentes + "Ver más").
- `FlujoCarino.jsx` — "Quiero darte cariño" (gestos + aprecio del día + mensaje personalizado).
- `FlujoJuntos.jsx` — "Hagamos algo juntos" (planes + misión + accesos a Nosotros).
- `MensajeLibre.jsx` — compositor de mensaje libre (type `mensaje`).
- `usarEnvioInteraccion.js` — hook compartido para enviar acciones rápidas (evita duplicación).

**Otros componentes/datos:**
- `src/componentes/hoy/TarjetaParaHoy.jsx` — recomendación única rotativa (misión/tip/pregunta/cita).
- `src/componentes/hoy/EstadoActivoChip.jsx` — chip de mi estado activo (cancelable).
- `src/componentes/comunes/IndicadorConexion.jsx` — 5 corazoncitos compactos para el encabezado.
- `src/contexto/usarMision.js` — hook con misión del día y completado seguro (un solo write).
- `src/datos/paraHoy.js` — preguntas de conexión, `contenidoParaHoy()`, frases sugeridas.

**Tests nuevos (6):**
- `src/componentes/comunes/modalHoja.test.jsx` (6 casos)
- `src/datos/paraHoy.test.js` (5)
- `src/componentes/transversales/bandejaPareja.test.jsx` (3)
- `src/componentes/comunicacion/centroInteracciones.test.jsx` (5)
- `src/componentes/comunicacion/barraComunicacion.test.jsx` (3)
- `src/componentes/comunicacion/mensajeLibre.test.jsx` (2)

## Archivos modificados

- `src/pantallas/Hoy.jsx` — reestructurado a las 5 áreas + barra + sheets; personaje interactivo con reacción transitoria (timeout 4 s, respeta `reducirMovimiento`).
- `src/pantallas/Nosotros.jsx` — ahora hospeda `ConexionHoy` y `RegistroAnimoObservado` (sección "Patrones").
- `src/pantallas/Ajustes.jsx` — tarjeta destacada de acceso a la Guía (prop `irAGuia`).
- `src/pantallas/Guia.jsx` — botón "← Más" (prop `alVolver`).
- `src/App.jsx` — 4 pestañas; Guía montable desde "Más"; `pb-44`; `irA` a Hoy.
- `src/componentes/comunes/NavegacionInferior.jsx` — 5 → 4 pestañas (Guía sale de la barra).
- `src/componentes/comunes/ModalHoja.jsx` — `role="dialog"`, `aria-modal`, `aria-labelledby`, scroll-lock, foco inicial + restauración, trampa de Tab (API intacta).
- `src/componentes/comunes/BotonSOS.jsx` — reposicionado sobre la barra (`z-40`, `bottom` con área segura).
- `src/componentes/comunes/EncabezadoHoy.jsx` — incrusta `IndicadorConexion`.
- `src/componentes/personajes/Personaje.jsx` — prop opcional `alTocar` (sin ella, render idéntico).
- `src/componentes/transversales/BandejaPareja.jsx` — resolvedor por type (`mensaje`/`animo`/`aprecio`/fallback); corrige el render pobre previo de `animo`/`aprecio`.
- `src/componentes/hoy/MisionDiaria.jsx` — usa la clave de misión centralizada.
- `src/motor/expresiones.js` — `expresionPorAccion`/`expresionPorEstado`, entradas nuevas, y corrección del id `meti_pata` (antes `metí_pata`, nunca reaccionaba).
- `src/datos/accionesRapidas.js` — entradas aditivas: `corazon`, `cita`, `pelicula`, `salir_comer`, `pregunta_conexion`.
- `src/datos/misiones.js` — `claveMisionHecha(mision, semilla)` exportada.
- `src/app.smoke.test.jsx` — assert de portada y recorrido de 4 pestañas + Guía.

## Archivos eliminados (funciones absorbidas)

`AccionesRapidas.jsx`, `AlertasEstado.jsx`, `EnvioAnimo.jsx`, `AprecioDiario.jsx`. Sus datos (`accionesRapidas.js`, `alertasEstado.js`) se conservan y solo se ampliaron. `ConexionHoy.jsx` y `RegistroAnimoObservado.jsx` **no** se borraron: cambiaron de pantalla.

## Componentes reutilizados

`ModalHoja` (base de todos los sheets), `Personaje`/`EscenaJuntos`, `TarjetaBase`, `ChipNivel`, `usarApp`/`usarPuntos`/`usarCiclo`, motor `conexion.js`/`expresiones.js`/`misiones.js`/`tipDelDia`/`ideasCitas.js`/`fechas.js`, `notificaciones.js`.

## Mapeo de flujos → tipos de interacción

| Flujo | type | valencia | puntos (clave anti-spam) |
|---|---|---|---|
| Cómo me siento (Bien/Cariñoso/a) | `animo` | 1 | 5 (`animo:<día>`) |
| Cómo me siento (Cansado/Triste/Saturado/Irritable/Cueva) | `alerta_estado` (expira medianoche) | 0 | 5 (`estado:<día>`) |
| Necesito algo | `quick_action` | 1 | 5 (`accion:<id>`) |
| Quiero darte cariño (gestos) | `quick_action` | 1 | 5 (`accion:<id>`) |
| Aprecio del día | `aprecio` | 1 | 15 (`aprecio:<día>`) |
| Mensaje personalizado | `mensaje` (nuevo) | 1 | 5 (`mensaje:<día>`) |
| Planes juntos | `quick_action` | 1 | 5 |
| 💗 reacción rápida | `quick_action` | 1 | 5 (`reaccion:<día>`, máx 1/día) |
| Misión (Para hoy / Juntos) | — (gamificación) | — | 20 (`mision:<idDia>:<semilla>`) |

La pregunta opcional de "Cómo me siento" se guarda como nota legible + campo aditivo `necesidad`. `conexion.js` (ratio 5:1) sigue leyendo solo `valencia`; ningún tipo existente cambió de forma.

## Decisiones que difieren del plan (y motivo)

1. **Se añadió `usarMision.js`** (no estaba en la lista original): TarjetaParaHoy y FlujoJuntos completan la misma misión; extraer el hook evita duplicar el patrón "un solo write" y garantiza la misma clave anti-spam.
2. **Se añadió `usarEnvioInteraccion.js`**: tres flujos y la barra envían `quick_action`; el hook centraliza `crearInteraccion` + `otorgar` + `notificar` + `vibrar`.
3. **`FlujoNecesidad` "Ver más" quedó en `antojo`/`meti_pata`** (no `sin_energia`/`estresado`/`besitos` como sugería el plan): esos son estados emocionales (ahora en "Cómo me siento") y `besitos` es un gesto (en "Darte cariño"); incluirlos reintroducía justo la duplicación que el rediseño elimina. Sus datos siguen existiendo, no se pierde capacidad.
4. **Corrección de bug latente**: el id `metí_pata` en `expresiones.js` no coincidía con `meti_pata`; se corrigió para que la reacción funcione.

## Compatibilidad con datos anteriores

Sin migraciones. Todas las interacciones previas conservan su forma y se siguen leyendo. El único añadido es el valor `type:'mensaje'` (nuevo valor, no cambia esquemas) y campos aditivos opcionales (`necesidad`) que los lectores existentes ignoran. Se mantienen `coupleId/senderId/receiverId/status/colaSalida`, la capa `storageService` y las diferencias por `perfil.rol`.

## Pruebas ejecutadas

`npm test` → **8 archivos, 59 tests, todos en verde** (35 previos + 24 nuevos). Incluye smoke de ambos roles navegando las 4 pestañas + Guía.

## Resultado del build

`npm run build` → **OK** (117 módulos, `index.js` 302 KB / 93.5 KB gzip). PWA `generateSW`: 17 entradas precacheadas → **offline y service worker intactos**. Sin dependencias nuevas.

## Estados cubiertos

Sin mensajes / con mensajes (BandejaPareja `null` vs resolvedor por type), sin recomendación de fase (rotación sin tip), acción enviada (confirmación + reacción del personaje), offline (fallbacks de notificaciones/IA existentes), datos antiguos (defaults por spread), sheet abierto/cerrado (scroll-lock + foco), flujo incompleto (botón "← Volver"/Escape), cancelación, doble envío (cooldown del 💗), cambio entre modos él/ella (tema por `data-tema`, textos por rol).

## Deuda técnica pendiente

- `MisionDiaria.jsx` y `TipDelDia.jsx` quedaron sin uso (conservados por decisión del plan). Podrían eliminarse en una limpieza posterior si se confirma que no se reutilizarán.
- `ModalHoja` no implementa snap-points ni drag-to-dismiss (no requerido).
- El proyecto no tiene ESLint/TypeScript; no se añadieron (fuera de alcance).
- **No hay repositorio git** en el entorno, por lo que no se crearon commits; los cambios están aplicados en el árbol de trabajo. Si se inicializa git, la secuencia de commits sugerida está en el plan (§14).

## Verificación manual recomendada

- Viewport móvil pequeño (≤360px) y escritorio: barra y SOS no se solapan con la navegación.
- PWA instalada + modo avión: la app carga y las interacciones se guardan localmente.
- Persistencia al recargar; cambio entre rol él/ella (reinstalar perfil).
- Navegación por teclado en el bottom sheet (Tab cicla, Escape cierra, foco vuelve al disparador).
- `prefers-reduced-motion`: las reacciones no hacen "pop" y la confirmación no se autocierra.

## Cómo probar

```bash
npm install      # solo si hace falta
npm run dev      # abre el servidor de desarrollo (Vite)
npm test         # 59 tests
npm run build && npm run preview   # build de producción + PWA
```
