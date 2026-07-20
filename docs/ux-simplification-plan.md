# Plan de simplificación UX — "Modo Pareja"

> Documento de arquitectura (Etapa 1). No contiene código de producción; el pseudocódigo solo ilustra la arquitectura. La implementación (Etapa 2) se documenta aparte en `docs/ux-simplification-implementation.md`.

## 1. Diagnóstico del estado actual

La pantalla `Hoy` (`src/pantallas/Hoy.jsx`) monta ~11 tarjetas apiladas verticalmente, casi todas incondicionalmente, sin jerarquía:

1. `EncabezadoHoy` (saludo + fecha + fase + `ChipNivel`)
2. `Personaje` héroe (SVG, decorativo, no interactivo)
3. Tarjeta "sin datos" / "menopausia" (condicionales)
4. `ClimaInterno` (ella) / `Velocimetro` (él)
5. `ConexionHoy`
6. `BandejaPareja` (vacía en Fase 1)
7. `AlertasEstado`
8. `AccionesRapidas`
9. `EnvioAnimo`
10. `MisionDiaria`
11. `TipDelDia`
12. `RegistroAnimoObservado`
13. `AprecioDiario`
14. `BotonSOS` (flotante)

**Problemas medidos:**
- **Demasiadas decisiones visibles al abrir**: 5 formularios emocionales simultáneos (alertas, acciones, ánimo, aprecio, ánimo observado) + 2 tarjetas informativas (misión, tip).
- **Conceptos duplicados**: `AlertasEstado` ("cómo me siento", `feeling`) y `AccionesRapidas` categoría `feeling` (`sin_energia`, `estresado`) declaran los mismos estados por dos caminos con estructuras distintas. `EnvioAnimo` (mi ánimo, `gesture`) y `AprecioDiario` (`gesture`) son ambos "enviar cariño". `EnvioAnimo` (ánimo enviado) vs `RegistroAnimoObservado` (ánimo de la pareja) son dos rejillas de emojis casi idénticas con semántica opuesta → confusión.
- **Elementos que compiten por atención**: misión y tip son dos tarjetas separadas cuando debería haber una sola recomendación.
- **Espacio malgastado**: `ClimaInterno` tiene un botón "Amor, ando sensible…" sin cablear (`onAvisar` nunca se pasa). `BandejaPareja` se monta siempre aunque devuelva `null`.
- **Accesibilidad**: `ModalHoja` (bottom sheet central) carece de `role="dialog"`, scroll-lock y foco gestionado.

## 2. Inventario de componentes afectados

| Componente | Ruta | Destino |
|---|---|---|
| `Hoy` | `src/pantallas/Hoy.jsx` | Reestructurado (7 áreas) |
| `AlertasEstado` | `src/componentes/transversales/AlertasEstado.jsx` | Absorbido → `FlujoEmocion` + `EstadoActivoChip`; **se elimina** |
| `AccionesRapidas` | `.../transversales/AccionesRapidas.jsx` | Absorbido → `FlujoNecesidad`/`FlujoCarino`; **se elimina** |
| `EnvioAnimo` | `.../transversales/EnvioAnimo.jsx` | Absorbido → `FlujoEmocion`; **se elimina** |
| `AprecioDiario` | `.../transversales/AprecioDiario.jsx` | Absorbido → `FlujoCarino`; **se elimina** |
| `ConexionHoy` | `.../transversales/ConexionHoy.jsx` | **Se muda** a `Nosotros` (archivo intacto) |
| `RegistroAnimoObservado` | `.../hoy/RegistroAnimoObservado.jsx` | **Se muda** a `Nosotros` → "Patrones" (archivo intacto) |
| `MisionDiaria` | `.../hoy/MisionDiaria.jsx` | Fusionado en `TarjetaParaHoy` (se conserva como archivo; ya no se monta en Hoy) |
| `TipDelDia` | `.../hoy/TipDelDia.jsx` | Fusionado en `TarjetaParaHoy` (ídem) |
| `BandejaPareja` | `.../transversales/BandejaPareja.jsx` | Ampliado (resolvedor por `type`) |
| `ModalHoja` | `.../comunes/ModalHoja.jsx` | Mejorado (a11y) |
| `Personaje` | `.../personajes/Personaje.jsx` | Prop opcional `alTocar` |
| `NavegacionInferior` | `.../comunes/NavegacionInferior.jsx` | 5 → 4 pestañas |
| `App` | `src/App.jsx` | Rutas Guía + navegación |
| `Ajustes`/`Guia` | `src/pantallas/` | Acceso a Guía desde "Más" |
| `expresiones` | `src/motor/expresiones.js` | Mapa ampliado + `expresionPorAccion` |
| `accionesRapidas` | `src/datos/accionesRapidas.js` | Entradas aditivas |
| `misiones` | `src/datos/misiones.js` | Clave anti-spam exportada |

