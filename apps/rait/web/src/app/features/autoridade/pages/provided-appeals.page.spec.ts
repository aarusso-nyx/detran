// R-0012 TASK-0014 (Inspector, iteração restrita 2). CTG-0002b.md §6 linha 26, §6.2, §8 —
// C-2B-65/67/69/70/71/72/73/80. `ProvidedAppealsPageComponent` (IU-RAIT-027) ainda não existe
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
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { CaseFacade } from '../../../data/facades/case.facade';
import type { RaitCase } from '../../../data/models';

function caseFacadeStub(items: readonly RaitCase[] = []) {
  const provimentos = listFacadeStub(items);
  const command = commandRunnerStub();
  return stubFacade<CaseFacade>()({
    partes: listFacadeStub([]),
    prazos: listFacadeStub([]),
    relogios: listFacadeStub([]),
    documentos: listFacadeStub([]),
    diligencias: listFacadeStub([]),
    minutas: listFacadeStub([]),
    admissibilidade: listFacadeStub([]),
    comunicacoes: listFacadeStub([]),
    eventos: listFacadeStub([]),
    impedimentos: listFacadeStub([]),
    decisao: listFacadeStub([]),
    provimentos,
    loadProvidedAppeals: delegateListLoad(provimentos),
    provimentosDecisao: (() => new Map()) as never,
    provimentosPrazo: (() => new Map()) as never,
    authorityDecide: commandMethod('rait-appeal:authority-decide', command),
    waive: commandMethod('rait-appeal:waive', command),
    command,
  });
}

async function render(role: string, facade = caseFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: CaseFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('autoridade/provimentos')}`,
  );
  return { harness, facade };
}

describe('ProvidedAppealsPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?pagina=2 então setQuery/load chamada', async () => {
    const facade = caseFacadeStub();
    const harness = await createRaitRouterHarness(
      pageProviders('rait-central-authority', [
        { provide: CaseFacade, useValue: facade },
      ]),
    );
    await harness.navigateByUrl(
      `/${substituteRouteParams('autoridade/provimentos')}?pagina=2`,
    );
    const calls = [
      ...facade.provimentos.loadMock.mock.calls,
      ...facade.provimentos.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('ProvidedAppealsPage — matriz §6.2 (C-2B-69/70)', () => {
  const ACTIONS = [
    {
      key: 'inf:rait-appeal:authority-decide',
      selector: '[data-action="appeal"]',
    },
    { key: 'inf:rait-appeal:waive', selector: '[data-action="waive"]' },
  ] as const;

  ACTIONS.forEach(({ key, selector }) => {
    RAIT_ALL_ROLES.forEach((role) => {
      const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(key);
      it(`dado papel "${role}" e ação "${key}" quando renderizado então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
        const { harness } = await render(
          role,
          caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
        );
        const button = harness.routeNativeElement?.querySelector(selector);
        if (granted) expect(button).not.toBeNull();
        else expect(button).toBeNull();
      });
    });
  });
});

describe('ProvidedAppealsPage — C-2B-73 (formulário mínimo sem grounds)', () => {
  it('dado o formulário enviado sem grounds quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="appeal"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

/** Preenche `grounds` (exigido só por `appeal`, C-2B-73) e clica `selector`, abrindo o
 * `stynx-confirm-dialog` da fila `confirm` compartilhada. */
async function clickWithGrounds(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  selector: string,
): Promise<StynxConfirmDialogComponent> {
  const host = harness.routeNativeElement as HTMLElement;
  const groundsField = host.querySelector<HTMLTextAreaElement>(
    'textarea[name="grounds"]',
  );
  if (groundsField) {
    groundsField.value = 'fundamentação';
    groundsField.dispatchEvent(new Event('input'));
  }
  harness.detectChanges();
  host
    .querySelector<HTMLButtonElement>(selector)
    ?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves
// `rait.screens.<slug>.confirm.<x>` do catálogo — as duas desta página (`appeal`, `waive`), 3 `it`
// cada: (a) mensagem do diálogo; (b) confirmar chama a facade uma vez com o comando M8; (c)
// dispensar não chama a facade.
describe('ProvidedAppealsPage — C-2B-71 (confirmação de appeal)', () => {
  it('dado rait-central-authority com grounds preenchido quando o botão appeal é clicado então stynx-confirm-dialog abre com message rait.screens.autoridade-provimentos.confirm.appeal', async () => {
    const { harness } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const dialog = await clickWithGrounds(harness, '[data-action="appeal"]');
    expect(dialog.message).toBe(
      'rait.screens.autoridade-provimentos.confirm.appeal',
    );
  });

  it('dado o diálogo de appeal confirmado então a facade é chamada uma vez com rait-appeal:authority-decide', async () => {
    const { harness, facade } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const dialog = await clickWithGrounds(harness, '[data-action="appeal"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-appeal:authority-decide',
    );
  });

  it('dado o diálogo de appeal dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const dialog = await clickWithGrounds(harness, '[data-action="appeal"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('ProvidedAppealsPage — C-2B-71 (confirmação de waive)', () => {
  async function clickWaive(
    harness: Awaited<ReturnType<typeof render>>['harness'],
  ): Promise<StynxConfirmDialogComponent> {
    const host = harness.routeNativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('[data-action="waive"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    return harness.fixture.debugElement.query(
      By.directive(StynxConfirmDialogComponent),
    ).componentInstance;
  }

  it('dado rait-central-authority quando o botão waive é clicado então stynx-confirm-dialog abre com message rait.screens.autoridade-provimentos.confirm.waive', async () => {
    const { harness } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const dialog = await clickWaive(harness);
    expect(dialog.message).toBe(
      'rait.screens.autoridade-provimentos.confirm.waive',
    );
  });

  it('dado o diálogo de waive confirmado então a facade é chamada uma vez com rait-appeal:waive', async () => {
    const { harness, facade } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const dialog = await clickWaive(harness);
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-appeal:waive');
  });

  it('dado o diálogo de waive dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    const dialog = await clickWaive(harness);
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('ProvidedAppealsPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { harness } = await render(
      'rait-central-authority',
      caseFacadeStub([fixtureCase(CASE_IDS.COMUNICADO)]),
    );
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
