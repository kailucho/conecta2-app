# Inventario de recursos visuales

Registro central del código: [`src/datos/assetsPersonajes.js`](../src/datos/assetsPersonajes.js).
Componente que consume el registro con fallback: [`src/componentes/personajes/Personaje.jsx`](../src/componentes/personajes/Personaje.jsx).

Todas las imágenes se guardaron en **PNG** (no WebP, como se sugería
originalmente); el registro y el manifest ya apuntan a los archivos reales.
Si un archivo llegara a faltar o dañarse, el `<img>` falla al cargar y
`Personaje.jsx` cae automáticamente al SVG dibujado en JSX
(`AstroAzul.jsx` / `Estrellita.jsx`) — nunca se rompe el render.

## Astro Azul 💙

| Estado | Personaje o recurso | Nombre | Ruta exacta | Formato | Fondo | Uso |
|---|---|---|---|---|---|---|
| ✅ Encontrado y utilizado | Astro Azul | astro-neutral.png | `public/personajes/astro/astro-neutral.png` | PNG | Transparente | Radar bajo, expresión "feliz"/"neutral". |
| ✅ Encontrado y utilizado | Astro Azul | astro-abrazando-corazon.png | `public/personajes/astro/astro-abrazando-corazon.png` | PNG | Transparente | Expresión "amor" (gestos de cariño). |
| ✅ Encontrado y utilizado | Astro Azul | astro-preocupado.png | `public/personajes/astro/astro-preocupado.png` | PNG | Transparente | Radar medio; expresiones "sensible"/"cueva". |
| ✅ Encontrado y utilizado | Astro Azul | astro-casco.png | `public/personajes/astro/astro-casco.png` | PNG | Transparente | Radar alto (accesorio casco/escudo). |
| ✅ Encontrado y utilizado | Astro Azul | astro-durmiendo.png | `public/personajes/astro/astro-durmiendo.png` | PNG | Transparente | Expresión "cansado" (poca energía). |
| ✅ Encontrado y utilizado | Astro Azul | astro-celebrando.png | `public/personajes/astro/astro-celebrando.png` | PNG | Transparente | Expresiones "radiante"/"sorpresa". |
| ✅ Encontrado y utilizado | Astro Azul | astro-pidiendo-perdon.png | `public/personajes/astro/astro-pidiendo-perdon.png` | PNG | Transparente | Acción "Metí la pata" / expresión "pensativo". |
| ✅ Encontrado y utilizado | Astro Azul | astro-con-flores.png | `public/personajes/astro/astro-con-flores.png` | PNG | Transparente | Recomendación cariñosa, expresión "tierno". |

## Estrellita 💗

| Estado | Personaje o recurso | Nombre | Ruta exacta | Formato | Fondo | Uso |
|---|---|---|---|---|---|---|
| ✅ Encontrado y utilizado | Estrellita | estrellita-neutral.png | `public/personajes/estrellita/estrellita-neutral.png` | PNG | Transparente | Día tranquilo, expresión "feliz"/"neutral". |
| ✅ Encontrado y utilizado | Estrellita | estrellita-abrazando-corazon.png | `public/personajes/estrellita/estrellita-abrazando-corazon.png` | PNG | Transparente | Cariño enviado/recibido, expresión "amor"/"tierno". |
| ✅ Encontrado y utilizado | Estrellita | estrellita-cansada.png | `public/personajes/estrellita/estrellita-cansada.png` | PNG | Transparente | Energía baja, expresión "cansado". |
| ✅ Encontrado y utilizado | Estrellita | estrellita-sensible.png | `public/personajes/estrellita/estrellita-sensible.png` | PNG | Transparente | Sensibilidad declarada, expresiones "sensible"/"cueva". |
| ✅ Encontrado y utilizado | Estrellita | estrellita-con-antojo.png | `public/personajes/estrellita/estrellita-con-antojo.png` | PNG | Transparente | Expresión "pensativo" (antojo). |
| ✅ Encontrado y utilizado | Estrellita | estrellita-durmiendo.png | `public/personajes/estrellita/estrellita-durmiendo.png` | PNG | Transparente | Descanso / poca energía. |
| ✅ Encontrado y utilizado | Estrellita | estrellita-celebrando.png | `public/personajes/estrellita/estrellita-celebrando.png` | PNG | Transparente | Acción positiva completada, expresiones "radiante"/"sorpresa". |
| ✅ Encontrado y utilizado | Estrellita | estrellita-molesta-suavemente.png | `public/personajes/estrellita/estrellita-molesta-suavemente.png` | PNG | Transparente | Reservado para un futuro estado declarado explícitamente (hoy sin mapeo de expresión activo — la fase NUNCA la activa automáticamente). |

## Iconos PWA

| Estado | Recurso | Nombre | Ruta exacta | Formato | Uso |
|---|---|---|---|---|---|
| ✅ Encontrado y utilizado | Favicon | favicon.svg | `public/iconos/favicon.svg` | SVG | `<link rel="icon">` en `index.html`. |
| ✅ Encontrado y utilizado | Icono PWA 192×192/512×512 | icono-app.png | `public/iconos/icono-app.png` | PNG | Manifest PWA (`icons`), icono de notificaciones locales (`notificaciones.js`, `src/sw.js`). |
| ✅ Encontrado y utilizado | Icono maskable 512×512 | icono-app-maskable.png | `public/iconos/icono-app-maskable.png` | PNG | `purpose: "maskable"` en el manifest. |
| ✅ Encontrado y utilizado | Badge de notificaciones | badge-monocromo.png | `public/iconos/badge-monocromo.png` | PNG | `badge` en `notificaciones.js` y en el handler `push` de `src/sw.js`. |
| ✅ Encontrado y utilizado | Apple touch icon | apple-touch-icon.png | `public/iconos/apple-touch-icon.png` | PNG | `<link rel="apple-touch-icon">` en `index.html`. |
| ✅ Encontrado y utilizado | Icono esposo | icono-esposo.svg | `public/iconos/icono-esposo.svg` | SVG | Selección de rol en el onboarding. |
| ✅ Encontrado y utilizado | Icono esposa | icono-esposa.svg | `public/iconos/icono-esposa.svg` | SVG | Selección de rol en el onboarding. |
| ◻️ Opcional (sin uso activo) | Icono PWA original SVG | icono-app.svg | `public/iconos/icono-app.svg` | SVG | Ya no referenciado por el manifest (reemplazado por `icono-app.png`); se conserva en disco sin romper nada. |

## Resumen

- **Total esperado**: 16 imágenes de personajes + 7 recursos de iconos activos = **23**.
- **✅ Encontrado y utilizado**: 23 (100%).
- **⚠️ Requiere ajuste**: 0.
- **❌ Falta guardar**: 0.
- **◻️ Opcional**: 1 (`icono-app.svg`, ya no usado por el manifest pero se deja en disco).

Todos los recursos ya están en su lugar. El fallback a SVG (`AstroAzul.jsx` /
`Estrellita.jsx`) sigue existiendo como red de seguridad si algún archivo se
elimina o se daña en el futuro, pero hoy no se está usando en producción.
