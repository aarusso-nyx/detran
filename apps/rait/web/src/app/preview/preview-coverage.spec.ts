// R-0033 TASK-0002 (Inspector). C-02 / P-04 / P-09 / P-10 (`frontend-preview-mode.md` §3, §7;
// prompt TASK-0002 item 2). (a) Cada entrada `kind: 'page'` de `RAIT_ROUTE_MANIFEST` (64, laço,
// nunca amostra) renderiza sob `providePreviewMode()` no papel mínimo da entrada (`'all'` →
// `rait-analyst`), estado `loaded`, navegando pelo caminho concreto do inventário
// (`inventory-rait-web.md` §3): `data-screen` = tela do manifesto, zero requisições ao
// `HttpTestingController`, `RaitHttp` nunca chamado, nenhum `console.error`, pathname final = o
// pedido. (b) Telas da JW-01 (passos 1–8, inventário §5.1; OD-C3-007 (a)) em `empty`, `loading`,
// `error`, `forbidden` com o `ReadStatus` da tabela §3. (c) Prova negativa: sob `rait-analyst`,
// `/casos/<09>/decisao` e `/casos/<11>/impedimentos` terminam em `/sem-permissao?de=<url>`.
// O papel da URL de captura do inventário difere do papel mínimo do manifesto em algumas linhas
// (ex.: `/casos/:id/partes`, `/arquivo/busca`); este spec usa o caminho do inventário e o papel
// mínimo exigido pelo prompt — ambos abrem a rota pelo manifesto. Adenda A5 item 3 (B3): a entrada
// `sem-permissao` (`rait-forbidden-page`, sem `data-screen` por M14/C-2A-13) prova o host da página
// e o pathname em vez de `data-screen`; as outras 63 entradas seguem inalteradas. A5 item 5 (c):
// a bandeja do passo 7 (`/painel/retomar`) em `loaded` é derivada de `inquiries` da JSON (A4),
// nunca de "coleção ausente".
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { RouterTestingHarness } from '@angular/router/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { RAIT_ROUTE_MANIFEST, type RaitRoleCode } from '../app.route-manifest';
import { RaitHttp } from '../data/api/rait-http';
import { CaseFacade } from '../data/facades/case.facade';
import { QueueFacade } from '../data/facades/queue.facade';
import type { PreviewScreenState } from './preview-state.service';
import {
  createPreviewHarness,
  emptySlotsOf,
  emptyStatusesOf,
  FORBIDDEN_PAGE_SELECTOR,
  FORBIDDEN_ROUTE,
  inventoryRowOf,
  JW01_NEGATIVE_ROUTES,
  JW01_SCREENS,
  minimalRoleOf,
  pathnameOf,
  previewScreenElement,
  previewSpecContext,
  readFixturesJson,
  readInventoryRows,
  resetPreviewDocument,
  setPreviewDocument,
  settle,
  waitForScenario,
} from './preview.spec-helper';

const PAGE_ENTRIES = RAIT_ROUTE_MANIFEST.filter(
  (entry) => entry.kind === 'page',
);

/**
 * Estados da JW-01 além de `loaded` cujo `ReadStatus` aparece no `data-status` do host da página
 * (prompt TASK-0002 item 2; `empty` tem bloco próprio: slots de lista).
 */
const JW01_HOST_STATES: readonly PreviewScreenState[] = [
  'loading',
  'error',
  'forbidden',
];

const FORBIDDEN_PATH = '/sem-permissao';
const FORBIDDEN_FROM_PARAM = 'de';

let consoleError: MockInstance;
let getList: MockInstance;
let getOne: MockInstance;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
  getList = vi.spyOn(RaitHttp.prototype, 'getList');
  getOne = vi.spyOn(RaitHttp.prototype, 'getOne');
});

afterEach(() => {
  vi.restoreAllMocks();
  resetPreviewDocument();
});

async function open(
  path: string,
  role: RaitRoleCode,
  state: PreviewScreenState,
): Promise<{ harness: RouterTestingHarness; url: string }> {
  const url = setPreviewDocument(path, role, state);
  const harness = await createPreviewHarness(previewSpecContext().providers);
  await harness.navigateByUrl(url);
  return { harness, url };
}

function expectNoNetwork(): void {
  TestBed.inject(HttpTestingController).verify();
  expect(getList).not.toHaveBeenCalled();
  expect(getOne).not.toHaveBeenCalled();
}

