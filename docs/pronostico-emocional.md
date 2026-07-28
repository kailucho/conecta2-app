# Pronóstico emocional y de bienestar

## Arquitectura

`src/motor/pronosticoPareja.js` es el motor puro (sin React, 100% testeable)
que calcula el pronóstico de cualquier fecha. **No duplica lógica**: reutiliza
`motorCiclo.js` (fase/día del ciclo), `radarPeligrosidad.js` (combinación de
señales + niveles 0-10), `expresiones.js` (personaje) y los datos de
`datos/tiposFase.js`, `datos/alertasEstado.js`, `datos/etapasVida.js`.

- `pronosticoDelDia(fecha, ctx)` → objeto con fase, nivel, energía,
  sensibilidad, molestias, recomendaciones, confianza, señales usadas,
  expresión del personaje y accesorios.
- `pronosticoSemana(fechaInicio, ctx, dias=7)` → arreglo de 7 pronósticos.

## Pronóstico vs. estado real

El **estado real** (declarado por la persona, ej. "estoy cansada") siempre
tiene prioridad sobre el pronóstico calculado. Prioridad de fuentes para HOY:

1. Estado real declarado por la persona.
2. Alertas activas compartidas por la pareja.
3. Ánimo compartido hoy.
4. Datos recientes relevantes.
5. Fase del ciclo, solo si `privacidadHormonal` lo permite.
6. Pronóstico neutral cuando no hay datos (`confianza: 'sin_datos'`).

Para **fechas futuras** nunca se inventa un estado emocional: solo se
proyectan señales proyectables (la fase, si la privacidad lo permite), con
lenguaje probabilístico ("podría", "es posible") y confianza reducida en
ciclos irregulares o variables (`ciclo.confiable === false`). Una alerta
puntual de hoy **no** se proyecta hacia el resto de la semana.

## Privacidad

Respeta estrictamente `perfil.privacidadHormonal`:

- `todo`: el radar del esposo puede usar el score del ciclo y mostrar la fase.
- `solo_fases`: igual que `todo` para efectos del cálculo del radar.
- `solo_alertas`: el ciclo se ignora por completo en el radar del esposo
  (`mostrarFase: false`, `fase: null`); solo se usan señales compartidas
  explícitamente (alertas de estado, ánimo). El pronóstico semanal aparece
  como "sin datos" cuando no hay señales permitidas.

## Etapas de vida

En `etapaVida === 'menopausia'` no se calcula pronóstico menstrual: la
pantalla Hoy cambia a bienestar general (sin radar hormonal), reutilizando
`usarCiclo()` que ya cortocircuita el cálculo en esta etapa.

## Nunca decir

- Que una emoción está causada obligatoriamente por las hormonas ("hoy está
  así por sus hormonas").
- Afirmaciones deterministas sobre el humor futuro ("estará molesta",
  "tendrá mal humor").
- Un score inventado cuando no hay datos suficientes.

## Tests

`src/motor/pronosticoPareja.test.js` cubre: 7 días consecutivos, cambio de
fase, ciclos de distinta duración e irregulares, sin datos, menopausia,
fecha futura, prioridad del estado real, confianza baja y `solo_alertas`.
