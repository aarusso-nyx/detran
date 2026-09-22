// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 9, §6.2, §8 — C-2B-65/66/69/70/80.
// `DossierPageComponent` (IU-RAIT-009) ainda não existe (TASK-0015): falha de módulo esperada.
// A ação `rait-document:attach-official` é de fonte só-ficha (OD-R12-027): positivos só se a
// chave existir em `ROLE_PERMISSIONS_FIXTURE`; hoje não existe em nenhum papel → 13 negativos.
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { SseService } from '../../../core/sse.service';
import { CaseFacade } from '../../../data/facades/case.facade';
import { DossierPageComponent } from './dossier.page';

const ACTION_KEY = 'inf:rait-document:attach-official';

function caseFacadeStub() {
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.EM_INSTRUCAO),
    }),
    partes: listFacadeStub([]),
    prazos: listFacadeStub([]),
    relogios: listFacadeStub([]),
    documentos: listFacadeStub([]),
    diligencias: listFacadeStub([]),
    minutas: listFacadeStub([]),
    admissibilidade: listFacadeStub([]),
    comunicacoes: listFacadeStub([]),
    eventos: listFacadeStub([]),
    impedimentos: listFacadeStub([]),
    decisao: listFacadeStub([]),
    provimentos: listFacadeStub([]),
    provimentosDecisao: (() => new Map()) as never,
    provimentosPrazo: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function render(role: string, sse: 'live' | 'polling' = 'live') {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: CaseFacade, useValue: caseFacadeStub() },
      {
        provide: SseService,
        useValue: {
          status: () => sse,
          polling: () => sse === 'polling',
          live: () => sse === 'live',
          connect: () => {},
        },
      },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/dossie')}`);
  return harness;
}

describe('DossierPage — estado ready e a11y em live (C-2B-65/80)', () => {
  it('dado sse live quando renderizada então <h1>, sem rait-stream-status-banner e nenhuma violação a11y', async () => {
    const live = await render('rait-analyst', 'live');
    const elLive = live.fixture.debugElement.query(
      By.directive(DossierPageComponent),
    );
    expect(elLive.nativeElement.querySelector('h1')).not.toBeNull();
    expect(
      elLive.nativeElement.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
    await expectA11yStateInvariants(elLive.nativeElement);
  });
});

describe('DossierPage — banner de degradação em polling (C-2B-66)', () => {
  it('dado sse polling quando renderizada então rait-stream-status-banner com role status', async () => {
    const polling = await render('rait-analyst', 'polling');
    const elPolling = polling.fixture.debugElement.query(
      By.directive(DossierPageComponent),
    );
    expect(
      elPolling.nativeElement.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });
});

describe('DossierPage — matriz §6.2 (C-2B-69/70): attach-official (ficha, OD-R12-027)', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão attach-official ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const harness = await render(role);
      const el = harness.fixture.debugElement.query(
        By.directive(DossierPageComponent),
      );
      const button = el.nativeElement.querySelector(
        '[data-action="attach-official"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});
