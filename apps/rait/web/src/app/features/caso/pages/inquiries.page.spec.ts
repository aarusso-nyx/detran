// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6 linha 10, §6.2, §8 — C-2B-65/66/69/70/71/72/73/80.
// `InquiriesPageComponent` (IU-RAIT-010) ainda não existe (TASK-0015): falha de módulo esperada.
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
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
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import { ROLE_PERMISSIONS_FIXTURE } from '../../../../testing/policy.fixture';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../../testing/route-manifest.fixture';
import { CaseFacade } from '../../../data/facades/case.facade';
import type { RaitInquiry } from '../../../data/models';
import { InquiriesPageComponent } from './inquiries.page';

/** Diligência pendente (extension_count 0, não esgotada — [RN-RAIT-105]) para exercitar `extend`
 * (C-2B-71, `InquiryCard`, `data-action="extend"`). */
const PENDING_INQUIRY = {
  id: 'inq-1',
  tenant_id: 'tenant-1',
  case_id: CASE_IDS.DILIGENCIA,
  addressee: 'requerente',
  subject: 'assunto',
  requested_at: '2026-01-01',
  requested_by: 'user-1',
  due_on: '2026-01-15',
  extension_count: 0,
  created_at: '2026-01-01',
} as unknown as RaitInquiry;

function caseFacadeStub(diligencias: readonly RaitInquiry[] = []) {
  const command = commandRunnerStub();
  return stubFacade<CaseFacade>()({
    caso: readSlotStub({
      status: 'ready',
      value: fixtureCase(CASE_IDS.DILIGENCIA),
    }),
    partes: listFacadeStub([]),
    prazos: listFacadeStub([]),
    relogios: listFacadeStub([]),
    documentos: listFacadeStub([]),
    diligencias: listFacadeStub(diligencias),
    minutas: listFacadeStub([]),
    admissibilidade: listFacadeStub([]),
    comunicacoes: listFacadeStub([]),
    eventos: listFacadeStub([]),
    impedimentos: listFacadeStub([]),
    decisao: listFacadeStub([]),
    provimentos: listFacadeStub([]),
    provimentosDecisao: (() => new Map()) as never,
    provimentosPrazo: (() => new Map()) as never,
    openInquiry: commandMethod('rait-case:open-inquiry', command),
    extendInquiry: commandMethod('rait-case:extend', command),
    command,
  });
}

