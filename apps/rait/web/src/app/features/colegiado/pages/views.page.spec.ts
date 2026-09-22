// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 37, §6.2, §8 —
// C-2B-65/67/69/70/73/80. `register-view-vote` é de fonte só-ficha (OD-R12-027) e não consta de
// nenhum papel em `ROLE_PERMISSIONS_FIXTURE` hoje → só 13 negativos. `ViewsPageComponent`
// (IU-RAIT-037) ainda não existe (TASK-0015): falha de módulo esperada.
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
import type { RaitAgendaItem } from '../../../data/models';

/** Item para `selected() !== null` (habilita `data-action="register-view-vote"`). */
const VIEW_ITEM = {
  id: 'item-1',
  tenant_id: 'tenant-1',
  session_id: 'session-1',
  case_id: 'case-1',
  position: 0,
  priority: false,
  rapporteur_member_id: 'user-1',
  withdrawn: false,
  version: 1,
  created_at: '2026-01-01',
} as unknown as RaitAgendaItem;

const ACTION_KEY = 'inf:rait-session:register-view-vote';

function sessionFacadeStub(items: readonly RaitAgendaItem[] = []) {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub({ status: 'idle' }),
    relatoria: listFacadeStub([]),
    pautaCandidatos: listFacadeStub([]),
    vistas: listFacadeStub(items),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
    registerViewVote: commandMethod('rait-session:register-view-vote', command),
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
    `/${substituteRouteParams('colegiado/:orgao/vistas')}`,
  );
  return { harness, facade };
}

describe('ViewsPage — C-2B-65 (estados)', () => {
  it('dado vistas vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-chair');
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('ViewsPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { harness, facade } = await render('rait-chair');
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/vistas')}?pagina=2`,
    );
    const calls = [
      ...facade.vistas.loadMock.mock.calls,
      ...facade.vistas.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('ViewsPage — matriz §6.2 (C-2B-69/70): register-view-vote (ficha, OD-R12-027)', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão register-view-vote ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="register-view-vote"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

/**
 * Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo,
 * inclusive `register_view_vote` — mas `inf:rait-session:register-view-vote` é de fonte só-ficha
 * (OD-R12-027) e NENHUM dos 13 papéis a concede hoje (13 negativos, matriz acima). A permissão é
 * concedida pontualmente à sessão de teste (chave real de `RAIT_COMMAND_RULES`, nunca inventada)
 * só para provar a fiação diálogo → facade; a matriz continua sendo a prova de autorização.
 */
function renderWithPermission() {
  const role = 'rait-chair';
  const facade = sessionFacadeStub([VIEW_ITEM]);
  return (async () => {
    const harness = await createRaitRouterHarness(
      pageProviders(role as never, [
        {
          provide: RaitSessionFacade,
          useValue: createSessionStub({
            active: true,
            roles: [role],
            permissions: [...ROLE_PERMISSIONS_FIXTURE[role], ACTION_KEY],
          }),
        },
        {
          provide: StynxSessionService,
          useValue: createStynxSessionStub({
            active: true,
            permissions: [...ROLE_PERMISSIONS_FIXTURE[role], ACTION_KEY],
            claims: { roles: [role] },
          }),
        },
        { provide: SessionFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/vistas')}`,
    );
    return { harness, facade };
  })();
}

function selectItemVoteAndClick(
  harness: Awaited<ReturnType<typeof renderWithPermission>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  const item = host.querySelector<HTMLSelectElement>('#rait-views-item');
  if (item) {
    item.value = 'item-1';
    item.dispatchEvent(new Event('change'));
  }
  const vote = host.querySelector<HTMLSelectElement>('#rait-views-vote');
  if (vote) {
    vote.value = 'provimento';
    vote.dispatchEvent(new Event('change'));
  }
  harness.detectChanges();
  host
    .querySelector<HTMLButtonElement>('[data-action="register-view-vote"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

describe('ViewsPage — C-2B-71 (confirmação de register_view_vote)', () => {
  it('dado uma sessão com inf:rait-session:register-view-vote, item e voto selecionados quando o botão register-view-vote é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-vistas.confirm.register_view_vote', async () => {
    const { harness } = await renderWithPermission();
    const dialog = selectItemVoteAndClick(harness);
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-vistas.confirm.register_view_vote',
    );
  });

  it('dado o diálogo de register_view_vote confirmado então a facade é chamada uma vez com rait-session:register-view-vote', async () => {
    const { harness, facade } = await renderWithPermission();
    const dialog = selectItemVoteAndClick(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-session:register-view-vote',
    );
  });

  it('dado o diálogo de register_view_vote dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithPermission();
    const dialog = selectItemVoteAndClick(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('ViewsPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-chair');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
