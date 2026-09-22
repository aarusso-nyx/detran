// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-65/66/67/69/70/71/72/80.
// `DefensePoolQueuePageComponent` (IU-RAIT-004) ainda não existe (TASK-0015): falha de módulo
// esperada.
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import {
  commandMethod,
  commandRunnerStub,
  delegateListLoad,
  listFacadeStub,
  pageProviders,
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
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { SseService } from '../../../core/sse.service';
import type { RaitCase } from '../../../data/models';
import { QueueFacade } from '../../../data/facades/queue.facade';

const ACTION_KEY = 'inf:rait-case:claim-next';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function queueFacadeStub(items: readonly RaitCase[] = []) {
  const filaDefesa = listFacadeStub(items);
  const command = commandRunnerStub();
  return stubFacade<QueueFacade>()({
    casosDaFila: (() => new Map()) as never,
    filaDefesa,
    loadDefenseQueue: delegateListLoad(filaDefesa),
    filaRelator: listFacadeStub([]),
    retomar: listFacadeStub([]),
    claimNext: commandMethod('rait-case:claim-next', command),
    command,
  });
}

async function render(
  role: RaitRoleCode,
  facade = queueFacadeStub(),
  sse: 'live' | 'polling' = 'live',
) {
  const harness = await createRaitRouterHarness(
    pageProviders(role, [
      { provide: QueueFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('fila/defesa')}`);
  return { harness, facade };
}

describe('DefensePoolQueuePage — C-2B-65 (estados)', () => {
  it('dado filaDefesa em loading quando renderizada então detran-loading-state', async () => {
    const facade = queueFacadeStub();
    facade.filaDefesa.set({ status: 'loading' });
    const { harness } = await render('rait-analyst', facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

describe('DefensePoolQueuePage — C-2B-66 (StreamStatusBanner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(
      'rait-analyst',
      queueFacadeStub(),
      'polling',
    );
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render('rait-analyst', queueFacadeStub(), 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('DefensePoolQueuePage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?q=&filtro=state:ADMITIDO&pagina=2 então setQuery/load chamada', async () => {
    const facade = queueFacadeStub();
    const harness = await createRaitRouterHarness(
      pageProviders('rait-analyst', [
        { provide: QueueFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('fila/defesa')}?filtro=state:ADMITIDO&pagina=2`,
    );
    const calls = [
      ...facade.filaDefesa.loadMock.mock.calls,
      ...facade.filaDefesa.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('DefensePoolQueuePage — matriz §6.2 (C-2B-69/70): inf:rait-case:claim-next', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado com um item na fila então o botão de comando ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(
        role,
        queueFacadeStub([fixtureCase(CASE_IDS.ADMITIDO)]),
      );
      const button = harness.routeNativeElement?.querySelector(
        '[data-primary-action]',
      );
      if (granted) {
        expect(button).not.toBeNull();
      } else {
        expect(button).toBeNull();
      }
    });
  });
});

function clickPrimaryAction(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-primary-action]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11; ciclo 2, achado único): C-2B-71 cobre as
// 45 chaves do catálogo — 3 `it` também para esta ação.
describe('DefensePoolQueuePage — C-2B-71 (confirmação de claim-next)', () => {
  it('dado rait-analyst com um item ativo quando o botão é clicado então stynx-confirm-dialog abre com message rait.screens.fila-defesa.confirm.claim-next', async () => {
    const facade = queueFacadeStub([fixtureCase(CASE_IDS.ADMITIDO)]);
    const { harness } = await render('rait-analyst', facade);
    const dialog = clickPrimaryAction(harness);
    expect(dialog.message).toBe('rait.screens.fila-defesa.confirm.claim-next');
  });

  it('dado o diálogo de claim-next confirmado então a facade é chamada uma vez com rait-case:claim-next', async () => {
    const facade = queueFacadeStub([fixtureCase(CASE_IDS.ADMITIDO)]);
    const { harness } = await render('rait-analyst', facade);
    const dialog = clickPrimaryAction(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:claim-next',
    );
  });

  it('dado o diálogo de claim-next dispensado então a facade NÃO é chamada [negativo]', async () => {
    const facade = queueFacadeStub([fixtureCase(CASE_IDS.ADMITIDO)]);
    const { harness } = await render('rait-analyst', facade);
    const dialog = clickPrimaryAction(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('DefensePoolQueuePage — C-2B-72 (comando unavailable)', () => {
  it('dado o comando confirmado quando a facade devolve unavailable então rait-error-banner[data-kind="unavailable"] com rait.common.unavailable e o botão permanece [presença]', async () => {
    const facade = queueFacadeStub([fixtureCase(CASE_IDS.ADMITIDO)]);
    const { harness } = await render('rait-analyst', facade);
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-primary-action]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    const dialog: StynxConfirmDialogComponent =
      harness.fixture.debugElement.query(
        By.directive(StynxConfirmDialogComponent),
      ).componentInstance;
    dialog.confirm.emit();
    harness.detectChanges();
    expect(
      host.querySelector('rait-error-banner[data-kind="unavailable"]'),
    ).not.toBeNull();
    expect(host.querySelector('[data-primary-action]')).not.toBeNull();
  });
});

describe('DefensePoolQueuePage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      'rait-analyst',
      queueFacadeStub([fixtureCase(CASE_IDS.ADMITIDO)]),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
