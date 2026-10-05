# PsicoLingo

App tipo Duolingo para estudiar semiología y psicopatología: 12 unidades, 355 términos, 20 síndromes y 150 casos clínicos.
Responsive (móvil con barra inferior, laptop con barra lateral). Next.js 16 + Tailwind 4 + Supabase Auth.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000 → abre directamente el login
```

Variables en `.env`: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### Sincronizar el progreso en la nube (recomendado)

Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase. Crea la tabla `progress` con RLS
(cada usuario solo ve su fila). Sin la tabla la app funciona igual, pero guarda el progreso solo en el navegador.

## Pantallas

| Ruta | Pantalla |
| --- | --- |
| `/login` | Inicio de sesión, registro y recuperación de contraseña |
| `/inicio` | Dashboard: racha, XP, nivel, meta diaria, accesos rápidos, dato curioso diario |
| `/unidades`, `/unidades/[id]` | Camino de unidades; detalle con conceptos, palabras clave, quiz, casos y síndromes |
| `/sindromes/[id]` | Ficha completa de cada síndrome |
| `/casos`, `/casos/[id]` | 150 casos con filtros por síndrome, unidad, dificultad y estado |
| `/retos/*` | Flashcards, emparejar, test rápido e identificación de síntomas |
| `/examen` | Simulación cronometrada (15/25/40 preguntas) |
| `/repaso` | Repaso espaciado (Leitner): los términos fallados reaparecen |
| `/progreso` | Estadísticas, actividad, precisión por unidad, temas débiles, logros, historial |
| `/glosario` | Buscador de todos los términos |
| `/perfil` | Avatar, modo oscuro, sonido, meta diaria, cuenta, insignias |

## Estructura

- `lib/data/` — contenido: `units.ts`, `syndromes.ts`, `cases.ts`, `facts.ts`
- `lib/progress.ts` — modelo de progreso, XP, racha, repaso espaciado, logros
- `lib/quiz.ts` — generación de preguntas
- `components/quiz-runner.tsx` — motor de lecciones (comprobar → feedback → continuar)
