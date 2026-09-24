import type { Routes } from '@angular/router';
import { resolveBoatRoute } from './navigation/guards/readiness.guard.js';

export const TEAT_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/turno/turno.routes.js').then(
        (module) => module.TURNO_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/consultas/consultas.routes.js').then(
        (module) => module.CONSULTAS_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/ait/ait.routes.js').then(
        (module) => module.AIT_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/medidas/medidas.routes.js').then(
        (module) => module.MEDIDAS_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/alcoolemia/alcoolemia.routes.js').then(
        (module) => module.ALCOOLEMIA_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/sinistro/sinistro.routes.js').then(
        (module) => module.SINISTRO_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/sincronizacao/sincronizacao.routes.js').then(
        (module) => module.SINCRONIZACAO_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/complementares/complementares.routes.js').then(
        (module) => module.COMPLEMENTARES_ROUTES,
      ),
  },
];

export { resolveBoatRoute };

export function resolveDisabledRoute(
  path: string,
): Readonly<{ kind: 'unavailable' | 'not-disabled' }> {
  return path.replace(/^\//, '') === 'ait-speed-measurement'
    ? { kind: 'unavailable' }
    : { kind: 'not-disabled' };
}
