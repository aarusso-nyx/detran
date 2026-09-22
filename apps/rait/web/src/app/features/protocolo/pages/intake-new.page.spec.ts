// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 19, §6.2, §8 —
// C-2B-65/69/70/71/72/73/80. `IntakeNewPageComponent` (IU-RAIT-020) ainda não existe
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
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';

const ACTION_KEY = 'inf:rait-case:protocol';

function protocolFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<ProtocolFacade>()({
    intake: listFacadeStub([]),
    pendencias: listFacadeStub([]),
    remessas: listFacadeStub([]),
    redirecionamentos: listFacadeStub([]),
    desistenciaCaso: readSlotStub({ status: 'idle' }),
    pendenciasCaso: (() => new Map()) as never,
    remessasPrazo: (() => new Map()) as never,
    protocol: commandMethod('rait-case:protocol', command),
    command,
  });
}

async function render(role: string) {
  const facade = protocolFacadeStub();
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: ProtocolFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('protocolo/novo')}`);
  return { harness, facade };
}

describe('IntakeNewPage — matriz §6.2 (C-2B-69/70): rait-case:protocol', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão protocol ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="protocol"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

describe('IntakeNewPage — C-2B-73 (formulário intake-fisico vazio)', () => {
  it('dado o formulário enviado vazio quando submetido então os campos obrigatórios têm aria-invalid="true" e a facade não é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const host = harness.routeNativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
    expect(
      host.querySelectorAll('[aria-invalid="true"]').length,
    ).toBeGreaterThan(0);
  });
});

function clickProtocol(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="protocol"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('IntakeNewPage — C-2B-71 (confirmação de protocol)', () => {
  it('dado rait-secretary quando o botão protocol é clicado então stynx-confirm-dialog abre com message rait.screens.protocolo-novo.confirm.protocol', async () => {
    const { harness } = await render('rait-secretary');
    const dialog = clickProtocol(harness);
    expect(dialog.message).toBe('rait.screens.protocolo-novo.confirm.protocol');
  });

  it('dado o diálogo de protocol confirmado então a facade é chamada uma vez com rait-case:protocol', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickProtocol(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:protocol',
    );
  });

  it('dado o diálogo de protocol dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickProtocol(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('IntakeNewPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-secretary');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
