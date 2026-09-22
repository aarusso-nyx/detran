// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 32, §6.2, §8 —
// C-2B-65/67/69/70/71/72/73/80. `AgendaBuilderPageComponent` (IU-RAIT-032) ainda não existe
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
import type { RaitCase } from '../../../data/models';

const ACTION_KEY = 'inf:rait-agenda:close';

function sessionFacadeStub(candidates: readonly RaitCase[] = []) {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub({ status: 'idle' }),
    lotes: listFacadeStub([]),
    lote: readSlotStub({ status: 'idle' }),
    relatoria: listFacadeStub([]),
    pautaCandidatos: listFacadeStub(candidates),
    vistas: listFacadeStub([]),
    extraordinaria: listFacadeStub([]),
    semRelator: listFacadeStub([]),
    itemDoCaso: readSlotStub({ status: 'idle' }),
    suplentes: listFacadeStub([]),
    pautaCandidatosRelogios: (() => new Map()) as never,
    extraordinariaCasos: (() => new Map()) as never,
    closeAgenda: commandMethod('rait-agenda:close', command),
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
    `/${substituteRouteParams('colegiado/:orgao/pauta')}`,
  );
  return { harness, facade };
}

describe('AgendaBuilderPage — C-2B-65 (estados)', () => {
  it('dado pautaCandidatos vazio quando renderizada então detran-empty-state', async () => {
    const { harness } = await render('rait-chair');
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('AgendaBuilderPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const { harness, facade } = await render('rait-chair');
    await harness.navigateByUrl(
      `/${substituteRouteParams('colegiado/:orgao/pauta')}?pagina=2`,
    );
    const calls = [
      ...facade.pautaCandidatos.loadMock.mock.calls,
      ...facade.pautaCandidatos.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('AgendaBuilderPage — matriz §6.2 (C-2B-69/70): rait-agenda:close', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão close ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const { harness } = await render(role);
      const button = harness.routeNativeElement?.querySelector(
        '[data-action="close"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

describe('AgendaBuilderPage — C-2B-73 (formulário pauta vazio)', () => {
  it('dado o formulário enviado sem sessionId/items quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const host = harness.routeNativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

function clickClose(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  const host = harness.routeNativeElement as HTMLElement;
  host
    .querySelector<HTMLButtonElement>('[data-action="close"]')
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves do catálogo.
describe('AgendaBuilderPage — C-2B-71 (confirmação de close)', () => {
  it('dado rait-chair quando o botão close é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-pauta.confirm.close', async () => {
    const { harness } = await render('rait-chair');
    const dialog = clickClose(harness);
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-pauta.confirm.close',
    );
  });

  it('dado o diálogo de close confirmado então a facade é chamada uma vez com rait-agenda:close', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickClose(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-agenda:close');
  });

  it('dado o diálogo de close dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-chair');
    const dialog = clickClose(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('AgendaBuilderPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-chair');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
