// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 28, §6.2, §8 —
// C-2B-65/67/69/70/71/72/73/80. `BatchesPageComponent` (IU-RAIT-028) ainda não existe
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
import { SessionFacade } from '../../../data/facades/session.facade';
import type { RaitBatch } from '../../../data/models';

function sessionFacadeStub(items: readonly RaitBatch[] = []) {
  const lotes = listFacadeStub(items);
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes,
    loadBatches: delegateListLoad(lotes),
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
    openBatch: commandMethod('rait-batch:open', command),
    drawBatch: commandMethod('rait-batch:draw', command),
    approveBatch: commandMethod('rait-batch:approve', command),
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
    `/${substituteRouteParams('colegiado/:orgao/distribuicao')}`,
  );
  return { harness, facade };
}

describe('BatchesPage — C-2B-65 (estados)', () => {
  it('dado lotes vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-chair');
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('BatchesPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { harness, facade } = await render('rait-chair');
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/distribuicao')}?pagina=2`,
    );
    const calls = [
      ...facade.lotes.loadMock.mock.calls,
      ...facade.lotes.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('BatchesPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-batch:open', selector: '[data-action="open"]' },
    { key: 'inf:rait-batch:draw', selector: '[data-action="draw"]' },
    { key: 'inf:rait-batch:approve', selector: '[data-action="approve"]' },
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

describe('BatchesPage — C-2B-73 (formulário lote-sorteio vazio)', () => {
  it('dado o formulário enviado sem poolId/kind/weekStart quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const host = harness.routeNativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
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

/** `draw`/`approve` exigem `batchId` selecionado (`targetBatchId()`); `sessionFacadeStub` com um
 * lote fixo habilita o `<select id="rait-batches-target">`. `approve` é concedida só a
 * `rait-chair` (policy.fixture.ts) — diferente de `open`/`draw`, concedidas a `rait-secretary`. */
function renderWithBatch(role: string = 'rait-secretary') {
  return render(
    role,
    sessionFacadeStub([
      {
        id: 'batch-1',
        week_start: '2026-01-05',
        state: 'LOTE_ABERTO',
      } as unknown as RaitBatch,
    ]),
  );
}

function selectBatchAndClick(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  selector: string,
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  const select = host.querySelector<HTMLSelectElement>('#rait-batches-target');
  if (select) {
    select.value = 'batch-1';
    select.dispatchEvent(new Event('change'));
  }
  harness.detectChanges();
  return clickAction(harness, selector);
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo —
// as três desta página (`open`, `draw`, `approve`), 3 `it` cada.
describe('BatchesPage — C-2B-71 (confirmação de open)', () => {
  it('dado rait-secretary quando o botão open é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-distribuicao.confirm.open', async () => {
    const { harness } = await render('rait-secretary');
    const dialog = clickAction(harness, '[data-action="open"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-distribuicao.confirm.open',
    );
  });

  it('dado o diálogo de open confirmado então a facade é chamada uma vez com rait-batch:open', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickAction(harness, '[data-action="open"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-batch:open');
  });

  it('dado o diálogo de open dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickAction(harness, '[data-action="open"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('BatchesPage — C-2B-71 (confirmação de draw)', () => {
  it('dado rait-secretary com batchId selecionado quando o botão draw é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-distribuicao.confirm.draw', async () => {
    const { harness } = await renderWithBatch();
    const dialog = selectBatchAndClick(harness, '[data-action="draw"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-distribuicao.confirm.draw',
    );
  });

  it('dado o diálogo de draw confirmado então a facade é chamada uma vez com rait-batch:draw', async () => {
    const { harness, facade } = await renderWithBatch();
    const dialog = selectBatchAndClick(harness, '[data-action="draw"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-batch:draw');
  });

  it('dado o diálogo de draw dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithBatch();
    const dialog = selectBatchAndClick(harness, '[data-action="draw"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('BatchesPage — C-2B-71 (confirmação de approve)', () => {
  it('dado rait-chair com batchId selecionado quando o botão approve é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-distribuicao.confirm.approve', async () => {
    const { harness } = await renderWithBatch('rait-chair');
    const dialog = selectBatchAndClick(harness, '[data-action="approve"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-distribuicao.confirm.approve',
    );
  });

  it('dado o diálogo de approve confirmado então a facade é chamada uma vez com rait-batch:approve', async () => {
    const { harness, facade } = await renderWithBatch('rait-chair');
    const dialog = selectBatchAndClick(harness, '[data-action="approve"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-batch:approve',
    );
  });

  it('dado o diálogo de approve dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await renderWithBatch('rait-chair');
    const dialog = selectBatchAndClick(harness, '[data-action="approve"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('BatchesPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-chair');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
