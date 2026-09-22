// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 21, §6.2, §8 —
// C-2B-65/67/69/70/71/72/80. `RemittancesPageComponent` (IU-RAIT-022) ainda não existe
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
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import type { RaitCase } from '../../../data/models';

function protocolFacadeStub(items: readonly RaitCase[] = []) {
  const remessas = listFacadeStub(items);
  const command = commandRunnerStub();
  return stubFacade<ProtocolFacade>()({
    intake: listFacadeStub([]),
    pendencias: listFacadeStub([]),
    remessas,
    loadRemittances: delegateListLoad(remessas),
    redirecionamentos: listFacadeStub([]),
    desistenciaCaso: readSlotStub({ status: 'idle' }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    remitJari: commandMethod('rait-case:remit-jari', command),
    receiveJudgingBody: commandMethod(
      'rait-case:receive-judging-body',
      command,
    ),
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
    `/${substituteRouteParams('protocolo/remessas')}`,
  );
  return { harness, facade };
}

describe('RemittancesPage — C-2B-65 (estados)', () => {
  it('dado remessas em loading quando renderizada então detran-loading-state', async () => {
    const facade = protocolFacadeStub();
    facade.remessas.set({ status: 'loading' });
    const { harness } = await render('rait-secretary', facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

describe('RemittancesPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const facade = protocolFacadeStub();
    const harness = await createRaitRouterHarness(
      pageProviders('rait-secretary', [
        { provide: ProtocolFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('protocolo/remessas')}?pagina=2`,
    );
    const calls = [
      ...facade.remessas.loadMock.mock.calls,
      ...facade.remessas.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('RemittancesPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-case:remit-jari', selector: '[data-action="remit"]' },
    {
      key: 'inf:rait-case:receive-judging-body',
      selector: '[data-action="receive"]',
    },
  ] as const;

  ACTIONS.forEach(({ key, selector }) => {
    RAIT_ALL_ROLES.forEach((role) => {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e ação "${key}" quando renderizado então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
        const { harness } = await render(
          role,
          protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
        );
        const button = harness.routeNativeElement?.querySelector(selector);
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
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>(selector)
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo —
// as duas desta página (`remit`, `receive`), 3 `it` cada.
describe('RemittancesPage — C-2B-71 (confirmação de remit)', () => {
  it('dado rait-secretary quando o botão remit é clicado então stynx-confirm-dialog abre com message rait.screens.protocolo-remessas.confirm.remit', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    const dialog = clickAction(harness, '[data-action="remit"]');
    expect(dialog.message).toBe(
      'rait.screens.protocolo-remessas.confirm.remit',
    );
  });

  it('dado o diálogo de remit confirmado então a facade é chamada uma vez com rait-case:remit-jari', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    const dialog = clickAction(harness, '[data-action="remit"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:remit-jari',
    );
  });

  it('dado o diálogo de remit dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    const dialog = clickAction(harness, '[data-action="remit"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('RemittancesPage — C-2B-71 (confirmação de receive)', () => {
  it('dado rait-secretary quando o botão receive é clicado então stynx-confirm-dialog abre com message rait.screens.protocolo-remessas.confirm.receive', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    const dialog = clickAction(harness, '[data-action="receive"]');
    expect(dialog.message).toBe(
      'rait.screens.protocolo-remessas.confirm.receive',
    );
  });

  it('dado o diálogo de receive confirmado então a facade é chamada uma vez com rait-case:receive-judging-body', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    const dialog = clickAction(harness, '[data-action="receive"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:receive-judging-body',
    );
  });

  it('dado o diálogo de receive dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    const dialog = clickAction(harness, '[data-action="receive"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('RemittancesPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub([fixtureCase(CASE_IDS.AGUARDANDO_REMESSA_JARI)]),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