## 3. Mapa de la experiencia actual

```
Abrir Hoy → scroll largo por 11 tarjetas → cada formulario compite:
  "¿Cómo te sientes?" (alertas)   "¿Qué necesitas?" (acciones)
  "Mi ánimo de hoy" (emojis)      "Aprecio del día" (textarea)
  "¿Cómo ves a tu pareja?" (emojis)  "Conexión de hoy"  "Misión"  "Tip"
→ SOS flotante siempre visible.
```

Enviar un gesto exige leer varias tarjetas, decidir cuál corresponde y desplazarse.

## 4. Mapa de la experiencia propuesta

```
Abrir Hoy → vista ligera:
  Encabezado (saludo · fecha · fase · nivel · 💗 conexión compacta)
  Personaje TOCABLE  (+ chip de mi estado activo, si lo hay)
  Resumen del día (ClimaInterno / Velocimetro)
  Mensajes de la pareja (solo si existen)
  UNA tarjeta "Para hoy" (misión | tip | pregunta | idea de cita)
  ────────────────────────────────────────────
  Barra fija:  [ ＋ ] [  Dile algo a tu amor…  ] [ 💗 ]
  Navegación: Hoy · Mes · Nosotros · Más      SOS 🚨 (flotante)
```

Interacción principal en un toque:
- `💗` → reacción rápida instantánea.
- Área central → escribir/elegir un mensaje.
- `＋` → centro de interacciones progresivo (4 categorías).
- Tocar el personaje → abre el mismo centro.

## 5. Arquitectura de componentes propuesta

Nueva carpeta `src/componentes/comunicacion/`:

- **`BarraComunicacion`** — barra fija sobre la navegación. Área central = **botón** (no `<input>`, para no invocar el teclado bajo un elemento `fixed`). El `💗` envía la reacción rápida por sí mismo (anti-doble-envío + long-press para elegir tipo).
- **`CentroInteracciones`** — bottom sheet (`ModalHoja`) que aloja la máquina de estados del wizard: `categorias → flujo → confirmacion`. Único dueño del estado del wizard.
- **`FlujoEmocion`**, **`FlujoNecesidad`**, **`FlujoCarino`**, **`FlujoJuntos`** — las 4 categorías.
- **`MensajeLibre`** — sheet propio con textarea + frases sugeridas + confirmación.

Nuevos en carpetas existentes:
- `src/componentes/hoy/TarjetaParaHoy.jsx` — recomendación única rotativa.
- `src/componentes/hoy/EstadoActivoChip.jsx` — chip de mi alerta de estado activa (cancelable).
- `src/componentes/comunes/IndicadorConexion.jsx` — 5 corazoncitos compactos (sin números) para el encabezado.
- `src/datos/paraHoy.js` — preguntas de conexión, ideas de cita, `contenidoParaHoy()` y frases sugeridas.

## 6. Componentes que se reutilizan

