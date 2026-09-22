// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 23, §6.2, §8 —
// C-2B-65/69/70/71/72/73/75/80. `WithdrawalsPageComponent` (IU-RAIT-024) ainda não existe
// (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
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
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import type { RaitCase } from '../../../data/models';

const ACTION_KEY = 'inf:rait-case:withdraw';

function protocolFacadeStub(desistenciaCaso: RaitCase | null = null) {
  const command = commandRunnerStub();
  return stubFacade<ProtocolFacade>()({
    intake: listFacadeStub([]),
    pendencias: listFacadeStub([]),
    remessas: listFacadeStub([]),
    redirecionamentos: listFacadeStub([]),
    desistenciaCaso: readSlotStub<RaitCase | null>({
      status: desistenciaCaso ? 'ready' : 'idle',
      value: desistenciaCaso,
    }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    withdraw: commandMethod('rait-case:withdraw', command),
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
    `/${substituteRouteParams('protocolo/desistencias')}`,
  );
  return { harness, facade };
}

describe('WithdrawalsPage — C-2B-73 (formulário desistencia vazio)', () => {
  it('dado o formulário enviado sem protocolo/documento quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const host = harness.routeNativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('WithdrawalsPage — matriz §6.2 (C-2B-69/70): rait-case:withdraw', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" e um caso EM_INSTRUCAO carregado quando renderizado então o botão withdraw ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(
        role,
        protocolFacadeStub(fixtureCase(CASE_IDS.EM_INSTRUCAO)),
      );
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="withdraw"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

describe('WithdrawalsPage — C-2B-75 (state.after_decision)', () => {
  it('dado desistenciaCaso = fixtureCase(DECIDIDO_AUTORIDADE) então rait.screens.protocolo-desistencias.state.after_decision visível e o botão withdraw desabilitado', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub(fixtureCase(CASE_IDS.DECIDIDO_AUTORIDADE)),
    );
    const host = harness.routeNativeElement as HTMLElement;
    expect(host.textContent ?? '').toContain(
      'rait.screens.protocolo-desistencias.state.after_decision',
    );
    const button = host.querySelector<HTMLButtonElement>(
      '[data-action="withdraw"]',
    );
    expect(button?.disabled).toBe(true);
  });

  it('dado desistenciaCaso = fixtureCase(EM_INSTRUCAO) então nenhum state.after_decision e o botão habilitado [negativo]', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub(fixtureCase(CASE_IDS.EM_INSTRUCAO)),
    );
    const host = harness.routeNativeElement as HTMLElement;
    expect(host.textContent ?? '').not.toContain(
      'rait.screens.protocolo-desistencias.state.after_decision',
    );
    const button = host.querySelector<HTMLButtonElement>(
      '[data-action="withdraw"]',
    );
    expect(button?.disabled).toBe(false);
  });
});

function clickWithdraw(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="withdraw"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('WithdrawalsPage — C-2B-71 (confirmação de withdraw)', () => {
  it('dado rait-secretary com caso EM_INSTRUCAO quando o botão withdraw é clicado então stynx-confirm-dialog abre com message rait.screens.protocolo-desistencias.confirm.withdraw', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub(fixtureCase(CASE_IDS.EM_INSTRUCAO)),
    );
    const dialog = clickWithdraw(harness);
    expect(dialog.message).toBe(
      'rait.screens.protocolo-desistencias.confirm.withdraw',
    );
  });

  it('dado o diálogo de withdraw confirmado então a facade é chamada uma vez com rait-case:withdraw', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      protocolFacadeStub(fixtureCase(CASE_IDS.EM_INSTRUCAO)),
    );
    const dialog = clickWithdraw(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:withdraw',
    );
  });

  it('dado o diálogo de withdraw dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      protocolFacadeStub(fixtureCase(CASE_IDS.EM_INSTRUCAO)),
    );
    const dialog = clickWithdraw(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('WithdrawalsPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      'rait-secretary',
      protocolFacadeStub(fixtureCase(CASE_IDS.EM_INSTRUCAO)),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
