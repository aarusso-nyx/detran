// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 64, §8 —
// C-2B-65/67/80. Nenhuma ação (OD-R12-017). `RetentionQueuePageComponent` (IU-RAIT-059) ainda
// não existe (TASK-0015): falha de módulo esperada.
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
  const retencao = listFacadeStub(items);
  return stubFacade<ArchiveFacade>()({
    busca: listFacadeStub([]),
    dossie: readSlotStub({ status: 'idle' }),
    retencao,
    loadRetentionQueue: delegateListLoad(retencao),
  });
}

async function render(facade = archiveFacadeStub(), query = '') {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-secretary', [
      { provide: ArchiveFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('arquivo/retencao')}${query}`,
  );
  return { harness, facade };
}

describe('RetentionQueuePage — C-2B-65 (estados)', () => {
  it('dado retencao vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(archiveFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('RetentionQueuePage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { facade } = await render(archiveFacadeStub(), '?pagina=2');
    const calls = [
      ...facade.retencao.loadMock.mock.calls,
      ...facade.retencao.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('RetentionQueuePage — nenhuma ação [negativo] e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhum [data-action] e nenhuma violação a11y', async () => {
    const { harness } = await render(
      archiveFacadeStub([fixtureCase(CASE_IDS.NAO_CONHECIDO)]),
    );
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