- `ModalHoja` (base de todos los sheets; se le añade a11y sin cambiar su API).
- `Personaje`, `Estrellita`, `AstroAzul`, `EscenaJuntos` (reacciones y confirmaciones).
- `TarjetaBase`, `ChipNivel`.
- `usarApp` (`crearInteraccion`, `editarInteraccion`), `usarPuntos` (`otorgar`), `usarCiclo`.
- Motor: `expresiones.js`, `conexion.js`, `misiones.js`, `tiposFase.tipDelDia`, `ideasCitas.js`, `fechas.js`.
- Datos: `accionesRapidas.js`, `alertasEstado.js`, `lenguaje.js`.
- `notificaciones.js` (`notificar`, `vibrar`).

## 7. Componentes nuevos

Ver §5. Ninguno introduce dependencias externas; todos son JSX puro y respetan el sistema de temas por `data-tema` y `config.reducirMovimiento`.

## 8. Componentes que se mueven o dejan de mostrarse

- **Se mudan** (mismo archivo, otra pantalla): `ConexionHoy` y `RegistroAnimoObservado` → `Nosotros`.
- **Se fusionan** en `TarjetaParaHoy` (siguen existiendo como archivos, dejan de montarse en Hoy): `MisionDiaria`, `TipDelDia`.
- **Se eliminan** (funciones 100% absorbidas por los flujos): `AccionesRapidas`, `AlertasEstado`, `EnvioAnimo`, `AprecioDiario`. Sus **datos** (`accionesRapidas.js`, `alertasEstado.js`) se conservan y solo se amplían aditivamente.

## 9. Modelo de estado del centro de interacciones

Todo **local** en `CentroInteracciones` (nada nuevo en el contexto; este solo aporta `crearInteraccion`/`editarInteraccion`/`otorgar`):

```
estado = {
  paso: 'categorias' | 'flujo' | 'confirmacion',
  categoria: null | 'emocion' | 'necesidad' | 'carino' | 'juntos',
  confirmacion: null | { icono, titulo, mensaje, escena?: bool }
}

cerrado --(＋ / tocar personaje)--> categorias
categorias --(elegir)--> flujo(categoria)
flujo --(atrás)--> categorias
flujo --(enviar OK)--> confirmacion
confirmacion --(Listo / timeout 2.5s)--> cerrado
Escape / backdrop / ✕ --> cerrado (se resetea a 'categorias' al reabrir)
```

`abierto` vive en `Hoy` (`useState`), junto con `mensajeAbierto` y la reacción transitoria del personaje. El cooldown del `💗` vive en `BarraComunicacion` (ref + timeout).

## 10. Flujo de cada categoría → modelo de datos

Regla invariante: `conexion.js` solo lee `valencia` + `createdAt`; `BandejaPareja` filtra por `receiverId/status/expiresAt` y resuelve la etiqueta por `type`/`actionId`. Todos los flujos respetan ambos y reutilizan los `type` existentes; **único type nuevo: `mensaje`**.

**Cómo me siento** (unifica estado + ánimo):

| Opción | type | actionId | valencia | expiresAt | puntos (clave) |
|---|---|---|---|---|---|
| Bien | `animo` | `😄` | 1 | — | 5 (`animo:<día>`) |
| Cariñoso/a | `animo` | `🥰` | 1 | — | 5 (`animo:<día>`) |
| Cansado/a | `alerta_estado` | `sin_bateria` | 0 | medianoche | 5 (`estado:<día>`) |
| Triste | `alerta_estado` | `sensible` | 0 | medianoche | 5 |
| Saturado/molesto | `alerta_estado` | `estresado` | 0 | medianoche | 5 |
| (Más) Irritable / Modo cueva | `alerta_estado` | `irritable`/`cueva` | 0 | medianoche | 5 |

Pregunta opcional posterior ("quiero cariño / que me escuches / necesito un momento / necesito ayuda / solo quería contártelo") → texto legible en `note` + campo aditivo `necesidad:<id>` (inocuo para sync/valencia/render).

