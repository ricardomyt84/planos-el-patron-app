# Instrucciones para Claude

## 💸 Ahorro de GitHub Actions (Ricardo, 2026-11-04 — regla de todos los repos)

El plan trae **2,000 min/mes** de Actions en repos privados y las Mac (`macos-*`, iOS)
cuentan **10×** (1 min = 10). En nov-2026 se gastaron **3,575 min en 3 días**. Por eso:

- **Un solo push por tarea**, al final, con todos los commits juntos (no uno por commit).
  Commits de solo notas/docs: agrega `[skip ci]` al mensaje.
- **No lances workflows** (`workflow_dispatch`, `actions_run_trigger`) por tu cuenta:
  solo si Ricardo lo pide, **una vez**, con todos los cambios ya juntos.
  iOS/macOS: **máximo una build al día** salvo orden explícita de Ricardo.
- **Prueba local antes de subir**; el CI no es tu probador.
- **No vigiles PRs** (`subscribe_pr_activity`) ni consultes el estado del CI en bucle,
  salvo que Ricardo lo pida.
- **Workflows nuevos o cambiados:** nada de `schedule` más seguido que cada hora;
  siempre `paths:`, `concurrency` con `cancel-in-progress: true` y `timeout-minutes`;
  Linux (`ubuntu-*`) salvo que de verdad se necesite Mac. Antes de agregar un trigger,
  calcula los minutos/mes y díselo a Ricardo.
