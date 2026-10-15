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
// mínimo exigido pelo prompt — ambos abrem a rota pelo manifesto. Produção (TASK-0003): ainda não
// existe — falha de módulo esperada nesta entrega.
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
import type { PreviewScreenState } from './preview-state.service';
import {
  createPreviewHarness,
  EMPTY_LIST_SLOT_SELECTOR,
  inventoryRowOf,
  JW01_NEGATIVE_ROUTES,
  JW01_SCREENS,
  minimalRoleOf,
  pathnameOf,
  previewScreenElement,
  previewSpecContext,
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

  PAGE_ENTRIES.forEach((entry) => {
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
  });
});

describe('C-02 — telas da JW-01 em empty (P-09; contrato §3 regra 2)', () => {
  JW01_SCREENS.forEach((screenSpec) => {
    const row = inventoryRowOf(screenSpec.route);

    it(`dado JW-01 passo ${screenSpec.step} (${row.previewPath}) sob rait-analyst e pv_estado=empty quando renderizada então algum slot de lista (PageState/QueueTable) com data-status="empty", 0 requisições e sem console.error`, async () => {
      const { harness } = await open(row.previewPath, 'rait-analyst', 'empty');
      await waitForScenario(harness, 'empty');

      const screen = previewScreenElement(harness);
      expect(screen).not.toBeNull();
      expect(
        screen?.querySelectorAll(EMPTY_LIST_SLOT_SELECTOR).length ?? 0,
      ).toBeGreaterThan(0);
      expect(pathnameOf(TestBed.inject(Router).url)).toBe(row.previewPath);
      expectNoNetwork();
      expect(consoleError).not.toHaveBeenCalled();
    });
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
        await waitForScenario(harness, 'empty');

        expect(TestBed.inject(CaseFacade).caso.status()).toBe('ready');
        expect(TestBed.inject(CaseFacade).caso.value()?.id).toBe(
          row.previewPath.split('/')[2],
        );
      });
    },
  );
});

describe('C-02 — telas da JW-01 em loading/error/forbidden (P-09; contrato §3)', () => {
  JW01_SCREENS.forEach((screenSpec) => {
    const row = inventoryRowOf(screenSpec.route);

    JW01_HOST_STATES.forEach((state) => {
      it(`dado JW-01 passo ${screenSpec.step} (${row.previewPath}) sob rait-analyst e pv_estado=${state} quando renderizada então data-status="${state}" no host da página, 0 requisições e sem console.error`, async () => {
        const { harness } = await open(row.previewPath, 'rait-analyst', state);
        await waitForScenario(harness, state);

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
