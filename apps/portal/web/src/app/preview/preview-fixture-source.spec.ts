// C-06 — canonical Portal exports, production fixture transcriptions and adapter IDs.
import { TestBed } from '@angular/core/testing';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, REPO_ROOT } from '../../testing/kb';
import { AIT_ID } from '../../testing/http-fixtures';
import {
  REQUEST_EM_ANDAMENTO_ID,
  DILIGENCE_ID_FIXTURE,
} from '../../testing/http-fixtures-reads';
import {
  VEHICLE_ID,
  CRASH_ID,
  EXAM_ID,
  MANIFESTATION_EM_ANALISE_ID,
} from '../../testing/http-fixtures-pair3';
import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
import { PortalClient } from '../data/portal.client';
import { PreviewPortalClient } from './adapters/portal.client';
import { classifyError } from '../core/error-boundary';
import { PreviewStateService } from './preview-state.service';
import { openScreen } from './preview.spec-helper';
import {
  CANONICAL_FIXTURES,
  concretePath,
  configurePreview,
  expectNoNetwork,
  setPreviewDocument,
} from './preview.spec-helper';

function ids(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(ids);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) =>
    typeof item === 'string' && /(?:^id$|Id$)/.test(key) ? [item] : ids(item),
  );
}
const canonicalIds = new Set([
  ...ids(CANONICAL_FIXTURES),
  AIT_ID,
  REQUEST_EM_ANDAMENTO_ID,
  DILIGENCE_ID_FIXTURE,
  VEHICLE_ID,
  CRASH_ID,
  EXAM_ID,
  MANIFESTATION_EM_ANALISE_ID,
]);
const READS: readonly [string, readonly unknown[]][] = [
  ['me', []],
  ['services', []],
  ['listAits', []],
  ['getAit', [AIT_ID]],
  ['getAitPoints', [AIT_ID]],
  ['getPointsSummary', []],
  ['listRequests', []],
  ['getRequest', [REQUEST_EM_ANDAMENTO_ID]],
  ['getDecision', [REQUEST_EM_ANDAMENTO_ID]],
  ['getService', ['consulta_multas']],
  ['listInbox', []],
  ['getSneEnrollment', []],
  ['getCnh', []],
  ['listVehicles', []],
  ['getVehicleClearance', [VEHICLE_ID]],
  ['listCrashes', []],
  ['getCrash', [CRASH_ID]],
  ['listExams', []],
  ['getExam', [EXAM_ID]],
  ['listManifestations', []],
  ['getManifestation', [MANIFESTATION_EM_ANALISE_ID]],
];

describe('C-06 — canonical fixture provenance', () => {
  it('inventory contains each actual manifest route and its concrete canonical URL', () => {
    const text = readFileSync(
      join(REPO_ROOT, 'work/rounds/R-0033/inventory-portal-web.md'),
      'utf8',
    );
    for (const entry of PORTAL_ROUTE_MANIFEST) {
      expect(text).toContain(`\`/${entry.path}\``);
      expect(text).toContain(concretePath(entry));
    }
    expect(text).toContain('source_pending');
    expect(text).toContain('SERVICE_UNAVAILABLE');
  });
  it('production JSON transcriptions preserve source export bodies exactly', () => {
    const dir = join(APP_SRC_ROOT, 'app/preview/fixtures');
    const files = readdirSync(dir).filter((file) => file.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);
    const copied: Record<string, unknown> = Object.assign(
      {},
      ...files.map(
        (file) =>
          JSON.parse(readFileSync(join(dir, file), 'utf8')) as Record<
            string,
            unknown
          >,
      ),
    );
    // Data belongs to the Engineer: this spec does not import any production fixture from testing.
    for (const [name, value] of Object.entries(copied)) {
      expect(CANONICAL_FIXTURES, name).toHaveProperty(name);
      expect(value, name).toEqual(CANONICAL_FIXTURES[name]);
    }
    for (const name of [
      'ME_RESPONSE_FIXTURE',
      'AIT_LIST_PAGE_FIXTURE',
      'AIT_DETAIL_FIXTURE',
      'REQUEST_DETAIL_FIXTURE',
      'PORTAL_SERVICE_CATALOG_FIXTURE',
    ])
      expect(copied).toHaveProperty(name);
  });
  for (const [method, args] of READS) {
    it(`${method} returns only source IDs, no fabricated resources`, async () => {
      setPreviewDocument('/autos');
      await configurePreview();
      const client = TestBed.inject(PortalClient);
      expect(client).toBeInstanceOf(PreviewPortalClient);
      const callable = client as unknown as Record<
        string,
        (...args: unknown[]) => Promise<unknown>
      >;
      const result = await callable[method](...args);
      for (const id of ids(result))
        expect(canonicalIds.has(id), `${method}: ${id}`).toBe(true);
      if (method === 'listAits')
        expect(result).toEqual(CANONICAL_FIXTURES['AIT_LIST_PAGE_FIXTURE']);
      if (method === 'getAit')
        expect(result).toEqual(CANONICAL_FIXTURES['AIT_DETAIL_FIXTURE']);
      if (method === 'me')
        expect(result).toEqual(CANONICAL_FIXTURES['ME_RESPONSE_FIXTURE']);
      expectNoNetwork();
    });
  }
});

// Scenarios follow the real ErrorBoundary; no fabricated HTTP response is dispatched.
describe('C-06 — data scenarios have source-backed semantics', () => {
  for (const [state, status] of [
    ['error', 500],
    ['forbidden', 403],
  ] as const) {
    it(`${state} rejects with a Portal catalogue code and expected HTTP classification`, async () => {
      setPreviewDocument('/autos', 'avancada', state);
      await configurePreview();
      expect(TestBed.inject(PreviewStateService).state()).toBe(state);
      const result = await TestBed.inject(PortalClient)
        .getAit(AIT_ID)
        .catch((error: unknown) => error);
      const classified = classifyError(result);
      expect(classified.status).toBe(status);
      expect(classified.code).toMatch(/^PORTAL\./);
      const catalog = readFileSync(
        join(REPO_ROOT, 'docs/framework/arch/portal-error-catalog.md'),
        'utf8',
      );
      expect(catalog).toContain(classified.code);
      expectNoNetwork();
    });
  }
  it('empty returns a typed empty page while preserving its singleton resource', async () => {
    setPreviewDocument('/autos', 'avancada', 'empty');
    await configurePreview();
    const client = TestBed.inject(PortalClient);
    expect(await client.listAits()).toMatchObject({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(await client.getAit(AIT_ID)).toEqual(
      CANONICAL_FIXTURES['AIT_DETAIL_FIXTURE'],
    );
    expectNoNetwork();
  });
  it('loading remains pending without requesting a resource', async () => {
    setPreviewDocument('/autos', 'avancada', 'loading');
    await configurePreview();
    let settled = false;
    void TestBed.inject(PortalClient)
      .getAit(AIT_ID)
      .then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        },
      );
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(settled).toBe(false);
    expectNoNetwork();
  });
  it('the service charter visibly preserves the pending legal deadline source', async () => {
    const entry = PORTAL_ROUTE_MANIFEST.find(
      (row) => row.path === 'carta-servicos/:serviceKey',
    )!;
    const { root } = await openScreen(entry);
    expect(root.textContent).toContain('source_pending');
    expectNoNetwork();
  });
});
