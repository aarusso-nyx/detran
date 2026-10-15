// R-0033 TASK-0002 (Inspector). Harness comum dos specs do modo prévia (contrato
// `docs/framework/arch/frontend-preview-mode.md` §7; adenda A1 item 6 de `plan.md`). Só usado por
// specs. `createRaitRouterHarness` (`src/testing/router-harness.ts`) não aceita
// `EnvironmentProviders` e não é editado — serve só de modelo. Os módulos de produção de
// `src/app/preview/**` ainda não existem (TASK-0003): falha de módulo é o estado esperado desta
// entrega (`plan.md` M3). Nenhum valor inventado: URLs, papéis e ids vêm do inventário
// (`work/rounds/R-0033/inventory-rait-web.md`) e de `rait-fixtures.json`, lidos do disco.
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import {
  ApplicationInitStatus,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, vi, type Mock } from 'vitest';
import { FIXTURES_PATH, REPO_ROOT } from '../../testing/kb';
import type { RaitRoleCode, RaitRouteEntry } from '../app.route-manifest';
// Produção (TASK-0003): ainda não existe.
import {
  PREVIEW_FIXTURE_LOADER,
  PreviewFixtureStore,
  type RaitFixturesJson,
} from './preview-fixtures';
import {
  PREVIEW_DOCUMENT_NAVIGATE,
  PREVIEW_ROLE_PARAM,
  PREVIEW_STATE_PARAM,
  type PreviewScreenState,
} from './preview-state.service';
import { providePreviewMode } from './preview.providers';

export type PreviewProviders = Array<Provider | EnvironmentProviders>;

// --- fontes em disco ---------------------------------------------------------------------------

export const INVENTORY_PATH = join(
  REPO_ROOT,
  'work/rounds/R-0033/inventory-rait-web.md',
);
export const PREVIEW_CONTRACT_PATH = join(
  REPO_ROOT,
  'docs/framework/arch/frontend-preview-mode.md',
);

/** `docs/framework/arch/fixtures/rait-fixtures.json`, lido do disco (rait-fixtures.md §7). */
export function readFixturesJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as Record<
    string,
    unknown
  >;
}

/** `tenant.id` das fixtures (`00000000-0000-7000-8000-00000000a001`), nunca transcrito à mão. */
export function fixtureTenantId(): string {
  const tenant = readFixturesJson()['tenant'] as { readonly id: string };
  return tenant.id;
}

/** `today` das fixtures (`2026-09-14`). */
export function fixtureToday(): string {
  return readFixturesJson()['today'] as string;
}

/**
 * Ids de uma chave de nível 1 da fixture: array → `id` de cada registro; mapa `pools` → os
 * valores (D-06: "mapa `pools` → um registro por chave"); chave ausente → conjunto vazio (D-07).
 */
export function fixtureIdsOf(collection: string | null): ReadonlySet<string> {
  if (collection === null) return new Set();
  const value = readFixturesJson()[collection];
  if (Array.isArray(value)) {
    return new Set(
      value.map((record) => (record as { readonly id: string }).id),
    );
  }
  if (value !== null && typeof value === 'object') {
    return new Set(Object.values(value as Record<string, string>));
  }
  return new Set();
}

export interface InventoryRow {
  /** Caminho do manifesto, sem barra inicial (`''` para `/`). */
  readonly route: string;
  /** URL de prévia da coluna do inventário (caminho com ids reais + `?pv_papel=`). */
  readonly previewUrl: string;
  /** Só o caminho da URL de prévia (sem query). */
  readonly previewPath: string;
}

/** Cabeçalhos que delimitam a tabela §3 do inventário (adenda A5 item 1, B1). */
const INVENTORY_SECTION_START = /^## 3\./;
const INVENTORY_SECTION_END = /^## 4\./;

/**
 * Linhas da tabela §3 de `inventory-rait-web.md` (74 entradas, ordem do manifesto). Só as linhas
 * entre os cabeçalhos `## 3.` e `## 4.` são lidas (A5 item 1: as tabelas de §5.1/§5.2 também têm
 * `| <n> |` e não têm coluna 7). Colunas usadas: 2 (`Rota`) e 7 (`URL de prévia`), ambas entre
 * crases; nenhuma das colunas 1–7 contém `|`. Linha numerada da §3 sem rota/URL → erro
 * (fail-closed); §3 ausente ou sem linhas → erro.
 */
