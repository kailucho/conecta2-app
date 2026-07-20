# Convivencia binaria + Radar de Peligrosidad

Resumen breve de dos cambios relacionados: la simplificación del tipo de
relación y el rediseño del velocímetro del modo él como "Radar de
Peligrosidad".

## 1. Clasificación por convivencia

`tipoRelacion` dejó de tener 3 valores (`casados` / `convivientes` / `novios`)
y ahora es binario:

- `conviven` — la pareja vive junta.
- `no_conviven` — la pareja no vive junta (todavía).

El onboarding y Ajustes solo preguntan **"¿Viven juntos?"**. El lenguaje de la
app es neutral ("tu pareja") y no depende del estado civil.

### Compatibilidad

`normalizarTipoRelacion()` (`src/datos/lenguaje.js`) es la única fuente de
mapeo de valores antiguos a los nuevos:

```
casados, convivientes, conviven → conviven
novios, no_conviven              → no_conviven
```

Se aplica al hidratar el perfil local (`AppContexto.jsx`) y al leer/escribir
el perfil remoto (`profileService.js`), así que perfiles creados antes de este
cambio se siguen mostrando y funcionando correctamente.

### Migración Supabase

`supabase/migrations/0014_unify_relationship_type.sql` migra los datos
existentes de `profiles.relationship_type` a los nuevos valores y reemplaza el
CHECK constraint. No toca RLS, Auth, Realtime ni grants.

## 2. Radar de Peligrosidad

El velocímetro del modo él ahora se presenta como:

```
RADAR DE PELIGROSIDAD
Del día, no de ella 😅
```

Es una guía con humor, no un diagnóstico ni un juicio sobre la pareja.

### Factores (por prioridad)

`calcularRadarPeligrosidad()` (`src/motor/radarPeligrosidad.js`) combina, en
este orden de prioridad:

1. Estado declarado explícitamente por la pareja (alerta de estado activa,
   la más reciente y no expirada).
2. Ánimo positivo compartido hoy por la pareja (😄 / 🥰).
3. Score derivado de la fase del ciclo (`scorePeligrosidad`), **solo** cuando
   la privacidad hormonal lo permite.
4. Valor neutral (5/10) cuando no hay suficientes señales.

### Regla de privacidad `solo_alertas`

Cuando `perfil.privacidadHormonal === 'solo_alertas'`, el radar ignora por
completo el score del ciclo y no expone la fase ni el día del ciclo: el
puntaje se calcula únicamente con señales compartidas explícitamente
(alertas/ánimo), para que nunca permita inferir información hormonal
restringida.

### Niveles

Definidos en `NIVELES_RADAR` (`src/motor/radarPeligrosidad.js`): Terreno
tranquilo (0-2), Antenas arriba (3-4), Mimos recomendados (5-6), Zona
delicada (7-8), Modo legendario (9-10). Cada nivel también define los
accesorios de Astro Azul.

### Mensajes por tono

`src/datos/radarPeligrosidad.js` centraliza los mensajes por tono (`suave`,
`normal`, `sinfiltro`), con selección determinista por día para que no
cambien en cada render.
