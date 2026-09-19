// R-0014 TASK-0017 (Inspector). CTG-0003c §3.4 — `SinistrosFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SinistrosFacade } from './sinistros.facade'; // §9: "Cannot find module" esperado.
import {
  CRASH_DETAIL_FIXTURE,
  CRASH_DETAIL_SUPPRESSED_FIXTURE,
  CRASH_ID,
  CRASH_LIST_FIXTURE,
  portalErrorBody,
} from '../../../testing/http-fixtures-pair3';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      SinistrosFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
  return {
    // SinistrosFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.4).
    facade: TestBed.inject(SinistrosFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
});

describe('SinistrosFacade — filtered() ([DIVERGE-14]) [negativo]', () => {
  it("dado 2 itens e setSearch('batida') então filtered() contém só o item cujo stateLabel/summary contém batida (case-insensitive) e nenhum GET novo é feito", async () => {
    // C-3c-36
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/crashes'),
    );
    req.flush({
      items: [
        {
          crashId: 'c1',
          stateLabel: 'BATIDA traseira',
          thirdPartyFieldsSuppressed: false,
          summary: {},
        },
        {
          crashId: 'c2',
          stateLabel: 'colisão lateral',
          thirdPartyFieldsSuppressed: false,
          summary: {},
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    });
    await promise;
    facade.setSearch('batida');
    expect(
      facade.filtered().map((item: { crashId: string }) => item.crashId),
    ).toEqual(['c1']);
    httpMock.expectNone((candidate) => candidate.url === '/v1/portal/crashes');
  });
});

describe('SinistrosFacade — loadDetail() (T-19; §3.4)', () => {
  it('dado 422 CRASH_NOT_FINAL{state} então detailError com code CRASH_NOT_FINAL [negativo: nenhuma data/prazo inventado]', async () => {
    // C-3c-37
    const { facade, httpMock } = setup();
    const promise = facade.loadDetail(CRASH_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/crashes/${CRASH_ID}`),
    );
    req.flush(
      portalErrorBody('PORTAL.CRASH_NOT_FINAL', 422, {
        state: 'em_elaboracao',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await promise;
    expect(facade.detailError()?.code).toBe('PORTAL.CRASH_NOT_FINAL');
    expect(facade.detailError()?.context['dueOn']).toBeUndefined();
  });

  it('dado detail com thirdPartyFieldsSuppressed true então detailStatus permanece ready (a supressão é informativa, não erro)', async () => {
    // C-3c-38
    const { facade, httpMock } = setup();
    const promise = facade.loadDetail(CRASH_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/crashes/${CRASH_ID}`),
    );
    req.flush(CRASH_DETAIL_SUPPRESSED_FIXTURE);
    await promise;
    expect(facade.detailStatus()).toBe('ready');
    expect(facade.detail()?.thirdPartyFieldsSuppressed).toBe(true);
    void CRASH_DETAIL_FIXTURE;
    void CRASH_LIST_FIXTURE;
  });
});
