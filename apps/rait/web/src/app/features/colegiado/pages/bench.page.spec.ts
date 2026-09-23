// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 35, §6.2, §8 —
// C-2B-65/69/70/80. `attendance:confirm`/`summon-substitute` são de fonte só-ficha
// (OD-R12-027) e não constam de nenhum papel em `ROLE_PERMISSIONS_FIXTURE` hoje → só 13
// negativos, nenhum positivo. `BenchPageComponent` (IU-RAIT-035) ainda não existe (TASK-0015):
// falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
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
import { createSessionStub } from '../../../../testing/session.stub';
import { createStynxSessionStub } from '../../../../testing/stynx-session.stub';
import { RaitSessionFacade } from '../../../core/session.facade';
import { SessionFacade } from '../../../data/facades/session.facade';

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
    confirmAttendance: commandMethod('rait-attendance:confirm', command),
    summonSubstitute: commandMethod(
      'rait-attendance:summon-substitute',
      command,
    ),
    command,
  });
}

async function render(role: string) {
  const facade = sessionFacadeStub();
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: SessionFacade, useValue: facade },
    ]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('colegiado/:orgao/sessoes/:id/banca')}`,
  );
  return { harness, facade };
}

describe('BenchPage — C-2B-65 (estado) e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhuma violação a11y', async () => {
    const { harness } = await render('rait-secretary');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});

describe('BenchPage — matriz §6.2 (C-2B-69/70): confirm/summon-substitute (ficha, OD-R12-027)', () => {
  const ACTIONS = [
    {
      key: 'inf:rait-attendance:confirm',
      selector: '[data-action="confirm"]',
    },
    {
      key: 'inf:rait-attendance:summon-substitute',
      selector: '[data-action="summon-substitute"]',
    },
  ] as const;

  ACTIONS.forEach(({ key, selector }) => {
    RAIT_ALL_ROLES.forEach((role) => {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e ação "${key}" quando renderizado então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
        const { harness } = await render(role);
        const button = harness.routeNativeElement?.querySelector(selector);
        if (granted) expect(button).not.toBeNull();
        else expect(button).toBeNull();
      });
    });
  });
});

/**
 * Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo,
 * inclusive `confirm`/`summon_substitute` — mas `inf:rait-attendance:confirm`/
 * `inf:rait-attendance:summon-substitute` são de fonte só-ficha (OD-R12-027) e NENHUM dos 13
 * papéis de `ROLE_PERMISSIONS_FIXTURE` os concede hoje (provado pela matriz acima: 13
 * negativos). Sem um papel real com a permissão, o botão nunca renderiza via `pageProviders`
 * normal — a única forma de exercitar o diálogo sem inventar um valor de catálogo (as CHAVES de
 * permissão em si são reais, de `RAIT_COMMAND_RULES`) é conceder a permissão pontualmente à
 * sessão de teste, por cima de `rait-secretary`, só para provar a fiação diálogo → facade; a
 * matriz acima continua sendo a prova de autorização por papel.
 */
function renderWithPermission(extraPermission: string) {
  const role = 'rait-secretary';
  const facade = sessionFacadeStub();
  return (async () => {
    const harness = await createRaitRouterHarness(
      pageProviders(role as never, [
        {
          provide: RaitSessionFacade,
          useValue: createSessionStub({
            active: true,
            roles: [role],
            permissions: [...ROLE_PERMISSIONS_FIXTURE[role], extraPermission],
          }),
        },
        {
          provide: StynxSessionService,
          useValue: createStynxSessionStub({
            active: true,
            permissions: [...ROLE_PERMISSIONS_FIXTURE[role], extraPermission],
            claims: { roles: [role] },
          }),
        },
        { provide: SessionFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/sessoes/:id/banca')}`,
    );
    return { harness, facade };
  })();
}

function clickAction(
  harness: Awaited<ReturnType<typeof renderWithPermission>>['harness'],
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

describe('BenchPage — C-2B-71 (confirmação de confirm)', () => {
  it('dado uma sessão com inf:rait-attendance:confirm quando o botão confirm é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id-banca.confirm.confirm', async () => {
    const { harness } = await renderWithPermission(
      'inf:rait-attendance:confirm',
    );
    const dialog = clickAction(harness, '[data-action="confirm"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.confirm',
    );
  });

  it('dado o diálogo de confirm confirmado então a facade é chamada uma vez com rait-attendance:confirm', async () => {
    const { harness, facade } = await renderWithPermission(
      'inf:rait-attendance:confirm',
    );
    const dialog = clickAction(harness, '[data-action="confirm"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-attendance:confirm',
    );
  });

  it('dado o diálogo de confirm dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithPermission(
      'inf:rait-attendance:confirm',
    );
    const dialog = clickAction(harness, '[data-action="confirm"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('BenchPage — C-2B-71 (confirmação de summon_substitute)', () => {
  it('dado uma sessão com inf:rait-attendance:summon-substitute quando o botão summon-substitute é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id-banca.confirm.summon_substitute', async () => {
    const { harness } = await renderWithPermission(
      'inf:rait-attendance:summon-substitute',
    );
    const dialog = clickAction(harness, '[data-action="summon-substitute"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.summon_substitute',
    );
  });

  it('dado o diálogo de summon_substitute confirmado então a facade é chamada uma vez com rait-attendance:summon-substitute', async () => {
    const { harness, facade } = await renderWithPermission(
      'inf:rait-attendance:summon-substitute',
    );
    const dialog = clickAction(harness, '[data-action="summon-substitute"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-attendance:summon-substitute',
    );
  });

  it('dado o diálogo de summon_substitute dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithPermission(
      'inf:rait-attendance:summon-substitute',
    );
    const dialog = clickAction(harness, '[data-action="summon-substitute"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});
