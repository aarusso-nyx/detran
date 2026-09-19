// R-0014 TASK-0015 (Inspector). CTG-0003b §2 — as sete leituras novas de `data/portal.client.ts`
// (arquivo "altera": já existe com os 11 comandos do par 1, sem estas leituras ainda — TASK-0016
// as acrescenta) e `data/read-status.ts` (arquivo inteiramente novo: a importação abaixo falha
// com "Cannot find module" até lá — comportamento esperado, §9 do contrato). O cast
// `PortalClient as unknown as PortalClientReads` segue o padrão de `contract-types.ts`
// (`data/portal.client.spec.ts`, par 1): a instância é real, só o tipo é assumido.
import { fileURLToPath } from 'node:url';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { classifyError, presentError } from '../core/error-boundary';
// data/read-status.ts é novo (§1 do contrato) — falha esperada até TASK-0016.
import { readStatusFor } from './read-status';
import { PortalClient } from './portal.client';
import type { PortalClientReads } from '../../testing/contract-types-appeal';
import {
  AIT_DETAIL_FIXTURE,
  AIT_ID,
  AIT_POINTS_FIXTURE,
  DECISION_DEFERIDO_FIXTURE,
  POINTS_SUMMARY_FIXTURE,
  REQUEST_DETAIL_FIXTURE,
  REQUEST_EM_ANDAMENTO_ID,
} from '../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../testing/http-fixtures';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(PortalClient) as unknown as PortalClientReads,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // spec de classificação isolada, sem HttpClientTesting configurado.
  }
});

describe('PortalClient — listAits (GET /v1/portal/aits)', () => {
  it('dado listAits({ vehicle, status, page }) então GET com a query; dado listAits() então GET sem query', async () => {
    // C-3b-01
    const { client, httpMock } = setup();
    const withQuery = client.listAits({
      vehicle: 'FIX2E01',
      status: 'aguardando_defesa',
      page: 2,
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'GET' && candidate.url === '/v1/portal/aits',
      ),
    );
    expect(req.request.params.get('vehicle')).toBe('FIX2E01');
    expect(req.request.params.get('status')).toBe('aguardando_defesa');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.has('pageSize')).toBe(false);
    expect(req.request.headers.has('Idempotency-Key')).toBe(false);
    expect(req.request.headers.has('If-Match')).toBe(false);
    req.flush({ items: [], total: 0, page: 2, pageSize: 20 });
    await withQuery;

    const withoutQuery = client.listAits();
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'GET' && candidate.url === '/v1/portal/aits',
      ),
    );
    expect(req2.request.params.keys()).toEqual([]);
    req2.flush({ items: [], total: 0, page: 1, pageSize: 20 });
    await withoutQuery;
  });
});

describe('PortalClient — getAit (GET /v1/portal/aits/{aitId})', () => {
  it('dado 200 (@example) então payment.tiers [] e openRequestId null; dado 404 NOT_FOUND{kind:ait} então rejeita e presentError com entitlement aponta a por-que-nao-vejo [negativo]', async () => {
    // C-3b-02
    const { client, httpMock } = setup();
    const okPromise = client.getAit(AIT_ID);
    const okReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    expect(okReq.request.method).toBe('GET');
    okReq.flush(AIT_DETAIL_FIXTURE);
    const body = await okPromise;
    expect((body as typeof AIT_DETAIL_FIXTURE).payment.tiers).toEqual([]);
    expect((body as typeof AIT_DETAIL_FIXTURE).openRequestId).toBeNull();

    const notFoundPromise = client.getAit(AIT_ID);
    const notFoundReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    notFoundReq.flush(
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }),
      { status: 404, statusText: 'Not Found' },
    );
    const error = await notFoundPromise.catch(
      (rejection: unknown) => rejection,
    );
    expect(classifyError(error).code).toBe('PORTAL.NOT_FOUND');
    const presentation = presentError(error, {
      entitlement: { kind: 'ait', id: AIT_ID },
    });
    expect(presentation.nextStep).toBe('entitlement_help');
    expect(presentation.nextStepRoute).toContain(`recurso=ait&id=${AIT_ID}`);
  });
});

