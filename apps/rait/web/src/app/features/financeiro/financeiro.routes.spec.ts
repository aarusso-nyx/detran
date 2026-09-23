// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-83. As 4 páginas
// (`arrecadacao`, `restituicoes`, `cobranca`, `conciliacao`) são L0 (M13; §11 linha 5) —
// presença do placeholder já é C-2B-63 (`app.routes.spec.ts`); nenhuma página nem spec de página
// aqui. `FINANCEIRO_ROUTES` tem 5 entradas: a raiz de grupo `financeiro` (redirect) + as 4
// páginas L0 — ambas via `PlaceholderPageComponent`.
import { describe, expect, it } from 'vitest';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { FINANCEIRO_ROUTES } from './financeiro.routes';

describe('financeiro.routes — C-2B-83 (todas L0)', () => {
  it('dado FINANCEIRO_ROUTES quando lido então as 5 entradas (raiz + 4 páginas) usam PlaceholderPageComponent', () => {
    expect(FINANCEIRO_ROUTES).toHaveLength(5);
    for (const route of FINANCEIRO_ROUTES) {
      expect(route.component).toBe(PlaceholderPageComponent);
    }
  });
});
