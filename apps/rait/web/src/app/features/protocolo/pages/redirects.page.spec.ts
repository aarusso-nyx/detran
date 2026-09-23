// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 22, §6.2, §8 —
// C-2B-65/67/69/70/71/72/80. `RedirectsPageComponent` (IU-RAIT-023) ainda não existe
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
import { ProtocolFacade } from '../../../data/facades/protocol.facade';

const ACTION_KEY = 'inf:rait-case:redirect';

function protocolFacadeStub() {
  const redirecionamentos = listFacadeStub([]);
  const command = commandRunnerStub();
  return stubFacade<ProtocolFacade>()({
    intake: listFacadeStub([]),
    pendencias: listFacadeStub([]),
    remessas: listFacadeStub([]),
    redirecionamentos,
    loadRedirects: delegateListLoad(redirecionamentos),
    desistenciaCaso: readSlotStub({ status: 'idle' }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    redirect: commandMethod('rait-case:redirect', command),
    command,
  });
}

async function render(role: string, facade = protocolFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: ProtocolFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('protocolo/redirecionamentos')}`,
  );
  return { harness, facade };
}

describe('RedirectsPage — C-2B-65 (estados)', () => {
  it('dado redirecionamentos vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-secretary');
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('RedirectsPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const facade = protocolFacadeStub();
    const harness = await createRaitRouterHarness(
      pageProviders('rait-secretary', [
        { provide: ProtocolFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('protocolo/redirecionamentos')}?pagina=2`,
    );
    const calls = [
      ...facade.redirecionamentos.loadMock.mock.calls,
      ...facade.redirecionamentos.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('RedirectsPage — matriz §6.2 (C-2B-69/70): rait-case:redirect', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão redirect ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="redirect"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

function clickRedirect(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="redirect"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('RedirectsPage — C-2B-71 (confirmação de redirect)', () => {
  it('dado rait-secretary quando o botão redirect é clicado então stynx-confirm-dialog abre com message rait.screens.protocolo-redirecionamentos.confirm.redirect', async () => {
    const { harness } = await render('rait-secretary');
    const dialog = clickRedirect(harness);
    expect(dialog.message).toBe(
      'rait.screens.protocolo-redirecionamentos.confirm.redirect',
    );
  });

  it('dado o diálogo de redirect confirmado então a facade é chamada uma vez com rait-case:redirect', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickRedirect(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:redirect',
    );
  });

  it('dado o diálogo de redirect dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickRedirect(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('RedirectsPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-secretary');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