**Necesito algo** → `quick_action`. Destacadas: `abrazo`, `hambre`, `engreir`, `momento`. "Ver más": `antojo`, `besitos`, `sin_energia`, `estresado`, `meti_pata`. `valencia:1`, `otorgar(5, 'accion:<id>')`.

**Quiero darte cariño** → `quick_action` (`extrano`, `besitos`, `ganas_verte`, `buena_noticia`, y nueva `corazon` "pensando en ti"); "Aprecio del día" → `type:'aprecio'` (`otorgar(15, 'aprecio:<día>')`, 1/día); "Mensaje personalizado" → abre `MensajeLibre` (type `mensaje`).

**Hagamos algo juntos** → nuevas entradas `quick_action` (`cita`, `pelicula`, `salir_comer`); "Misión de hoy" completa la misión (reutiliza clave `mision:<idDia>:<semilla>`, +20); "Agregar deseo" / "Meta de pareja" cierran y navegan a `Nosotros` (`irA('nosotros')`).

**💗 rápido** → `quick_action`/`corazon`, `valencia:1`, cooldown 3 s. Long-press 500 ms → elegir `corazon | besitos | abrazo | extrano`. `otorgar(5, 'corazon:<día>')` (máx 1/día).

**Mensaje libre** → `{ type:'mensaje', category:'gesture', actionId:null, note, valencia:1 }`.

`BandejaPareja` se amplía con un resolvedor por type para renderizar `mensaje` (💬), `animo` (emoji + "compartió su ánimo"), `aprecio` (💛) y un fallback (💌), con respuestas genéricas cuando la definición no las trae. Esto además corrige el render pobre actual de `animo`/`aprecio`.

## 11. Cambios de navegación

- `NavegacionInferior`: `Hoy · Mes · Nosotros · Más` (4). La pestaña `guia` sigue en `PANTALLAS` de `App`, pero fuera de la barra.
- Acceso a Guía: tarjeta destacada al inicio de "Más" (`Ajustes`) + botón "← Más" en `Guia`.
- `App`: `activa={pestana === 'guia' ? 'ajustes' : pestana}` para que "Más" quede resaltado al ver la Guía. `Hoy` recibe `irA={setPestana}`. `main`: `pb-28` → `pb-44` (hueco para barra + nav).
- Copy de menopausia en `Hoy`: "pestaña Guía 📖" → "Más ⚙️ → Guía 📖".

## 12. Cambios de persistencia

**Ninguna migración.** Todos los datos conservan su forma. Solo se **añade** un `type:'mensaje'` (nuevo valor, no cambia esquemas) y campos aditivos opcionales (`necesidad`) que los lectores existentes ignoran. Se mantiene `storageService` como única capa, `coupleId/senderId/receiverId/status`, `colaSalida` y las diferencias por `perfil.rol`. La clave anti-spam de misión se extrae a `misiones.js` (`claveMisionHecha(mision, semilla)`) para que `TarjetaParaHoy` y `MisionDiaria` no dupliquen puntos.

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Smoke test roto a mitad de camino | El assert de portada ("¿Qué necesitas…") y el de pestañas se actualizan en los mismos pasos que cambian la vista |
| Doble otorgamiento de puntos | Se reutilizan las claves anti-spam existentes (`animo:`, `aprecio:`, `accion:`, clave de misión centralizada) |
| `BotonSOS` tapado por la barra fija | Sube a `z-40` y `bottom` calculado sobre barra+nav; sigue rojo y separado del centro romántico |
| Teclado móvil sobre barra `fixed` | El área central es botón; la escritura ocurre en `MensajeLibre` (sheet) |
| Guía "escondida" | Tarjeta destacada al tope de "Más" + botón volver; el smoke la recorre |
| `ModalHoja` a11y rompe sheets existentes | API intacta; `CentroConexion`/`FlujoSOS` no se tocan |
| Perder la firma visual por rol | `ClimaInterno`/`Velocimetro` se conservan como "resumen del día" |