describe('C-02 — cobertura das páginas do manifesto em loaded (P-04)', () => {
  it('dado RAIT_ROUTE_MANIFEST quando filtradas as entradas page então 64 (inventário §3, totais)', () => {
    expect(PAGE_ENTRIES).toHaveLength(64);
  });

  it('dado inventory-rait-web.md quando lidas as linhas da tabela §3 (só entre "## 3." e "## 4.", A5 item 1) então 74 entradas com as rotas de RAIT_ROUTE_MANIFEST na ordem', () => {
    const rows = readInventoryRows();
    expect(rows).toHaveLength(74);
    expect(rows.map((row) => row.route)).toEqual(
      RAIT_ROUTE_MANIFEST.map((entry) => entry.path),
    );
  });

  PAGE_ENTRIES.filter((entry) => entry.path !== FORBIDDEN_ROUTE).forEach(
    (entry) => {
      const role = minimalRoleOf(entry);
      const row = inventoryRowOf(entry.path);
      const expectedScreen = entry.screen ?? '';

      it(`dado /${entry.path} sob prévia com sessão ${role} e estado loaded quando navegada para ${row.previewPath} então data-screen="${expectedScreen}", 0 requisições, sem console.error e pathname final ${row.previewPath}`, async () => {
        const { harness } = await open(row.previewPath, role, 'loaded');
        await settle(harness);

        const screen = previewScreenElement(harness);
        expect(screen).not.toBeNull();
        expect(screen?.getAttribute('data-screen')).toBe(expectedScreen);
        expect(pathnameOf(TestBed.inject(Router).url)).toBe(row.previewPath);
        expectNoNetwork();
        expect(consoleError).not.toHaveBeenCalled();
      });
    },
  );

  it(`dado /${FORBIDDEN_ROUTE} sob prévia com sessão rait-analyst e estado loaded quando navegada então o host ${FORBIDDEN_PAGE_SELECTOR} está presente (sem data-screen, M14/C-2A-13; A5 item 3), 0 requisições, sem console.error e pathname final /${FORBIDDEN_ROUTE}`, async () => {
    const entries = PAGE_ENTRIES.filter(
      (entry) => entry.path === FORBIDDEN_ROUTE,
    );
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    const row = inventoryRowOf(FORBIDDEN_ROUTE);
    const { harness } = await open(
      row.previewPath,
      minimalRoleOf(entry),
      'loaded',
    );
    await settle(harness);

    const root = harness.routeNativeElement as HTMLElement | null;
    expect(root).not.toBeNull();
    const host = root?.matches(FORBIDDEN_PAGE_SELECTOR)
      ? root
      : root?.querySelector(FORBIDDEN_PAGE_SELECTOR);
    expect(host).toBeTruthy();
    expect(previewScreenElement(harness)).toBeNull();
    expect(pathnameOf(TestBed.inject(Router).url)).toBe(row.previewPath);
    expect(row.previewPath).toBe(`/${FORBIDDEN_ROUTE}`);
    expectNoNetwork();
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('C-02 — telas da JW-01 em empty (P-09; contrato §3 regra 2, A5 item 4)', () => {
  JW01_SCREENS.filter((screenSpec) => screenSpec.emptySlot).forEach(
    (screenSpec) => {
      const row = inventoryRowOf(screenSpec.route);

      it(`dado JW-01 passo ${screenSpec.step} (${row.previewPath}) sob rait-analyst e pv_estado=empty quando renderizada então algum elemento da página (PageState/QueueTable/DossierViewer) com data-status="empty", 0 requisições e sem console.error`, async () => {
        const { harness } = await open(
          row.previewPath,
          'rait-analyst',
          'empty',
        );
        await waitForScenario(harness, 'empty', screenSpec);

        const screen = previewScreenElement(harness);
        expect(screen).not.toBeNull();
        expect(emptySlotsOf(screen)).toBeGreaterThan(0);
        expect(pathnameOf(TestBed.inject(Router).url)).toBe(row.previewPath);
        expectNoNetwork();
        expect(consoleError).not.toHaveBeenCalled();
      });
    },
  );

  JW01_SCREENS.filter((screenSpec) => !screenSpec.emptySlot).forEach(
    (screenSpec) => {
      const row = inventoryRowOf(screenSpec.route);

      it(`dado JW-01 passo ${screenSpec.step} (${row.previewPath}) sem slot de lista (só ShiftSummary, leitura unitária sem emptyWhen) sob rait-analyst e pv_estado=empty quando renderizada então o host fica data-status="ready" e nenhum elemento com data-status="empty" (A5 item 4), 0 requisições e sem console.error`, async () => {
        const { harness } = await open(
          row.previewPath,
          'rait-analyst',
          'empty',
        );
        await waitForScenario(harness, 'empty', screenSpec);

        const screen = previewScreenElement(harness);
        expect(screen).not.toBeNull();
        expect(screen?.getAttribute('data-status')).toBe('ready');
        expect(emptyStatusesOf(screen)).toBe(0);
        expect(pathnameOf(TestBed.inject(Router).url)).toBe(row.previewPath);
        expectNoNetwork();
        expect(consoleError).not.toHaveBeenCalled();
      });
    },
  );

  it('dado JW01_SCREENS quando filtradas as telas sem slot de lista então só o passo 1 (/painel; A5 item 4)', () => {
    expect(
      JW01_SCREENS.filter((screenSpec) => !screenSpec.emptySlot).map(
        (screenSpec) => screenSpec.route,
      ),
    ).toEqual(['painel']);
  });

  JW01_SCREENS.filter((screenSpec) => screenSpec.caseScreen).forEach(
    (screenSpec) => {
      const row = inventoryRowOf(screenSpec.route);

      it(`dado JW-01 passo ${screenSpec.step} (${row.previewPath}) sob rait-analyst e pv_estado=empty quando renderizada então a entidade principal (CaseFacade.caso) continua ready — empty não esvazia leitura unitária`, async () => {
        const { harness } = await open(
          row.previewPath,
          'rait-analyst',
          'empty',
        );
        await waitForScenario(harness, 'empty', screenSpec);

        expect(TestBed.inject(CaseFacade).caso.status()).toBe('ready');
        expect(TestBed.inject(CaseFacade).caso.value()?.id).toBe(
          row.previewPath.split('/')[2],
        );
      });
    },
  );
});

describe('C-02 — JW-01 passo 7 (/painel/retomar) em loaded derivado da JSON (A5 item 5 (c))', () => {
  /**
   * Bandeja "prontos para retomar" (ficha 003; `QueueFacade.loadResumePage`): diligências com
   * desfecho. Esperado = registros de `inquiries` da JSON com `outcome` presente (nenhum valor
   * transcrito; hoje a JSON não traz `outcome` — `rait-fixtures.md` §10).
   */
  function resumableInquiryIds(): string[] {
    const inquiries = readFixturesJson()['inquiries'] as readonly {
      readonly id: string;
      readonly outcome?: unknown;
    }[];
    return inquiries
      .filter(
        (inquiry) => inquiry.outcome !== null && inquiry.outcome !== undefined,
      )
      .map((inquiry) => inquiry.id)
      .sort();
  }

  it('dado JW-01 passo 7 sob rait-analyst em loaded quando renderizado então QueueFacade.retomar tem exatamente as diligências da JSON com outcome, o host mostra ready/empty conforme essa contagem, 0 requisições e sem console.error', async () => {
    const row = inventoryRowOf('painel/retomar');
    const { harness } = await open(row.previewPath, 'rait-analyst', 'loaded');
    await settle(harness);

    const expected = resumableInquiryIds();
    const retomar = TestBed.inject(QueueFacade).retomar;
    expect(
      retomar
        .items()
        .map((item) => item.id)
        .sort(),
    ).toEqual(expected);
    const status = expected.length > 0 ? 'ready' : 'empty';
    expect(retomar.status()).toBe(status);
    expect(previewScreenElement(harness)?.getAttribute('data-status')).toBe(
      status,
    );
    expectNoNetwork();
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('C-02 — telas da JW-01 em loading/error/forbidden (P-09; contrato §3)', () => {
  JW01_SCREENS.forEach((screenSpec) => {
    const row = inventoryRowOf(screenSpec.route);

    JW01_HOST_STATES.forEach((state) => {
      it(`dado JW-01 passo ${screenSpec.step} (${row.previewPath}) sob rait-analyst e pv_estado=${state} quando renderizada então data-status="${state}" no host da página, 0 requisições e sem console.error`, async () => {
        const { harness } = await open(row.previewPath, 'rait-analyst', state);
        await waitForScenario(harness, state, screenSpec);

        expect(previewScreenElement(harness)?.getAttribute('data-status')).toBe(
          state,
        );
        expect(pathnameOf(TestBed.inject(Router).url)).toBe(row.previewPath);
        expectNoNetwork();
        expect(consoleError).not.toHaveBeenCalled();
      });
    });
  });
});

describe('C-02 — prova negativa da JW-01 sob rait-analyst (P-10; OD-C3-007 (a))', () => {
  JW01_NEGATIVE_ROUTES.forEach((route) => {
    const row = inventoryRowOf(route);

    it(`dado rait-analyst quando navegada ${row.previewPath} então roleGuard leva a ${FORBIDDEN_PATH}?${FORBIDDEN_FROM_PARAM}=<url pedida> (guardas ativas, nunca contornadas) [negativo]`, async () => {
      const { harness, url } = await open(
        row.previewPath,
        'rait-analyst',
        'loaded',
      );
      await settle(harness);

      const router = TestBed.inject(Router);
      expect(pathnameOf(router.url)).toBe(FORBIDDEN_PATH);
      expect(
        router.parseUrl(router.url).queryParamMap.get(FORBIDDEN_FROM_PARAM),
      ).toBe(url);
      expectNoNetwork();
    });
  });
});
