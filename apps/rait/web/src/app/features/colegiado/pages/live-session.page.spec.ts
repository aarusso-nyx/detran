// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 34, §6.2, §8 —
// C-2B-65/69/70/71/72/73/76/80. `LiveSessionPageComponent` (IU-RAIT-034) ainda não existe
// (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { describe, expect, it, vi } from 'vitest';
import {
  commandMethod,
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { SESSION_IDS } from '../../../../testing/http-fixtures';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import { createRaitRouterHarness } from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import type { SessionBundle } from '../../../data/facades/bundles';
import type {
  RaitAgendaItem,
  RaitBench,
  RaitSession,
} from '../../../data/models';

/** `view-request`/`proclaim`/`vote`/`casting-vote` exigem `currentItem() !== null`: um item lido
 * e não proclamado (ficha 034). */
const CURRENT_ITEM = {
  id: 'item-1',
  session_id: SESSION_IDS.SESSAO_ABERTA,
  case_id: 'case-1',
  read_at: '2026-01-01T00:00:00Z',
  proclaimed_at: null,
} as unknown as RaitAgendaItem;

function bundle(
  benchState: RaitBench['state'],
  items: readonly RaitAgendaItem[] = [],
): SessionBundle {
  return {
    session: {
      id: SESSION_IDS.SESSAO_ABERTA,
      judging_body: 'cetran',
      state: 'SESSAO_ABERTA',
    } as unknown as RaitSession,
    items,
    attendance: [],
    votes: [],
    bench: {
      id: 'bench-1',
      session_id: SESSION_IDS.SESSAO_ABERTA,
      state: benchState,
      confirmed_count: benchState === 'BANCA_CONFIRMADA' ? 3 : 2,
    } as unknown as RaitBench,
    minutes: null,
    cases: new Map(),
  };
}

function sessionFacadeStub(sessao: SessionBundle) {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub<SessionBundle>({ status: 'ready', value: sessao }),
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
    openSession: commandMethod('rait-session:open', command),
    adjournSession: commandMethod('rait-session:adjourn', command),
    requestView: commandMethod('rait-session:view-request', command),
    proclaim: commandMethod('rait-session:proclaim', command),
    vote: commandMethod('rait-session:vote', command),
    castingVote: commandMethod('rait-session:casting-vote', command),
    command,
  });
}

function sseServiceStub(connect: (options: unknown) => void) {
  return {
    status: () => 'live' as const,
    polling: () => false,
    live: () => true,
    connect,
  } as unknown as SseService;
}

async function render(
  role: string,
  benchState: RaitBench['state'] = 'BANCA_CONFIRMADA',
  items: readonly RaitAgendaItem[] = [],
) {
  const facade = sessionFacadeStub(bundle(benchState, items));
  const connect = vi.fn();
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: SessionFacade, useValue: facade },
      { provide: SseService, useValue: sseServiceStub(connect) },
    ]),
  );
  await harness.navigateByUrl(
    `/colegiado/cetran/sessoes/${SESSION_IDS.SESSAO_ABERTA}`,
  );
  return { harness, facade, connect };
}

/** `view-request`/`proclaim`/`vote`/`casting-vote` (C-2B-71) precisam de `CURRENT_ITEM`. */
function renderWithItem(role: string) {
  return render(role, 'BANCA_CONFIRMADA', [CURRENT_ITEM]);
}

describe('LiveSessionPage — C-2B-76 (quorum CETRAN, sessão 4)', () => {
  it('dado bench BANCA_INSUFICIENTE quando renderizada então rait.screens.colegiado-orgao-sessoes-id.state.no_quorum visível e sse.connect chamado com { sessionId }', async () => {
    const { harness, connect } = await render(
      'rait-chair',
      'BANCA_INSUFICIENTE',
    );
    const host = harness.routeNativeElement as HTMLElement;
    expect(host.textContent ?? '').toContain(
      'rait.screens.colegiado-orgao-sessoes-id.state.no_quorum',
    );
    expect(connect).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: SESSION_IDS.SESSAO_ABERTA }),
    );
  });

  it('dado bench BANCA_CONFIRMADA quando renderizada então nenhum state.no_quorum [negativo]', async () => {
    const { harness } = await render('rait-chair', 'BANCA_CONFIRMADA');
    const host = harness.routeNativeElement as HTMLElement;
    expect(host.textContent ?? '').not.toContain(
      'rait.screens.colegiado-orgao-sessoes-id.state.no_quorum',
    );
  });
});

describe('LiveSessionPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-session:open', selector: '[data-action="open"]' },
    { key: 'inf:rait-session:adjourn', selector: '[data-action="adjourn"]' },
    { key: 'inf:rait-session:vote', selector: '[data-action="vote"]' },
    {
      key: 'inf:rait-session:casting-vote',
      selector: '[data-action="casting-vote"]',
    },
    {
      key: 'inf:rait-session:view-request',
      selector: '[data-action="view-request"]',
    },
    { key: 'inf:rait-session:proclaim', selector: '[data-action="proclaim"]' },
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