export function readInventoryRows(): readonly InventoryRow[] {
  const text = readFileSync(INVENTORY_PATH, 'utf8');
  const rows: InventoryRow[] = [];
  let inSection = false;
  let sawSection = false;
  for (const line of text.split(/\r?\n/)) {
    if (INVENTORY_SECTION_START.test(line)) {
      inSection = true;
      sawSection = true;
      continue;
    }
    if (INVENTORY_SECTION_END.test(line)) {
      inSection = false;
      continue;
    }
    if (!inSection) continue;
    if (!/^\|\s*\d+\s*\|/.test(line)) continue;
    const cells = line.split('|');
    const routeMatch = /`([^`]+)`/.exec(cells[2] ?? '');
    const urlMatch = /`([^`]+)`/.exec(cells[7] ?? '');
    if (!routeMatch || !urlMatch) {
      throw new Error(`${INVENTORY_PATH}: linha sem rota/URL: ${line}`);
    }
    const route = routeMatch[1].replace(/^\//, '');
    const previewUrl = urlMatch[1];
    rows.push({
      route,
      previewUrl,
      previewPath: previewUrl.split('?')[0] ?? previewUrl,
    });
  }
  if (!sawSection || rows.length === 0) {
    throw new Error(`${INVENTORY_PATH}: §3 ausente ou sem linhas`);
  }
  return rows;
}

export function inventoryRowOf(route: string): InventoryRow {
  const row = readInventoryRows().find(
    (candidate) => candidate.route === route,
  );
  if (!row) throw new Error(`inventário sem linha para /${route}`);
  return row;
}

/** Papel mínimo da entrada (padrão de `app.guards-matrix.presence.spec.ts`). */
export function minimalRoleOf(entry: RaitRouteEntry): RaitRoleCode {
  return entry.roles === 'all' ? 'rait-analyst' : entry.roles[0];
}

/**
 * Telas da JW-01 na prévia (inventário §5.1, passos 1–8; OD-C3-007 (a), decidida pelo Owner em
 * 2026-10-15). `caseScreen` = a tela tem entidade principal (o caso) que `empty` não esvazia
 * (contrato §3 regra 2). `sourcePendingAllowed` = única tela onde o inventário prevê o texto
 * `source_pending` em `loaded` (passo 8, "texto `source_pending`"; §3 linha 11). `emptySlot`
 * (A5 item 4, B4; lido do template da página) = a página tem slot de lista cujo `data-status`
 * vira `empty` sob `pv_estado=empty`:
 * - painel (`shift-dashboard.page.ts`): só `rait-page-state [status]="facade.painel.status()"`
 *   (`ShiftSummary`, leitura unitária sem `emptyWhen`); as listas curtas são `@if` sem
 *   `data-status` → **sem slot**;
 * - fila/defesa (`defense-pool-queue.page.ts`) e painel/retomar (`resume-tray.page.ts`):
 *   `rait-queue-table [status]` da lista;
 * - triagem, diligências, minuta (`triage`/`inquiries`/`draft.page.ts`): `rait-page-state
 *   [status]="status()"` = `combineStatus(caso, <lista>)`, cujo último termo é a lista;
 * - dossiê (`dossier.page.ts`): `rait-dossier-viewer [status]="facade.documentos.status()"`.
 */
export interface Jw01Screen {
  readonly step: string;
  readonly route: string;
  readonly caseScreen: boolean;
  readonly sourcePendingAllowed: boolean;
  readonly emptySlot: boolean;
}

export const JW01_SCREENS: readonly Jw01Screen[] = [
  {
    step: '1',
    route: 'painel',
    caseScreen: false,
    sourcePendingAllowed: false,
    emptySlot: false,
  },
  {
    step: '2',
    route: 'fila/defesa',
    caseScreen: false,
    sourcePendingAllowed: false,
    emptySlot: true,
  },
  {
    step: '3–4',
    route: 'casos/:id/triagem',
    caseScreen: true,
    sourcePendingAllowed: false,
    emptySlot: true,
  },
  {
    step: '5',
    route: 'casos/:id/dossie',
    caseScreen: true,
    sourcePendingAllowed: false,
    emptySlot: true,
  },
  {
    step: '6',
    route: 'casos/:id/diligencias',
    caseScreen: true,
    sourcePendingAllowed: false,
    emptySlot: true,
  },
  {
    step: '7',
    route: 'painel/retomar',
    caseScreen: false,
    sourcePendingAllowed: false,
    emptySlot: true,
  },
  {
    step: '8',
    route: 'casos/:id/minuta',
    caseScreen: true,
    sourcePendingAllowed: true,
    emptySlot: true,
  },
];

/** Prova negativa da JW-01 (inventário §5.1, passos 9–10 antigos; OD-C3-007 (a)). */
export const JW01_NEGATIVE_ROUTES: readonly string[] = [
  'casos/:id/decisao',
  'casos/:id/impedimentos',
];

/**
 * Sobreposição i18n do contrato §4 (tabela "Chave | Texto pt-BR"), transcrita literalmente; o
 * spec de gate a compara com `preview.pt-BR.json`.
 */
export const PREVIEW_CATALOG_CONTRACT: Readonly<Record<string, string>> = {
  'rait.states.preview_mark': 'PRÉVIA — DADOS FICTÍCIOS',
  'rait.states.preview_not_functional':
    'Não funcional na prévia: {command} não foi executado.',
  'rait.states.preview_source_pending': 'source_pending',
  'rait.shell.preview_region': 'Controles da prévia',
  'rait.shell.preview_state': 'Estado da tela',
  'rait.shell.preview_role': 'Papel da sessão',
  'rait.shell.preview_state_loaded': 'Carregado',
  'rait.shell.preview_state_empty': 'Vazio',
  'rait.shell.preview_state_loading': 'Carregando',
  'rait.shell.preview_state_error': 'Erro',
  'rait.shell.preview_state_forbidden': 'Acesso negado',
};

/** `rait.states.preview_not_functional` com `{command}` substituído (contrato §6). */
export function notFunctionalText(command: string): string {
  return PREVIEW_CATALOG_CONTRACT['rait.states.preview_not_functional'].replace(
    '{command}',
    command,
  );
}

// --- documento da prévia (D-01/D-02) -----------------------------------------------------------

/**
 * URL de documento com `pv_papel`/`pv_estado` (D-02: o estado vive só na URL e é lido de
 * `DOCUMENT.location.search` no construtor de `PreviewStateService`). Grava no `location` do
 * jsdom antes de o injetor existir e devolve a mesma URL para a navegação do router.
 */
export function setPreviewDocument(
  path: string,
  role: RaitRoleCode,
  state: PreviewScreenState,
): string {
  const params = new URLSearchParams({
    [PREVIEW_ROLE_PARAM]: role,
    [PREVIEW_STATE_PARAM]: state,
  });
  const url = `${path}?${params.toString()}`;
  window.history.replaceState(null, '', url);
  return url;
}

export function resetPreviewDocument(): void {
  window.history.replaceState(null, '', '/');
}

// --- composição ------------------------------------------------------------------------------

export interface PreviewSpecContext {
  /** Providers extras de todo spec de prévia (vão depois de `providePreviewMode()`). */
  readonly providers: PreviewProviders;
  /** Substitui `PREVIEW_DOCUMENT_NAVIGATE` (D-01): nunca navega o documento do jsdom. */
  readonly navigate: Mock<(url: string) => void>;
}

/**
 * `provideHttpClientTesting()` (conta requisições), `PREVIEW_FIXTURE_LOADER` lendo a fixture
 * canônica do disco (`readFileSync(FIXTURES_PATH)` — a leitura não passa por HTTP nos specs) e
 * `PREVIEW_DOCUMENT_NAVIGATE` espionado.
 */
export function previewSpecContext(
  extra: PreviewProviders = [],
): PreviewSpecContext {
  const navigate = vi.fn<(url: string) => void>();
  return {
    navigate,
    providers: [
      provideHttpClientTesting(),
      {
        provide: PREVIEW_FIXTURE_LOADER,
        useValue: () =>
          Promise.resolve(
            JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as RaitFixturesJson,
          ),
      },
      { provide: PREVIEW_DOCUMENT_NAVIGATE, useValue: navigate },
      ...extra,
    ],
  };
}

/** `TestBed` com `providePreviewMode()` completo + mocks de `Location`; espera os inicializadores (i18n). */
export async function configurePreview(extra: PreviewProviders): Promise<void> {
  TestBed.configureTestingModule({
    providers: [...providePreviewMode(), provideLocationMocks(), ...extra],
  });
  await TestBed.inject(ApplicationInitStatus).donePromise;
}

/** Adenda A1 item 6: harness próprio dos specs de prévia. */
export async function createPreviewHarness(
  extra: PreviewProviders,
): Promise<RouterTestingHarness> {
  await configurePreview(extra);
  return RouterTestingHarness.create();
}

/** Elemento com `data-screen` (host da página roteada ou descendente). */
export function previewScreenElement(
  harness: RouterTestingHarness,
): HTMLElement | null {
  const root = harness.routeNativeElement as HTMLElement | null;
  if (!root) return null;
  if (root.hasAttribute('data-screen')) return root;
  return root.querySelector<HTMLElement>('[data-screen]');
}

/**
 * Entrada do manifesto cuja página não tem `data-screen` (A5 item 3, B3): `ForbiddenPageComponent`
 * (`core/pages/forbidden.page.ts`, M14/C-2A-13). A prova de renderização é o host abaixo.
 */
export const FORBIDDEN_ROUTE = 'sem-permissao';
export const FORBIDDEN_PAGE_SELECTOR = 'rait-forbidden-page';

/** Pathname de `Router.url` (sem query). */
export function pathnameOf(url: string): string {
  return url.split('?')[0] ?? url;
}

/** Fixture carregada + rodadas de macrotarefa com detecção de mudanças (zoneless). */
export async function settle(harness: RouterTestingHarness): Promise<void> {
  await TestBed.inject(PreviewFixtureStore).load();
  for (let round = 0; round < 5; round += 1) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    harness.detectChanges();
  }
}

