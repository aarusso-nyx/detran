// R-0014 TASK-0007 (Inspector). Contrato serviço ↔ i18n (plan.md M9; prompts/TASK-0007.md
// §Tarefa item 5). "Manifesto" aqui é o manifesto de produção `PORTAL_ROUTE_MANIFEST`
// (src/app/app.route-manifest.ts) — não a fixture `src/testing/route-manifest.fixture.ts` — por
// instrução do maestro (atualização de 2026-09-17 ao prompt desta tarefa, adenda A4 de plan.md):
// T-22 não tem `serviceKey` no manifesto real, e `cancelamento_sne` (parte da lista fechada de 16
// chaves da fixture) não está atrelado a nenhuma rota — nenhum dos dois entra na obrigação deste
// teste.
import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
import { readCatalog, SERVICE_KEYS } from '../../testing/kb';

describe('contrato serviço ↔ i18n (M9)', () => {
  const catalog = readCatalog();
  const manifestServiceKeys = [
    ...new Set(
      PORTAL_ROUTE_MANIFEST.map((entry) => entry.serviceKey).filter(
        (key): key is string => !!key,
      ),
    ),
  ].sort();

  it('dado todo serviceKey do manifesto quando comparado à lista fechada de serviços então pertence a ela', () => {
    const offenders = manifestServiceKeys.filter(
      (key) => !(SERVICE_KEYS as readonly string[]).includes(key),
    );
    expect(
      offenders,
      `serviceKey do manifesto fora da lista fechada: ${offenders.join(', ')}`,
    ).toEqual([]);
  });

  it('dado todo serviceKey do manifesto quando comparado ao catálogo então existe portal.services.<key>', () => {
    expect(manifestServiceKeys.length).toBeGreaterThan(0);
    const missing = manifestServiceKeys.filter(
      (key) => !catalog[`portal.services.${key}`],
    );
    expect(
      missing,
      `portal.services.<key> ausente para: ${missing.join(', ')}`,
    ).toEqual([]);
  });
});