## 14. Estrategia de implementación incremental

1. `ModalHoja` a11y + test.
2. Datos/motor: `paraHoy.js`, entradas aditivas en `accionesRapidas.js`, `expresionPorAccion`, clave de misión → `misiones.js` + tests.
3. `BandejaPareja` resolvedor por type + test.
4. `TarjetaParaHoy` reemplaza `MisionDiaria`+`TipDelDia` en Hoy.
5. Navegación 4 pestañas + Guía en "Más" + smoke test (pestañas).
6. Mudar `ConexionHoy` y `RegistroAnimoObservado` a `Nosotros` + `IndicadorConexion`.
7. `BarraComunicacion` + `CentroInteracciones` + `FlujoEmocion` + `FlujoNecesidad`; quitar tarjetas viejas de Hoy + actualizar assert del smoke.
8. `FlujoCarino` + `FlujoJuntos` + `MensajeLibre` + type `mensaje`.
9. Personaje interactivo + reacciones + `BotonSOS` reposicionado + borrar los 4 componentes absorbidos.
10. QA final.

## 15. Estrategia de pruebas

- **Actualizar** `src/app.smoke.test.jsx`: assert de Hoy → `/Dile algo a tu amor/`; recorrido de 4 pestañas + entrar a Guía desde "Más".
- **Nuevos** (patrón jsdom + `ProveedorApp`, sembrando `mp:perfil`/`mp:ciclo`):
  - `comunes/modalHoja.test.jsx`: `role="dialog"`, Escape, scroll-lock, foco devuelto.
  - `comunicacion/centroInteracciones.test.jsx`: abre 4 categorías; emoción negativa+necesidad ⇒ `alerta_estado` con `note`; "Bien" ⇒ `animo`; necesidad ⇒ `quick_action`; aprecio ⇒ `aprecio`.
  - `comunicacion/barraComunicacion.test.jsx`: `💗` ⇒ 1 sola interacción `corazon` pese a doble toque; botón central llama `alAbrirMensaje`.
  - `comunicacion/mensajeLibre.test.jsx`: escribir+confirmar ⇒ `type:'mensaje'`.
  - `datos/paraHoy.test.js`: determinismo por semilla, rotación, filtro conviven.
  - `transversales/bandejaPareja.test.jsx`: renderiza `mensaje`/`animo` con respuestas genéricas; responder marca `acknowledged`.

## 16. Criterios de aceptación

Los 20 criterios del encargo. En síntesis: Hoy sin todos los formularios simultáneos; barra de comunicación presente; opciones secundarias en bottom sheet; estado y ánimo unificados; necesidades frecuentes primero y el resto accesible; aprecio dentro del flujo de cariño; observación de la pareja fuera de la portada; misión y tip en una sola tarjeta; SOS accesible; personaje interactivo; sin pérdida de funciones ni datos; responsive; compila; tests pasan y hay tests nuevos; navegación más simple; menos decisiones iniciales.

## 17. Lista exacta y comprobada de archivos

**Crear (11 + 6 tests):**
`src/componentes/comunicacion/BarraComunicacion.jsx`, `CentroInteracciones.jsx`, `FlujoEmocion.jsx`, `FlujoNecesidad.jsx`, `FlujoCarino.jsx`, `FlujoJuntos.jsx`, `MensajeLibre.jsx`; `src/componentes/hoy/TarjetaParaHoy.jsx`, `src/componentes/hoy/EstadoActivoChip.jsx`; `src/componentes/comunes/IndicadorConexion.jsx`; `src/datos/paraHoy.js`; tests `comunes/modalHoja.test.jsx`, `comunicacion/centroInteracciones.test.jsx`, `comunicacion/barraComunicacion.test.jsx`, `comunicacion/mensajeLibre.test.jsx`, `datos/paraHoy.test.js`, `transversales/bandejaPareja.test.jsx`.