/**
 * Estado `empty` observável (contrato §3 regra 2, emendada por A5 item 4): `data-status="empty"` em
 * qualquer elemento da página (`PageState`, `QueueTable`, `rait-dossier-viewer`…).
 */
export const EMPTY_STATUS_SELECTOR = '[data-status="empty"]';

/** Elementos descendentes do host da página com `data-status="empty"` (slots de lista). */
export function emptySlotsOf(screen: HTMLElement | null): number {
  return screen?.querySelectorAll(EMPTY_STATUS_SELECTOR).length ?? 0;
}

/** Host da página + descendentes com `data-status="empty"` (prova de ausência de `empty`). */
export function emptyStatusesOf(screen: HTMLElement | null): number {
  if (!screen) return 0;
  return (screen.matches(EMPTY_STATUS_SELECTOR) ? 1 : 0) + emptySlotsOf(screen);
}

/**
 * Espera o estado observável do cenário (contrato §3): `loading`/`error`/`forbidden` no
 * `data-status` do host da página; `empty` = algum slot da página em `empty` quando
 * `screen.emptySlot` (padrão), ou — tela sem slot de lista (A5 item 4) — host `ready` e nenhum
 * `data-status="empty"`; `loaded` = fixture carregada e detecção estabilizada.
 */
export async function waitForScenario(
  harness: RouterTestingHarness,
  state: PreviewScreenState,
  screenSpec: Pick<Jw01Screen, 'emptySlot'> = { emptySlot: true },
): Promise<void> {
  await settle(harness);
  if (state === 'loaded') return;
  await vi.waitFor(() => {
    harness.detectChanges();
    const screen = previewScreenElement(harness);
    expect(screen).not.toBeNull();
    if (state === 'empty' && screenSpec.emptySlot) {
      expect(emptySlotsOf(screen)).toBeGreaterThan(0);
      return;
    }
    if (state === 'empty') {
      expect(screen?.getAttribute('data-status')).toBe('ready');
      expect(emptyStatusesOf(screen)).toBe(0);
      return;
    }
    expect(screen?.getAttribute('data-status')).toBe(state);
  });
}
