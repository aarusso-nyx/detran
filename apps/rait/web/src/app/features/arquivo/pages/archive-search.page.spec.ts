// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 62, §8 —
// C-2B-65/67/80. Nenhuma ação (abrir → /arquivo/casos/:id). `ArchiveSearchPageComponent`
// (IU-RAIT-057) ainda não existe (TASK-0015): falha de módulo esperada.
import { describe, expect, it } from 'vitest';
import {
  delegateListLoad,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { ArchiveFacade } from '../../../data/facades/archive.facade';
import type { RaitCase } from '../../../data/models';

function archiveFacadeStub(items: readonly RaitCase[] = []) {
  const busca = listFacadeStub(items);
  return stubFacade<ArchiveFacade>()({
    busca,
    loadArchiveSearch: delegateListLoad(busca),
    dossie: readSlotStub({ status: 'idle' }),
    retencao: listFacadeStub([]),
  });
}

async function render(facade = archiveFacadeStub(), query = '') {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-secretary', [
      { provide: ArchiveFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('arquivo/busca')}${query}`,
  );
  return { harness, facade };
}

describe('ArchiveSearchPage — C-2B-65 (estados)', () => {
  it('dado busca vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(archiveFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('ArchiveSearchPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?q=RAIT-2026-000003 então setQuery/load chamada', async () => {
    const { facade } = await render(archiveFacadeStub(), '?q=RAIT-2026-000003');
    const calls = [
      ...facade.busca.loadMock.mock.calls,
      ...facade.busca.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('ArchiveSearchPage — nenhuma ação [negativo] e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhum [data-action], form[role="search"] presente e nenhuma violação a11y', async () => {
    const { harness } = await render(
      archiveFacadeStub([fixtureCase(CASE_IDS.NAO_CONHECIDO)]),
    );
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
    expect(
      harness.routeNativeElement?.querySelector('form[role="search"]'),
    ).not.toBeNull();
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
