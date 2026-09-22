// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 8, §6.2, §8 — C-2B-65/66/69/70/71/72/73/80.
// `TriagePageComponent` (IU-RAIT-008) ainda não existe (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { describe, expect, it } from 'vitest';
import {
  commandMethod,
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
import {
  RAIT_ALL_ROLES,
  type RaitRoleCode,
} from '../../../../testing/route-manifest.fixture';
import { SseService } from '../../../core/sse.service';
import { CaseFacade } from '../../../data/facades/case.facade';
import { TriagePageComponent } from './triage.page';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function caseFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.TRIAGEM_ADMISSIBILIDADE),
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
    admit: commandMethod('rait-case:admit', command),
    reject: commandMethod('rait-case:reject', command),
    command,
  });
}

async function render(
  role: RaitRoleCode,
  facade = caseFacadeStub(),
  sse: 'live' | 'polling' = 'live',
) {
  const harness = await createRaitRouterHarness(
    pageProviders(role, [
      { provide: CaseFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('casos/:id/triagem')}`);
  return { harness, facade };
}

describe('TriagePage — C-2B-65/66 (estados e banner) [presença + ausência]', () => {
  it('dado caso em loading quando renderizada então detran-loading-state', async () => {
    const facade = caseFacadeStub();
    facade.caso.set({ status: 'loading' });
    const { harness } = await render('rait-analyst', facade);
    const el = harness.fixture.debugElement.query(
      By.directive(TriagePageComponent),
    );
    expect(
      el.nativeElement.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });

  it('dado SseService "polling" então banner visível', async () => {
    const polling = await render('rait-analyst', caseFacadeStub(), 'polling');
    const el1 = polling.harness.fixture.debugElement.query(
      By.directive(TriagePageComponent),
    );
    expect(
      el1.nativeElement.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const live = await render('rait-analyst', caseFacadeStub(), 'live');
    const el2 = live.harness.fixture.debugElement.query(
      By.directive(TriagePageComponent),
    );
    expect(
      el2.nativeElement.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

/**
 * `casos/:id/triagem` é restrita a `rait-analyst`/`rait-secretary` (route-manifest.md); os
 * demais 11 papéis são redirecionados a `/sem-permissao` pelo `roleGuard` (já provado por
 * C-2A-13/C-2B-61) antes de chegar à página — navegar pelo router nunca renderizaria
 * `TriagePageComponent` para eles. A matriz de autorização por ação (C-2B-69/70) testa o botão
 * de cada ação para os 13 papéis canônicos independentemente do acesso à rota (adenda A14 do
 * maestro): o componente é montado isolado por `TestBed.createComponent`, sem o router.
 */
function renderIsolated(role: RaitRoleCode, facade = caseFacadeStub()) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [TriagePageComponent],
    providers: pageProviders(role, [{ provide: CaseFacade, useValue: facade }]),
  });
  const fixture = TestBed.createComponent(TriagePageComponent);
  fixture.detectChanges();
  return { fixture, facade };
}

describe('TriagePage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-case:admit', selector: '[data-action="admit"]' },
    { key: 'inf:rait-case:reject', selector: '[data-action="reject"]' },
  ] as const;

  ACTIONS.forEach(({ key, selector }) => {
    RAIT_ALL_ROLES.forEach((role) => {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e ação "${key}" quando renderizado então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, () => {
        const { fixture } = renderIsolated(role);
        const button = fixture.nativeElement.querySelector(selector);
        if (granted) expect(button).not.toBeNull();
        else expect(button).toBeNull();
      });
    });
  });
});

function clickAction(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  selector: string,
): StynxConfirmDialogComponent {
  const el = harness.fixture.debugElement.query(
    By.directive(TriagePageComponent),
  );
  (
    el.nativeElement.querySelector(selector) as HTMLButtonElement | null
  )?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

/** `reject` exige `non_admission_reason` preenchido (§6.1 linha 8) antes de abrir a confirmação. */
function selectReasonAndClickReject(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  const select = host.querySelector<HTMLSelectElement>('#rait-triage-reason');
  if (select) {
    select.value = 'intempestivo';
    select.dispatchEvent(new Event('change'));
  }
  harness.detectChanges();
  return clickAction(harness, '[data-action="reject"]');
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves
// `rait.screens.<slug>.confirm.<x>` do catálogo — as duas desta página (`admit`, `reject`), 3 `it`
// cada.
describe('TriagePage — C-2B-71 (confirmação de admit)', () => {
  it('dado rait-analyst quando o botão admit é clicado então stynx-confirm-dialog abre com message rait.screens.casos-id-triagem.confirm.admit', async () => {
    const { harness } = await render('rait-analyst');
    const dialog = clickAction(harness, '[data-action="admit"]');
    expect(dialog.message).toBe('rait.screens.casos-id-triagem.confirm.admit');
  });

  it('dado o diálogo de admit confirmado então a facade é chamada uma vez com rait-case:admit', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = clickAction(harness, '[data-action="admit"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-case:admit');
  });

  it('dado o diálogo de admit dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = clickAction(harness, '[data-action="admit"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('TriagePage — C-2B-71 (confirmação de reject)', () => {
  it('dado rait-analyst com non_admission_reason preenchido quando o botão reject é clicado então stynx-confirm-dialog abre com message rait.screens.casos-id-triagem.confirm.reject', async () => {
    const { harness } = await render('rait-analyst');
    const dialog = selectReasonAndClickReject(harness);
    expect(dialog.message).toBe('rait.screens.casos-id-triagem.confirm.reject');
  });

  it('dado o diálogo de reject confirmado então a facade é chamada uma vez com rait-case:reject', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = selectReasonAndClickReject(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-case:reject');
  });

  it('dado o diálogo de reject dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = selectReasonAndClickReject(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('TriagePage — C-2B-73 (formulário vazio)', () => {
  it('dado o checklist de admissibilidade sem preencher quando o botão admit é clicado então nenhum comando é chamado (controles obrigatórios sem veredito) [negativo]', async () => {
    const { harness, facade } = await render('rait-analyst');
    const el = harness.fixture.debugElement.query(
      By.directive(TriagePageComponent),
    );
    (
      el.nativeElement.querySelector(
        '[data-action="admit"]',
      ) as HTMLButtonElement | null
    )?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('TriagePage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-analyst');
    const el = harness.fixture.debugElement.query(
      By.directive(TriagePageComponent),
    );
    await expectA11yStateInvariants(el.nativeElement);
  });
});