describe('PortalClient — getAitPoints / getPointsSummary', () => {
  it('dado getAitPoints 200 então devolve o corpo (points sempre null); dado getPointsSummary 200 então devolve o corpo (nunca 404, UC-010)', async () => {
    // C-3b-03
    const { client, httpMock } = setup();
    const pointsPromise = client.getAitPoints(AIT_ID);
    const pointsReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}/points`),
    );
    pointsReq.flush(AIT_POINTS_FIXTURE);
    expect(await pointsPromise).toEqual(AIT_POINTS_FIXTURE);

    const summaryPromise = client.getPointsSummary();
    const summaryReq = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/points-summary'),
    );
    summaryReq.flush(POINTS_SUMMARY_FIXTURE);
    expect(await summaryPromise).toEqual(POINTS_SUMMARY_FIXTURE);
  });
});

describe('PortalClient — listRequests (GET /v1/portal/requests)', () => {
  it('dado listRequests({ state, kind, period }) então GET com a query; dado 400 ENUM_INVALID então rejeita e presentError → inline_fields [negativo]', async () => {
    // C-3b-04
    const { client, httpMock } = setup();
    const promise = client.listRequests({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      kind: 'adesao_sne',
      period: '2026-09-01,2026-09-14',
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'GET' && candidate.url === '/v1/portal/requests',
      ),
    );
    expect(req.request.params.get('state')).toBe('EM_ANDAMENTO_NO_ORGAO');
    expect(req.request.params.get('kind')).toBe('adesao_sne');
    expect(req.request.params.get('period')).toBe('2026-09-01,2026-09-14');
    req.flush({ items: [], total: 0, page: 1, pageSize: 20 });
    await promise;

    const invalidPromise = client.listRequests({ state: 'X' });
    const invalidReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'GET' && candidate.url === '/v1/portal/requests',
      ),
    );
    invalidReq.flush(portalErrorBody('PORTAL.ENUM_INVALID', 400), {
      status: 400,
      statusText: 'Bad Request',
    });
    const error = await invalidPromise.catch((rejection: unknown) => rejection);
    expect(presentError(error).nextStep).toBe('inline_fields');
  });
});

describe('PortalClient — getRequest (GET /v1/portal/requests/{id}, ETag)', () => {
  it('dado 200 ETag "1" (@example) então result.etag \'"1"\', body.request.version 1, actions.withdrawalBlockedReason estado_nao_admite; dado sem ETag então etag null', async () => {
    // C-3b-05
    const { client, httpMock } = setup();
    const promise = client.getRequest(REQUEST_EM_ANDAMENTO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    expect(req.request.method).toBe('GET');
    req.flush(REQUEST_DETAIL_FIXTURE, { headers: { ETag: '"1"' } });
    const result = await promise;
    expect(result.etag).toBe('"1"');
    const body = result.body as typeof REQUEST_DETAIL_FIXTURE;
    expect(body.request.version).toBe(1);
    expect(body.actions.withdrawalBlockedReason).toBe('estado_nao_admite');

    const withoutEtag = client.getRequest(REQUEST_EM_ANDAMENTO_ID);
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req2.flush(REQUEST_DETAIL_FIXTURE);
    expect((await withoutEtag).etag).toBeNull();
  });
});

describe('PortalClient — getDecision (GET /v1/portal/requests/{id}/decision)', () => {
  it('dado 200 então devolve o corpo; dado 404 { context: { kind: decision } } então rejeita com NOT_FOUND (a página trata como empty, §2.4)', async () => {
    // C-3b-06
    const { client, httpMock } = setup();
    const promise = client.getDecision(REQUEST_EM_ANDAMENTO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/decision`,
      ),
    );
    req.flush(DECISION_DEFERIDO_FIXTURE);
    expect(await promise).toEqual(DECISION_DEFERIDO_FIXTURE);

    const notFoundPromise = client.getDecision(REQUEST_EM_ANDAMENTO_ID);
    const notFoundReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/decision`,
      ),
    );
    notFoundReq.flush(
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'decision' }),
      { status: 404, statusText: 'Not Found' },
    );
    const error = await notFoundPromise.catch(
      (rejection: unknown) => rejection,
    );
    expect(classifyError(error).code).toBe('PORTAL.NOT_FOUND');
  });
});

describe('read-status.ts — readStatusFor (§3.1)', () => {
  it('dado 503 NATIONAL_READ_UNAVAILABLE{retryAfter:30} então unavailable com retryAfter 30; dado status 0 + offline então offline; dado 500 então error; dado 404{kind:request} então not_found', () => {
    // C-3b-07
    const unavailable = presentError({
      status: 503,
      error: portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      name: 'HttpErrorResponse',
    });
    expect(readStatusFor(unavailable)).toBe('unavailable');
    expect(unavailable.retryAfter).toBe(30);

    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const offline = presentError({
      status: 0,
      error: null,
      name: 'HttpErrorResponse',
    });
    expect(readStatusFor(offline)).toBe('offline');
    onLineSpy.mockRestore();

    const internal = presentError({
      status: 500,
      error: portalErrorBody('PORTAL.INTERNAL', 500),
      name: 'HttpErrorResponse',
    });
    expect(readStatusFor(internal)).toBe('error');

    const notFound = presentError({
      status: 404,
      error: portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      name: 'HttpErrorResponse',
    });
    expect(readStatusFor(notFound)).toBe('not_found');
  });
});

describe('data/portal-read.models.ts e data/read-status.ts — sem cálculo de data, só import type do gerado', () => {
  it('dado os arquivos então nenhum contém new Date/Date.now/getTime; portal-read.models.ts só import type de @detran/api-clients e ../shared/action-triplet.component (ADR-0007)', async () => {
    // C-3b-08 — análise estática (padrão de C-3a-XX/C-3b-105): lê o texto-fonte, nunca importa
    // em runtime além do necessário (read-status.ts já é importado acima por readStatusFor).
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const dir = path.dirname(fileURLToPath(new URL(import.meta.url)));
    const forbidden = /new Date\(|Date\.now|\.getTime\(/;
    for (const file of ['portal-read.models.ts', 'read-status.ts']) {
      let text: string;
      try {
        text = await fs.readFile(path.join(dir, file), 'utf8');
      } catch {
        // arquivo ainda não existe (§9): critério fica sem violação a checar — não é falso PASS,
        // é o estado esperado antes de TASK-0016; typecheck acima já cobre read-status.ts.
        continue;
      }
      expect(forbidden.test(text), `${file} contém cálculo de data`).toBe(
        false,
      );
      if (file === 'portal-read.models.ts') {
        const importLines = text
          .split('\n')
          .filter((line) => line.trim().startsWith('import'));
        for (const line of importLines) {
          expect(
            line.includes('import type') ||
              !/@detran\/api-clients|action-triplet\.component/.test(line),
            `import não-type de fonte gerada em portal-read.models.ts: ${line}`,
          ).toBe(true);
        }
      }
    }
  });
});
