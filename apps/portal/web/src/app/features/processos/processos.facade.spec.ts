// R-0014 TASK-0015 (Inspector). CTG-0003b §3.3 — `ProcessosFacade` (T-06/T-07/T-08/T-10/T-11);
// arquivo inteiramente novo (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProcessosFacade } from './processos.facade';
import {
  DECISION_DEFERIDO_FIXTURE,
  DILIGENCE_ID_FIXTURE,
  REQUEST_DETAIL_FIXTURE,
  REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
  REQUEST_EM_ANDAMENTO_ID,
  REQUEST_RESULTADO_ID,
} from '../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../testing/http-fixtures';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      ProcessosFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
  return {
    // ProcessosFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.3).
    facade: TestBed.inject(ProcessosFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('ProcessosFacade — sorted() (T-06; §3.3, [RN-RAIT-005])', () => {
  it('dado items com dueOn [2026-10-14, null, 2026-09-30] e sort urgencia então ordem [2026-09-30, 2026-10-14, null]; dois sem dueOn então updatedAt mais recente primeiro; o arquivo não contém cálculo de data', async () => {
    // C-3b-14
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
      ),
    );
    req.flush({
      items: [
        {
          requestId: 'a',
          situation: 'PROTOCOLADO',
          nextAction: { by: 'agency', dueOn: '2026-10-14' },
          updatedAt: '2026-09-01T12:00:00-04:00',
        },
        {
          requestId: 'b',
          situation: 'AGUARDANDO_PAGAMENTO',
          nextAction: { by: 'none', dueOn: null },
          updatedAt: '2026-09-05T12:00:00-04:00',
        },
        {
          requestId: 'c',
          situation: 'PROTOCOLADO',
          nextAction: { by: 'citizen', dueOn: '2026-09-30' },
          updatedAt: '2026-09-02T12:00:00-04:00',
        },
      ],
      total: 3,
      page: 1,
      pageSize: 20,
    });
    await promise;
    expect(facade.sort()).toBe('urgencia');
    expect(
      facade.sorted().map((item: { requestId: string }) => item.requestId),
    ).toEqual(['c', 'a', 'b']);

    // `dirname(fileURLToPath(...))` (não `new URL('.', import.meta.url)`): mesma técnica de
    // `i18n/i18n-keys.spec.ts` — evita o URL intermediário sem esquema `file:` neste ambiente de
    // teste (bloqueio 8 de reports/TASK-0016.md).
    const dir = dirname(fileURLToPath(import.meta.url));
    let source = '';
    try {
      source = await readFile(join(dir, 'processos.facade.ts'), 'utf8');
    } catch {
      return; // arquivo ainda não existe (§9) — nada a analisar estaticamente.
    }
    expect(/new Date\(|Date\.now|\.getTime\(|Date\.parse/.test(source)).toBe(
      false,
    );
  });
});

describe('ProcessosFacade — setSort() (T-06)', () => {
  it('dado setSort(atualizacao) então sorted() por updatedAt decrescente; nenhuma requisição nova', async () => {
    // C-3b-15
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
      ),
    );
    req.flush({
      items: [
        {
          requestId: 'a',
          situation: 'PROTOCOLADO',
          nextAction: { by: 'none', dueOn: null },
          updatedAt: '2026-09-01T12:00:00-04:00',
        },
        {
          requestId: 'b',
          situation: 'PROTOCOLADO',
          nextAction: { by: 'none', dueOn: null },
          updatedAt: '2026-09-05T12:00:00-04:00',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    });
    await promise;
    facade.setSort('atualizacao');
    expect(
      facade.sorted().map((item: { requestId: string }) => item.requestId),
    ).toEqual(['b', 'a']);
    httpMock.expectNone((candidate) => candidate.url === '/v1/portal/requests');
  });
});

describe('ProcessosFacade — loadDetail() (§2.2 ETag)', () => {
  it('dado loadDetail(id) e 200 ETag "1" então detail() e etag() \'"1"\'; dado corpo com version 2 e sem ETag então etag() \'"2"\' (etagOf)', async () => {
    // C-3b-16
    const { facade, httpMock } = setup();
    const promise = facade.loadDetail(REQUEST_EM_ANDAMENTO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req.flush(REQUEST_DETAIL_FIXTURE, { headers: { ETag: '"1"' } });
    await promise;
    expect(facade.etag()).toBe('"1"');
    expect(facade.detail()).toEqual(REQUEST_DETAIL_FIXTURE);

    await facade.loadDetail(REQUEST_EM_ANDAMENTO_ID);
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req2.flush({
      ...REQUEST_DETAIL_FIXTURE,
      request: { ...REQUEST_DETAIL_FIXTURE.request, version: 2 },
    });
    await vi.waitFor(() => expect(facade.etag()).toBe('"2"'));
  });
});

describe('ProcessosFacade — withdraw() (T-08; §2.2 — If-Match do etag())', () => {
  async function withDetailLoaded(
    facade: ProcessosFacade,
    httpMock: HttpTestingController,
  ) {
    const promise = facade.loadDetail(REQUEST_EM_ANDAMENTO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req.flush(REQUEST_DETAIL_FIXTURE, { headers: { ETag: '"1"' } });
    await promise;
  }

  it('dado withdraw(id, { confirm: true }) então POST .../withdraw com If-Match \'"1"\' e Idempotency-Key withdraw:<id>:<fp>; 200 DESISTIDO então commandStatus done e novo GET requests/{id}', async () => {
    // C-3b-17
    const { facade, httpMock } = setup();
    await withDetailLoaded(facade, httpMock);
    const promise = facade.withdraw(REQUEST_EM_ANDAMENTO_ID, {
      confirm: true,
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/withdraw`,
      ),
    );
    expect(req.request.headers.get('If-Match')).toBe('"1"');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      new RegExp(`^withdraw:${REQUEST_EM_ANDAMENTO_ID}:[0-9a-f]{64}$`),
    );
    req.flush({
      requestId: REQUEST_EM_ANDAMENTO_ID,
      state: 'DESISTIDO',
      withdrawnAt: '2026-09-14T12:00:00-04:00',
      version: 2,
    });
    await promise;
    expect(facade.commandStatus()).toBe('done');
    await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
  });

  it('dado withdraw e 409 WITHDRAWAL_AFTER_JUDGMENT então commandStatus error, messageKey withdrawal_after_judgment, nextStep none, nenhum novo GET [negativo]', async () => {
    // C-3b-18
    const { facade, httpMock } = setup();
    await withDetailLoaded(facade, httpMock);
    const promise = facade.withdraw(REQUEST_EM_ANDAMENTO_ID, {
      confirm: true,
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/withdraw`,
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.WITHDRAWAL_AFTER_JUDGMENT', 409, {
        state: 'EM_ANDAMENTO_NO_ORGAO',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    await promise;
    expect(facade.commandStatus()).toBe('error');
    expect(facade.commandError()?.messageKey).toBe(
      'portal.errors.withdrawal_after_judgment',
    );
    expect(facade.commandError()?.nextStep).toBe('none');
    httpMock.expectNone(
      (candidate) =>
        candidate.method === 'GET' &&
        candidate.url === `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`,
    );
  });

  it('dado withdraw e 412 VERSION_CONFLICT então commandError().nextStep reload [negativo]', async () => {
    // C-3b-19
    const { facade, httpMock } = setup();
    await withDetailLoaded(facade, httpMock);
    const promise = facade.withdraw(REQUEST_EM_ANDAMENTO_ID, {
      confirm: true,
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/withdraw`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.VERSION_CONFLICT', 412), {
      status: 412,
      statusText: 'Precondition Failed',
    });
    await promise;
    expect(facade.commandError()?.nextStep).toBe('reload');
  });
});

describe('ProcessosFacade — respondDiligence() (T-11)', () => {
  it('dado respondDiligence(rid, did-1, { text, attachmentIds: [] }) e 200 então POST com Idempotency-Key respond_diligence:did-1:<fp> e novo GET requests/{id}', async () => {
    // C-3b-20
    const { facade, httpMock } = setup();
    const promise = facade.respondDiligence(
      REQUEST_RESULTADO_ID,
      DILIGENCE_ID_FIXTURE,
      { text: 'x', attachmentIds: [] },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_RESULTADO_ID}/diligences/${DILIGENCE_ID_FIXTURE}/responses`,
      ),
    );
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      new RegExp(`^respond_diligence:${DILIGENCE_ID_FIXTURE}:`),
    );
    req.flush({ requestId: REQUEST_RESULTADO_ID, version: 2 });
    await promise;
    await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_RESULTADO_ID}`),
    );
  });

  it('dado respondDiligence e 422 SERVICE_UNAVAILABLE{unavailableReason: delegacao_indisponivel_r0007} então commandStatus unavailable, commandError().context.unavailableReason, nenhum id simulado (M15) [negativo]', async () => {
    // C-3b-21
    const { facade, httpMock } = setup();
    const promise = facade.respondDiligence(
      REQUEST_RESULTADO_ID,
      DILIGENCE_ID_FIXTURE,
      { text: 'x', attachmentIds: [] },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_RESULTADO_ID}/diligences/${DILIGENCE_ID_FIXTURE}/responses`,
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'delegacao_indisponivel_r0007',
        alternativeChannelNote: 'Atendimento presencial',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const result = await promise;
    expect(result).toBeNull();
    expect(facade.commandStatus()).toBe('unavailable');
    expect(facade.commandError()?.context['unavailableReason']).toBe(
      'delegacao_indisponivel_r0007',
    );
  });

  it('dado respondDiligence e 409 DILIGENCE_NOT_OPEN{outcome: answered} então commandStatus error com messageKey diligence_not_open [negativo]', async () => {
    // C-3b-22
    const { facade, httpMock } = setup();
    const promise = facade.respondDiligence(
      REQUEST_RESULTADO_ID,
      DILIGENCE_ID_FIXTURE,
      { text: 'x', attachmentIds: [] },
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_RESULTADO_ID}/diligences/${DILIGENCE_ID_FIXTURE}/responses`,
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.DILIGENCE_NOT_OPEN', 409, {
        outcome: 'answered',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    await promise;
    expect(facade.commandStatus()).toBe('error');
    expect(facade.commandError()?.messageKey).toBe(
      'portal.errors.diligence_not_open',
    );
  });
});

describe('ProcessosFacade — nextStepRoute() (§3.3)', () => {
  it('dado targetKind ait/targetId então recurso_jari/recurso_cetran/pagamento roteiam; adesao_sne e null não roteiam; dado targetKind case então pagamento não roteia', async () => {
    // C-3b-23
    const { facade, httpMock } = setup();
    const promise = facade.loadDetail(REQUEST_EM_ANDAMENTO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req.flush({
      ...REQUEST_DETAIL_FIXTURE,
      request: {
        ...REQUEST_DETAIL_FIXTURE.request,
        targetKind: 'ait',
        targetId: '00000000-0000-7000-8000-0000f0000005',
      },
    });
    await promise;
    expect(facade.nextStepRoute('recurso_jari')).toBe(
      `/processos/${REQUEST_EM_ANDAMENTO_ID}/jari/nova`,
    );
    expect(facade.nextStepRoute('recurso_cetran')).toBe(
      `/processos/${REQUEST_EM_ANDAMENTO_ID}/cetran/nova`,
    );
    expect(facade.nextStepRoute('pagamento')).toBe(
      '/autos/00000000-0000-7000-8000-0000f0000005/pagamento',
    );
    expect(facade.nextStepRoute('adesao_sne')).toBeNull();
    expect(facade.nextStepRoute(null)).toBeNull();

    await facade.loadDetail(REQUEST_EM_ANDAMENTO_ID);
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req2.flush({
      ...REQUEST_DETAIL_FIXTURE,
      request: { ...REQUEST_DETAIL_FIXTURE.request, targetKind: 'case' },
    });
    await vi.waitFor(() =>
      expect(facade.nextStepRoute('pagamento')).toBeNull(),
    );
  });
});

describe('ProcessosFacade — loadDecision() (T-10)', () => {
  it('dado loadDecision e 404 NOT_FOUND{kind:decision} então decisionStatus empty e decisionError() null; dado 404 kind request então not_found', async () => {
    // C-3b-24
    const { facade, httpMock } = setup();
    const promise = facade.loadDecision(REQUEST_EM_ANDAMENTO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/decision`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'decision' }), {
      status: 404,
      statusText: 'Not Found',
    });
    await promise;
    expect(facade.decisionStatus()).toBe('empty');
    expect(facade.decisionError()).toBeNull();

    await facade.loadDecision(REQUEST_EM_ANDAMENTO_ID);
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/decision`,
      ),
    );
    req2.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }), {
      status: 404,
      statusText: 'Not Found',
    });
    await vi.waitFor(() => expect(facade.decisionStatus()).toBe('not_found'));
    void DECISION_DEFERIDO_FIXTURE;
  });
});

describe('ProcessosFacade — diligence() (T-11)', () => {
  it('dado diligences [{ diligenceId: did-1, status: open }] então diligence(did-1) o objeto e diligence(x) null', async () => {
    // C-3b-25
    const { facade, httpMock } = setup();
    const promise = facade.loadDetail(REQUEST_RESULTADO_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_RESULTADO_ID}`),
    );
    req.flush(REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE);
    await promise;
    expect(facade.diligence(DILIGENCE_ID_FIXTURE)).not.toBeNull();
    expect(facade.diligence('x')).toBeNull();
  });
});
