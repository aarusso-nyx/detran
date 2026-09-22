// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 30, §6.2, §8 —
// C-2B-65/67/69/70/71/72/80. `RapporteurCasesPageComponent` (IU-RAIT-030) ainda não existe
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
import type { RaitBatchItem } from '../../../data/models';

function sessionFacadeStub(items: readonly RaitBatchItem[] = []) {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub({ status: 'idle' }),
    relatoria: listFacadeStub(items),
    pautaCandidatos: listFacadeStub([]),
    vistas: listFacadeStub([]),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
    acceptBatchItem: commandMethod('rait-batch:accept', command),
    impedeBatchItem: commandMethod('rait-batch:impede', command),
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
    `/${substituteRouteParams('colegiado/:orgao/relatoria')}`,
  );
  return { harness, facade };
}

describe('RapporteurCasesPage — C-2B-65 (estados)', () => {
  it('dado relatoria vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-rapporteur');
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('RapporteurCasesPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/relatoria')}?pagina=2`,
    );
    const calls = [
      ...facade.relatoria.loadMock.mock.calls,
      ...facade.relatoria.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('RapporteurCasesPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-batch:accept', selector: '[data-action="accept"]' },
    { key: 'inf:rait-batch:impede', selector: '[data-action="impede"]' },
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
// as duas desta página (`accept`, `impede`), 3 `it` cada.
describe('RapporteurCasesPage — C-2B-71 (confirmação de accept)', () => {
  it('dado rait-rapporteur quando o botão accept é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-relatoria.confirm.accept', async () => {
    const { harness } = await render('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="accept"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-relatoria.confirm.accept',
    );
  });

  it('dado o diálogo de accept confirmado então a facade é chamada uma vez com rait-batch:accept', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="accept"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-batch:accept');
  });

  it('dado o diálogo de accept dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="accept"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('RapporteurCasesPage — C-2B-71 (confirmação de impede)', () => {
  it('dado rait-rapporteur quando o botão impede é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-relatoria.confirm.impede', async () => {
    const { harness } = await render('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="impede"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-relatoria.confirm.impede',
    );
  });

  it('dado o diálogo de impede confirmado então a facade é chamada uma vez com rait-batch:impede', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="impede"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-batch:impede');
  });

  it('dado o diálogo de impede dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-rapporteur');
    const dialog = clickAction(harness, '[data-action="impede"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('RapporteurCasesPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-rapporteur');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
