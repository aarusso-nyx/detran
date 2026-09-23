// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 29, §6.2, §8 —
// C-2B-65/69/70/71/72/80. `BatchDetailPageComponent` (IU-RAIT-029) ainda não existe
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
import type { BatchBundle } from '../../../data/facades/bundles';

const ACTION_KEY = 'inf:rait-batch:approve';

function sessionFacadeStub(bundle: BatchBundle | null = null) {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub<BatchBundle>(
      bundle ? { status: 'ready', value: bundle } : { status: 'idle' },
    ),
    relatoria: listFacadeStub([]),
    pautaCandidatos: listFacadeStub([]),
    vistas: listFacadeStub([]),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
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
    `/${substituteRouteParams('colegiado/:orgao/distribuicao/:loteId')}`,
  );
  return { harness, facade };
}

describe('BatchDetailPage — C-2B-65 (estados)', () => {
  it('dado lote em loading quando renderizada então detran-loading-state', async () => {
    const facade = sessionFacadeStub();
    facade.lote.set({ status: 'loading' });
    const { harness } = await render('rait-chair', facade);
    expect(
      harness.routeNativeElement?.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

describe('BatchDetailPage — matriz §6.2 (C-2B-69/70): rait-batch:approve', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão approve ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="approve"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

function clickApprove(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="approve"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('BatchDetailPage — C-2B-71 (confirmação de approve)', () => {
  it('dado rait-chair quando o botão approve é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-distribuicao-loteId.confirm.approve', async () => {
    const { harness } = await render('rait-chair');
    const dialog = clickApprove(harness);
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-distribuicao-loteId.confirm.approve',
    );
  });

  it('dado o diálogo de approve confirmado então a facade é chamada uma vez com rait-batch:approve', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickApprove(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-batch:approve',
    );
  });

  it('dado o diálogo de approve dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickApprove(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('BatchDetailPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-chair');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
