// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 63, §8 —
// C-2B-65/79/80. `SealedDossierPageComponent` (IU-RAIT-058) ainda não existe (TASK-0015): falha
// de módulo esperada.
import { describe, expect, it } from 'vitest';
import {
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
import type { SealedDossier } from '../../../data/facades/bundles';

function archiveFacadeStub(dossie: SealedDossier | null = null) {
  return stubFacade<ArchiveFacade>()({
    busca: listFacadeStub([]),
    dossie: readSlotStub<SealedDossier>(
      dossie ? { status: 'ready', value: dossie } : { status: 'idle' },
    ),
    retencao: listFacadeStub([]),
  });
}

async function render(facade = archiveFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-secretary', [
      { provide: ArchiveFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('arquivo/casos/:id')}`);
  return { harness, facade };
}

describe('SealedDossierPage — C-2B-65 (estados)', () => {
  it('dado dossie em loading quando renderizada então detran-loading-state', async () => {
    const facade = archiveFacadeStub();
    facade.dossie.set({ status: 'loading' });
    const { harness } = await render(facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

describe('SealedDossierPage — C-2B-79 (documentUrlOf null → nenhum link)', () => {
  it('dado /arquivo/casos/<CASE_IDS.NAO_CONHECIDO> quando renderizada então rait-dossier-viewer sem link de download (cmd.copy ausente) [negativo]', async () => {
    const bundle: SealedDossier = {
      case: fixtureCase(CASE_IDS.NAO_CONHECIDO),
      documents: [],
      decisions: [],
      communications: [],
      events: [],
    };
    const { harness } = await render(archiveFacadeStub(bundle));
    const host = harness.routeNativeElement as HTMLElement;
    const viewer = host.querySelector('rait-dossier-viewer');
    expect(viewer).not.toBeNull();
    expect(viewer?.querySelector('a[download], a[href]')).toBeNull();
    expect(host.querySelector('[data-action="copy"]')).toBeNull();
  });
});

describe('SealedDossierPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const bundle: SealedDossier = {
      case: fixtureCase(CASE_IDS.NAO_CONHECIDO),
      documents: [],
      decisions: [],
      communications: [],
      events: [],
    };
    const { harness } = await render(archiveFacadeStub(bundle));
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
