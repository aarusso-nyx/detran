// R-0014 TASK-0015 (Inspector). CTG-0003b §3.2 — `AutosFacade` (T-14/T-01); arquivo inteiramente
// novo (§1) — a importação abaixo falha com "Cannot find module" até TASK-0016 (comportamento
// esperado, §9 do contrato).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AutosFacade } from './autos.facade';
import {
  AIT_DETAIL_FIXTURE,
  AIT_ID,
  AIT_POINTS_FIXTURE,
} from '../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../testing/http-fixtures';

function setup() {
  TestBed.configureTestingModule({
    providers: [AutosFacade, provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    // AutosFacade ainda não existe (§9): o import falha com "Cannot find module" e o tipo da
    // classe vira `any`/`unknown` — cast documenta a assinatura assumida (§3.2 do contrato),
    // mesmo padrão de `service-wizard.component.spec.ts` (CTG-0003a).
    facade: TestBed.inject(AutosFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('AutosFacade — loadList()/setQuery() (T-14)', () => {
  it('dado loadList() e 200 com 1 item então status ready e items().length 1; dado total 0 então empty; dado 503 então unavailable com messageKey national_read_unavailable', async () => {
    // C-3b-09
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    req.flush({
      items: [{ aitId: AIT_ID, situation: 'aguardando_defesa' }],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    await promise;
    expect(facade.status()).toBe('ready');
    expect(facade.items().length).toBe(1);

    await facade.loadList();
    const emptyReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    emptyReq.flush({ items: [], total: 0, page: 1, pageSize: 20 });
    await vi.waitFor(() => expect(facade.status()).toBe('empty'));

    await facade.loadList();
    const errorReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    errorReq.flush(
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await vi.waitFor(() => expect(facade.status()).toBe('unavailable'));
    expect(facade.error()?.messageKey).toBe(
      'portal.errors.national_read_unavailable',
    );
  });
});

describe('AutosFacade — setQuery() ([DIVERGE-7]: filtro no servidor)', () => {
  it('dado setQuery({ status: "em_defesa" }) após page 3 então nova requisição com status=em_defesa e page=1', async () => {
    // C-3b-10
    const { facade, httpMock } = setup();
    await facade.setQuery({ page: 3 });
    const firstReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    firstReq.flush({ items: [], total: 0, page: 3, pageSize: 20 });

    await facade.setQuery({ status: 'em_defesa' });
    const secondReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    expect(secondReq.request.params.get('status')).toBe('em_defesa');
    expect(secondReq.request.params.get('page')).toBe('1');
    secondReq.flush({ items: [], total: 0, page: 1, pageSize: 20 });
  });
});

describe('AutosFacade — loadPointsSummary() independente de loadList()', () => {
  it('dado loadPointsSummary() 500 e loadList() 200 então status ready e pointsStatus error (falhas independentes)', async () => {
    // C-3b-11
    const { facade, httpMock } = setup();
    const listPromise = facade.loadList();
    const pointsPromise = facade.loadPointsSummary();
    const listReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    listReq.flush({
      items: [{ aitId: AIT_ID }],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const pointsReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/points-summary',
      ),
    );
    pointsReq.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await listPromise;
    await pointsPromise;
    expect(facade.status()).toBe('ready');
    expect(facade.pointsStatus()).toBe('error');
  });
});

describe('AutosFacade — loadAit() (T-01)', () => {
  it('dado loadAit(id) e 200 então ait() preenchido e uma chamada a /aits/{id}/points; dado /points 500 então aitStatus permanece ready e aitPoints() null', async () => {
    // C-3b-12
    const { facade, httpMock } = setup();
    const promise = facade.loadAit(AIT_ID);
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    aitReq.flush(AIT_DETAIL_FIXTURE);
    const pointsReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}/points`),
    );
    pointsReq.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await promise;
    expect(facade.ait()).toEqual(AIT_DETAIL_FIXTURE);
    expect(facade.aitStatus()).toBe('ready');
    expect(facade.aitPoints()).toBeNull();
    void AIT_POINTS_FIXTURE;
  });

  it('dado loadAit e 404 NOT_FOUND{kind:ait} então aitStatus not_found e aitError().nextStepRoute contém recurso=ait&id=<aitId> [negativo]', async () => {
    // C-3b-13
    const { facade, httpMock } = setup();
    const promise = facade.loadAit(AIT_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }), {
      status: 404,
      statusText: 'Not Found',
    });
    await promise;
    expect(facade.aitStatus()).toBe('not_found');
    expect(facade.aitError()?.nextStepRoute).toContain(
      `recurso=ait&id=${AIT_ID}`,
    );
  });
});