async function render(role: string, facade = caseFacadeStub()) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [{ provide: CaseFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('casos/:id/diligencias')}`,
  );
  return { harness, facade };
}

describe('InquiriesPage — estado, banner e a11y (C-2B-65/66/80)', () => {
  it('dado a página em ready quando renderizada então <h1> e nenhuma violação a11y', async () => {
    const { harness } = await render('rait-analyst');
    const el = harness.fixture.debugElement.query(
      By.directive(InquiriesPageComponent),
    );
    expect(el.nativeElement.querySelector('h1')).not.toBeNull();
    await expectA11yStateInvariants(el.nativeElement);
  });
});

/**
 * `casos/:id/diligencias` é restrita a `rait-analyst`/`rait-rapporteur`; os demais papéis são
 * redirecionados a `/sem-permissao` antes de chegar à página (C-2A-13/C-2B-61) — a matriz de
 * autorização (C-2B-69/70) monta o componente isolado, sem o router (adenda A14 do maestro).
 */
function renderIsolated(
  role: (typeof RAIT_ALL_ROLES)[number],
  facade = caseFacadeStub(),
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [InquiriesPageComponent],
    providers: pageProviders(role, [{ provide: CaseFacade, useValue: facade }]),
  });
  const fixture = TestBed.createComponent(InquiriesPageComponent);
  fixture.detectChanges();
  return { fixture, facade };
}

describe('InquiriesPage — matriz §6.2 (C-2B-69/70): open-inquiry', () => {
  const ACTION_KEY = 'inf:rait-case:open-inquiry';
  RAIT_ALL_ROLES.forEach((role) => {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(ACTION_KEY);
    it(`dado papel "${role}" quando renderizado então o botão open-inquiry ${granted ? 'existe' : 'NÃO existe [negativo]'}`, () => {
      const { fixture } = renderIsolated(role);
      const button = fixture.nativeElement.querySelector(
        '[data-action="open"]',
      );
      if (granted) expect(button).not.toBeNull();
      else expect(button).toBeNull();
    });
  });
});

function clickAction(
  harness: Awaited<ReturnType<typeof render>>['harness'],
  selector: string,
): StynxConfirmDialogComponent {
  const el = harness.fixture.debugElement.query(
    By.directive(InquiriesPageComponent),
  );
  (
    el.nativeElement.querySelector(selector) as HTMLButtonElement | null
  )?.dispatchEvent(new Event('click'));
  harness.detectChanges();
  return harness.fixture.debugElement.query(
    By.directive(StynxConfirmDialogComponent),
  ).componentInstance;
}

// Adenda A15 (delivery-review CTG-0002b-2, achado 11): C-2B-71 cobre as 45 chaves
// `rait.screens.<slug>.confirm.<x>` do catálogo — as duas desta página (`open`, `extend`), 3 `it`
// cada.
describe('InquiriesPage — C-2B-71 (confirmação de open-inquiry)', () => {
  it('dado rait-analyst quando o botão open é clicado então stynx-confirm-dialog abre com message rait.screens.casos-id-diligencias.confirm.open', async () => {
    const { harness } = await render('rait-analyst');
    const dialog = clickAction(harness, '[data-action="open"]');
    expect(dialog.message).toBe(
      'rait.screens.casos-id-diligencias.confirm.open',
    );
  });

  it('dado o diálogo de open confirmado então a facade é chamada uma vez com rait-case:open-inquiry', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = clickAction(harness, '[data-action="open"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe(
      'rait-case:open-inquiry',
    );
  });

  it('dado o diálogo de open dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render('rait-analyst');
    const dialog = clickAction(harness, '[data-action="open"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('InquiriesPage — C-2B-71 (confirmação de extend)', () => {
  it('dado rait-analyst com uma diligência pendente quando o botão extend é clicado então stynx-confirm-dialog abre com message rait.screens.casos-id-diligencias.confirm.extend', async () => {
    const { harness } = await render(
      'rait-analyst',
      caseFacadeStub([PENDING_INQUIRY]),
    );
    const dialog = clickAction(harness, '[data-action="extend"]');
    expect(dialog.message).toBe(
      'rait.screens.casos-id-diligencias.confirm.extend',
    );
  });

  it('dado o diálogo de extend confirmado então a facade é chamada uma vez com rait-case:extend', async () => {
    const { harness, facade } = await render(
      'rait-analyst',
      caseFacadeStub([PENDING_INQUIRY]),
    );
    const dialog = clickAction(harness, '[data-action="extend"]');
    dialog.confirm.emit();
    harness.detectChanges();
    expect(facade.command.runMock).toHaveBeenCalledTimes(1);
    expect(facade.command.runMock.mock.calls[0]?.[0]).toBe('rait-case:extend');
  });

  it('dado o diálogo de extend dispensado então a facade NÃO é chamada [negativo]', async () => {
    const { harness, facade } = await render(
      'rait-analyst',
      caseFacadeStub([PENDING_INQUIRY]),
    );
    const dialog = clickAction(harness, '[data-action="extend"]');
    dialog.dismissed.emit();
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});

describe('InquiriesPage — C-2B-73 (InquiryForm vazio)', () => {
  it('dado o formulário enviado sem subject quando submetido então nenhum comando é chamado [negativo]', async () => {
    const { harness, facade } = await render('rait-analyst');
    const el = harness.fixture.debugElement.query(
      By.directive(InquiriesPageComponent),
    );
    el.nativeElement.querySelector('form')?.dispatchEvent(new Event('submit'));
    harness.detectChanges();
    expect(facade.command.runMock).not.toHaveBeenCalled();
  });
});
