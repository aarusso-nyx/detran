// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 38, §6.2, §8 —
// C-2B-65/67/69/70/71/72/73/80. `ExtraordinaryPageComponent` (IU-RAIT-038) ainda não existe
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
import { SessionFacade } from '../../../data/facades/session.facade';

const ACTION_KEY = 'inf:rait-session:convene-extraordinary';

function sessionFacadeStub() {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub({ status: 'idle' }),
    relatoria: listFacadeStub([]),
    pautaCandidatos: listFacadeStub([]),
    vistas: listFacadeStub([]),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
    conveneExtraordinary: commandMethod(
      'rait-session:convene-extraordinary',
      command,
    ),
    command,
  });
}

async function render(role: string, facade = sessionFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: SessionFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('colegiado/:orgao/extraordinaria')}`,
  );
  return { harness, facade };
}

describe('ExtraordinaryPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { harness, facade } = await render('rait-chair');
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/extraordinaria')}?pagina=2`,
    );
    const calls = [
      ...facade.extraordinaria.loadMock.mock.calls,
      ...facade.extraordinaria.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('ExtraordinaryPage — matriz §6.2 (C-2B-69/70): convene-extraordinary', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão convene ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="convene"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

describe('ExtraordinaryPage — C-2B-73 (formulário extraordinária vazio)', () => {
  it('dado o formulário enviado sem scheduledFor/modality quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const host = harness.routeNativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

function clickConvene(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="convene"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('ExtraordinaryPage — C-2B-71 (confirmação de convene)', () => {
  it('dado rait-chair quando o botão convene é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-extraordinaria.confirm.convene', async () => {
    const { harness } = await render('rait-chair');
    const dialog = clickConvene(harness);
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-extraordinaria.confirm.convene',
    );
  });

  it('dado o diálogo de convene confirmado então a facade é chamada uma vez com rait-session:convene-extraordinary', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickConvene(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-session:convene-extraordinary',
    );
  });

  it('dado o diálogo de convene dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickConvene(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('ExtraordinaryPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-chair');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