**Modificar (14):**
`src/pantallas/Hoy.jsx`, `Nosotros.jsx`, `Ajustes.jsx`, `Guia.jsx`, `src/App.jsx`, `componentes/comunes/NavegacionInferior.jsx`, `ModalHoja.jsx`, `BotonSOS.jsx`, `EncabezadoHoy.jsx`, `componentes/personajes/Personaje.jsx`, `componentes/transversales/BandejaPareja.jsx`, `motor/expresiones.js`, `datos/accionesRapidas.js`, `datos/misiones.js`, `src/app.smoke.test.jsx`.

**Eliminar al final (4):**
`componentes/transversales/AccionesRapidas.jsx`, `AlertasEstado.jsx`, `EnvioAnimo.jsx`, `AprecioDiario.jsx`.

---

## Representación textual de la nueva pantalla Hoy

```
┌────────────────────────────────────────────┐
│ sábado 19 de julio            🌱 Novato ·40 │
│ ¿Cómo amaneciste? 💗          💗💗💗♡♡       │
│ Día 12 · 🌸 Fase Folicular                  │
│                                             │
│               (  ✨ Estrellita  )   ← tocable│
│              🔋 Sin batería · quitar ✕      │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Clima interno · Folicular            │  │
│  │ energía ▓▓▓▓▓░  paciencia ▓▓▓▓░░ …    │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ 🎯 Misión de hoy            +20 pts   │  │
│  │ Escríbele algo bonito sin motivo.    │  │
│  │ [ Marcar como hecha ]                │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  ＋   Dile algo a tu amor…       💗   │  │← barra fija
│  └──────────────────────────────────────┘  │
│   🏠 Hoy   📅 Mes   💑 Nosotros   ⚙️ Más    │  🚨
└────────────────────────────────────────────┘

Al tocar ＋ (o el personaje) → bottom sheet:
┌────────────────────────────────────────────┐
│  ▁▁▁                                   ✕    │
│  ¿Qué quieres compartir?                    │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 🫂 Cómo me   │  │ 🙋 Necesito │           │
│  │    siento    │  │    algo     │           │
│  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 💗 Darte     │  │ 🎯 Hagamos  │           │
│  │    cariño    │  │  algo juntos│           │
│  └─────────────┘  └─────────────┘           │
└────────────────────────────────────────────┘
```

---

## Resumen ejecutivo para Opus

La pantalla `Hoy` pasa de ~11 tarjetas-formulario a 5 áreas ligeras + una **barra de comunicación fija** estilo compositor (`＋ | "Dile algo…" | 💗`). Toda la interacción secundaria vive en un **centro de interacciones** progresivo (bottom sheet `ModalHoja`) con 4 categorías: *Cómo me siento* (unifica alertas+ánimo), *Necesito algo*, *Quiero darte cariño* (incluye aprecio y mensaje libre), *Hagamos algo juntos*.

**No se pierde ninguna función**: se reorganizan. `ConexionHoy` y `RegistroAnimoObservado` se mudan a `Nosotros`; misión+tip se fusionan en una `TarjetaParaHoy` rotativa; SOS sigue accesible y diferenciado. El personaje se vuelve tocable y reacciona con las expresiones ya existentes.

**No se rompen datos**: todos los flujos reutilizan los `type` de interacción existentes (`quick_action`, `alerta_estado`, `animo`, `aprecio`) reusando sus claves anti-spam; el único añadido es `type:'mensaje'` (compatible con `conexion.js` por `valencia:1` y renderizado por el nuevo resolvedor de `BandejaPareja`). Sin migraciones, sin dependencias nuevas, JSX puro, identidad visual por `data-tema` intacta.

Implementar en los 10 pasos de §14, cada uno dejando la app compilando y los tests en verde. Verificar contra el código real antes de tocar cada archivo (los IDs y claves de este documento ya se comprobaron: acciones, alertas `sin_bateria/sensible/estresado/irritable/cueva`, clave `mision:${idDia}:${semilla}`).
