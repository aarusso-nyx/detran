// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-83. As 3 páginas
// (`renainf`, `renach`, `falhas`) são L0 (M13; §11 linha 6) — presença do placeholder já é
// C-2B-63 (`app.routes.spec.ts`); nenhuma página nem spec de página aqui. `INTEGRACOES_ROUTES`
// tem 4 entradas: a raiz de grupo `integracoes` (redirect) + as 3 páginas L0 — ambas via
// `PlaceholderPageComponent`.
import { describe, expect, it } from 'vitest';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { INTEGRACOES_ROUTES } from './integracoes.routes';

describe('integracoes.routes — C-2B-83 (todas L0)', () => {
  it('dado INTEGRACOES_ROUTES quando lido então as 4 entradas (raiz + 3 páginas) usam PlaceholderPageComponent', () => {
    expect(INTEGRACOES_ROUTES).toHaveLength(4);
    for (const route of INTEGRACOES_ROUTES) {
      expect(route.component).toBe(PlaceholderPageComponent);
    }
  });
});
