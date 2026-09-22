// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 36, §6.2, §8 —
// C-2B-65/69/70/71/72/80. `MinutesPageComponent` (IU-RAIT-036) ainda não existe (TASK-0015):
// falha de módulo esperada.
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
import { SignatureDialogComponent } from '../../../shared/signature-dialog.component';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { SessionFacade } from '../../../data/facades/session.facade';
import type { SessionBundle } from '../../../data/facades/bundles';
import { fixtureSession, SESSION_IDS } from '../../../../testing/http-fixtures';
import type { RaitMinutes } from '../../../data/models';

/** `sign`/`publish` exigem `minutes() !== null` (`facade.sessao.value()?.minutes`). */
const BUNDLE_WITH_MINUTES: SessionBundle = {
  session: fixtureSession(SESSION_IDS.ATA_ASSINADA),
  items: [],
  attendance: [],
  votes: [],
  bench: null,
  minutes: { id: 'min-1' } as unknown as RaitMinutes,
  cases: new Map(),
};

function sessionFacadeStub(bundle: SessionBundle | null = null) {
  const command = commandRunnerStub();
  return stubFacade<SessionFacade>()({
    sessoes: listFacadeStub([]),
    sessao: readSlotStub<SessionBundle>(
      bundle ? { status: 'ready', value: bundle } : { status: 'idle' },
    ),
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
    generateMinutes: commandMethod('rait-minutes:generate', command),
    signMinutes: commandMethod('rait-minutes:sign', command),
    publishMinutes: commandMethod('rait-minutes:publish', command),
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
    `/${substituteRouteParams('colegiado/:orgao/sessoes/:id/ata')}`,
  );
  return { harness, facade };
}

describe('MinutesPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    { key: 'inf:rait-minutes:generate', selector: '[data-action="generate"]' },
    { key: 'inf:rait-minutes:sign', selector: '[data-action="sign"]' },
    { key: 'inf:rait-minutes:publish', selector: '[data-action="publish"]' },
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
// as três desta página (`generate`, `sign`, `publish`), 3 `it` cada.
describe('MinutesPage — C-2B-71 (confirmação de generate)', () => {
  it('dado rait-secretary quando o botão generate é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id-ata.confirm.generate', async () => {
    const { harness } = await render('rait-secretary');
    const dialog = clickAction(harness, '[data-action="generate"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.generate',
    );
  });

  it('dado o diálogo de generate confirmado então a facade é chamada uma vez com rait-minutes:generate', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickAction(harness, '[data-action="generate"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-minutes:generate',
    );
  });

  it('dado o diálogo de generate dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-secretary');
    const dialog = clickAction(harness, '[data-action="generate"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

/** `sign` abre o `<rait-signature-dialog>` (`SignatureDialogComponent`, que embrulha seu PRÓPRIO
 * `StynxConfirmDialogComponent`) — o `<stynx-confirm-dialog>` genérico da fila `confirm`
 * compartilhada TAMBÉM está sempre no DOM (usado por `generate`/`publish`), então há DUAS
 * instâncias simultâneas; `By.directive(...).query()` pega a primeira em ordem de documento (a
 * genérica, vazia). Busca-se a instância DENTRO de `SignatureDialogComponent`. */
function clickSign(
  harness: Awaited<ReturnType<typeof render>>['harness'],
): StynxConfirmDialogComponent {
  clickAction(harness, '[data-action="sign"]');
  return harness.fixture.debugElement
    .query(By.directive(SignatureDialogComponent))
    .query(By.directive(StynxConfirmDialogComponent)).componentInstance;
}

describe('MinutesPage — C-2B-71 (confirmação de sign)', () => {
  it('dado rait-secretary com ata gerada quando o botão sign é clicado então stynx-confirm-dialog (rait-signature-dialog) abre com message rait.screens.colegiado-orgao-sessoes-id-ata.confirm.sign', async () => {
    const { harness } = await render(
      'rait-secretary',
      sessionFacadeStub(BUNDLE_WITH_MINUTES),
    );
    const dialog = clickSign(harness);
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.sign',
    );
  });

  it('dado o diálogo de sign confirmado então a facade é chamada uma vez com rait-minutes:sign', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      sessionFacadeStub(BUNDLE_WITH_MINUTES),
    );
    const dialog = clickSign(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-minutes:sign');
  });

  it('dado o diálogo de sign dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      sessionFacadeStub(BUNDLE_WITH_MINUTES),
    );
    const dialog = clickSign(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('MinutesPage — C-2B-71 (confirmação de publish)', () => {
  it('dado rait-secretary com ata gerada quando o botão publish é clicado então stynx-confirm-dialog abre com message rait.screens.colegiado-orgao-sessoes-id-ata.confirm.publish', async () => {
    const { harness } = await render(
      'rait-secretary',
      sessionFacadeStub(BUNDLE_WITH_MINUTES),
    );
    const dialog = clickAction(harness, '[data-action="publish"]');
    expect(dialog.message).toBe(
      'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.publish',
    );
  });

  it('dado o diálogo de publish confirmado então a facade é chamada uma vez com rait-minutes:publish', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      sessionFacadeStub(BUNDLE_WITH_MINUTES),
    );
    const dialog = clickAction(harness, '[data-action="publish"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-minutes:publish',
    );
  });

  it('dado o diálogo de publish dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-secretary',
      sessionFacadeStub(BUNDLE_WITH_MINUTES),
    );
    const dialog = clickAction(harness, '[data-action="publish"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('MinutesPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render('rait-secretary');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
