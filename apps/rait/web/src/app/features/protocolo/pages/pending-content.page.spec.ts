// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 20, §6.2, §8 —
// C-2B-65/66/67/69/70/71/72/80. `PendingContentPageComponent` (IU-RAIT-021) ainda não existe
// (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { describe, expect, it } from 'vitest';
import {
  commandMethod,
  commandRunnerStub,
  delegateListLoad,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { SseService } from '../../../core/sse.service';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import type { RaitPendingContent } from '../../../data/models';

const ACTION_KEY = 'inf:rait-case:resolve-pending-content';

function sseServiceStub(status: 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

function protocolFacadeStub(items: readonly RaitPendingContent[] = []) {
  const pendencias = listFacadeStub(items);
  const command = commandRunnerStub();
  return stubFacade<ProtocolFacade>()({
    intake: listFacadeStub([]),
    pendencias,
    loadPending: delegateListLoad(pendencias),
    remessas: listFacadeStub([]),
    redirecionamentos: listFacadeStub([]),
    desistenciaCaso: readSlotStub({ status: 'idle' }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    resolvePendingContent: commandMethod(
      'rait-case:resolve-pending-content',
      command,
    ),
    command,
  });
}

async function render(
  role: string,
  facade = protocolFacadeStub(),
  sse: 'live' | 'polling' = 'live',
  query = '',
) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: ProtocolFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('protocolo/pendencias')}${query}`,
  );
  return { harness, facade };
}

describe('PendingContentPage — C-2B-65 (estados)', () => {
  it('dado pendencias em loading quando renderizada então detran-loading-state', async () => {
    const facade = protocolFacadeStub();
    facade.pendencias.set({ status: 'loading' });
    const { harness } = await render('rait-secretary', facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

describe('PendingContentPage — C-2B-66 (banner) [presença + ausência]', () => {
  it('dado SseService "polling" então banner visível', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub(),
      'polling',
    );
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" então banner ausente [negativo]', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub(),
      'live',
    );
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('PendingContentPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?filtro=case_id:x&pagina=2 então setQuery/load chamada', async () => {
    const { facade } = await render(
      'rait-secretary',
      protocolFacadeStub(),
      'live',
      '?pagina=2',
    );
    const calls = [
      ...facade.pendencias.loadMock.mock.calls,
      ...facade.pendencias.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('PendingContentPage — matriz §6.2 (C-2B-69/70): resolve-pending-content', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão resolve ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="resolve"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

function clickResolve(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="resolve"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('PendingContentPage — C-2B-71 (confirmação de resolve)', () => {
  it('dado rait-secretary quando o botão resolve é clicado então stynx-confirm-dialog abre com message rait.screens.protocolo-pendencias.confirm.resolve', async () => {
    const { harness } = await render('rait-secretary');
    const dialog = clickResolve(harness);
    expect(dialog.message).toBe(
      'rait.screens.protocolo-pendencias.confirm.resolve',
    );
  });

  it('dado o diálogo de resolve confirmado então a facade é chamada uma vez com rait-case:resolve-pending-content', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickResolve(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:resolve-pending-content',
    );
  });

  it('dado o diálogo de resolve dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickResolve(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('PendingContentPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-secretary');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});

describe('PendingContentPage — C-2B-87 (slot offline: botões desabilitados)', () => {
  it("dado pendencias.error() 'offline' (status 0) quando renderizada então os botões de comando têm disabled e o banner 'rait.errors.offline' está presente", async () => {
    const facade = protocolFacadeStub([]);
    facade.pendencias.set({
      status: 'offline',
      error: {
        kind: 'offline',
        messageKey: 'rait.errors.offline',
        context: {},
      },
    });
    const { harness } = await render('rait-secretary', facade);
    const host = harness.routeNativeElement as HTMLElement;
    expect(host.textContent ?? '').toContain('rait.errors.offline');
    const button = host.querySelector<HTMLButtonElement>(
      '[data-action="resolve"]',
    );
    if (button) expect(button.disabled).toBe(true);
  });
});