describe('LiveSessionPage — C-2B-73 (formulário sessao-ao-vivo vazio)', () => {
  it('dado o formulário de voto enviado sem vote quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="vote"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
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

function fillVoteAndClick(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  selector: string,
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  const vote = host.querySelector<HTMLSelectElement>('#rait-live-session-vote');
  if (vote) {
    vote.value = 'provimento';
    vote.dispatchEvent(new Event('change'));
  }
  harness.detectChanges();
  return clickAction(harness, selector);
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo —
// as seis desta página (`open`, `adjourn`, `view_request`, `proclaim`, `vote`, `casting_vote`), 3
// `it` cada.
describe('LiveSessionPage — C-2B-71 (confirmação de open)', () => {
  it('dado rait-chair quando o botão open é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id.confirm.open', async () => {
    const { harness } = await render('rait-chair');
    const dialog = clickAction(harness, '[data-action="open"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id.confirm.open',
    );
  });

  it('dado o diálogo de open confirmado então a facade é chamada uma vez com rait-session:open', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickAction(harness, '[data-action="open"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-session:open');
  });

  it('dado o diálogo de open dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickAction(harness, '[data-action="open"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('LiveSessionPage — C-2B-71 (confirmação de adjourn)', () => {
  it('dado rait-chair quando o botão adjourn é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id.confirm.adjourn', async () => {
    const { harness } = await render('rait-chair');
    const dialog = clickAction(harness, '[data-action="adjourn"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id.confirm.adjourn',
    );
  });

  it('dado o diálogo de adjourn confirmado então a facade é chamada uma vez com rait-session:adjourn', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickAction(harness, '[data-action="adjourn"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-session:adjourn',
    );
  });

  it('dado o diálogo de adjourn dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickAction(harness, '[data-action="adjourn"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

// `inf:rait-session:view-request` é concedida a `rait-rapporteur` (policy.fixture.ts), não a
// `rait-chair` (que concentra open/adjourn/vote/casting-vote/proclaim/convene-extraordinary).
describe('LiveSessionPage — C-2B-71 (confirmação de view_request)', () => {
  it('dado rait-rapporteur com item corrente quando o botão view-request é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id.confirm.view_request', async () => {
    const { harness } = await renderWithItem('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="view-request"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id.confirm.view_request',
    );
  });

  it('dado o diálogo de view_request confirmado então a facade é chamada uma vez com rait-session:view-request', async () => {
    const { harness, facade } = await renderWithItem('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="view-request"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-session:view-request',
    );
  });

  it('dado o diálogo de view_request dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithItem('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="view-request"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('LiveSessionPage — C-2B-71 (confirmação de proclaim)', () => {
  it('dado rait-chair com item corrente quando o botão proclaim é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id.confirm.proclaim', async () => {
    const { harness } = await renderWithItem('rait-chair');
    const dialog = clickAction(harness, '[data-action="proclaim"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id.confirm.proclaim',
    );
  });

  it('dado o diálogo de proclaim confirmado então a facade é chamada uma vez com rait-session:proclaim', async () => {
    const { harness, facade } = await renderWithItem('rait-chair');
    const dialog = clickAction(harness, '[data-action="proclaim"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-session:proclaim',
    );
  });

  it('dado o diálogo de proclaim dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithItem('rait-chair');
    const dialog = clickAction(harness, '[data-action="proclaim"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('LiveSessionPage — C-2B-71 (confirmação de vote)', () => {
  it('dado rait-chair com item corrente e vote preenchido quando o botão vote é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id.confirm.vote', async () => {
    const { harness } = await renderWithItem('rait-chair');
    const dialog = fillVoteAndClick(harness, '[data-action="vote"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id.confirm.vote',
    );
  });

  it('dado o diálogo de vote confirmado então a facade é chamada uma vez com rait-session:vote', async () => {
    const { harness, facade } = await renderWithItem('rait-chair');
    const dialog = fillVoteAndClick(harness, '[data-action="vote"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-session:vote');
  });

  it('dado o diálogo de vote dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithItem('rait-chair');
    const dialog = fillVoteAndClick(harness, '[data-action="vote"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('LiveSessionPage — C-2B-71 (confirmação de casting_vote)', () => {
  it('dado rait-chair com item corrente e vote preenchido quando o botão casting-vote é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id.confirm.casting_vote', async () => {
    const { harness } = await renderWithItem('rait-chair');
    const dialog = fillVoteAndClick(harness, '[data-action="casting-vote"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id.confirm.casting_vote',
    );
  });

  it('dado o diálogo de casting_vote confirmado então a facade é chamada uma vez com rait-session:casting-vote', async () => {
    const { harness, facade } = await renderWithItem('rait-chair');
    const dialog = fillVoteAndClick(harness, '[data-action="casting-vote"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-session:casting-vote',
    );
  });

  it('dado o diálogo de casting_vote dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithItem('rait-chair');
    const dialog = fillVoteAndClick(harness, '[data-action="casting-vote"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('LiveSessionPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-chair');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
