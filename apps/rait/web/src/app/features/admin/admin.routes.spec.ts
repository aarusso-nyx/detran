// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-83. As 3 páginas
// (`parametros`, `calendario`, `atos/suspensao`) são L0 (M13; §11 linha 7) — presença do
// placeholder já é C-2B-63 (`app.routes.spec.ts`); nenhuma página nem spec de página aqui.
// `ADMIN_ROUTES` tem 4 entradas: a raiz de grupo `admin` (redirect) + as 3 páginas L0 — ambas
// via `PlaceholderPageComponent` (`manifestRoute`, `core/manifest-routes.ts`).
import { describe, expect, it } from 'vitest';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { ADMIN_ROUTES } from './admin.routes';

describe('admin.routes — C-2B-83 (todas L0)', () => {
  it('dado ADMIN_ROUTES quando lido então as 4 entradas (raiz + 3 páginas) usam PlaceholderPageComponent', () => {
    expect(ADMIN_ROUTES).toHaveLength(4);
    for (const route of ADMIN_ROUTES) {
      expect(route.component).toBe(PlaceholderPageComponent);
    }
  });
});
