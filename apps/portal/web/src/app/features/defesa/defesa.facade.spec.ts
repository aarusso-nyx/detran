// R-0014 TASK-0015 (Inspector, iteração 2 — bloqueio 1 de reports/TASK-0016.md). CTG-0003b §3.4 —
// `DefesaFacade` (T-02/T-03/T-04). Um `it` por cenário (nunca duas montagens no mesmo `it`: o
// TestBed só reseta entre `it`s, via `afterEach` global).
//
// Assunção assumida (o `ActFacadeState.load(): Promise<void>` do contrato §3.4 não fixa
// parâmetros, mas a tabela da mesma seção lista contextos distintos por tela — getAit(aitId)
// para T-02, getRequest(requestId) para T-03/T-04; registrada no relatório de entrega, mesmo
// padrão de `service-wizard.component.spec.ts` §5.4): `load({ screen: 'T-02', aitId })` |
// `load({ screen: 'T-03' | 'T-04', requestId })`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DefesaFacade } from './defesa.facade';
import {
  AIT_DETAIL_FIXTURE,
  AIT_ID,
  CASE_EXTERNAL_ID_FIXTURE,
  REQUEST_COMPOSICAO_ID,
  REQUEST_EM_ANDAMENTO_ID,
} from '../../../testing/http-fixtures-reads';

function setup() {
  TestBed.configureTestingModule({
    providers: [DefesaFacade, provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    // DefesaFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.4).
    facade: TestBed.inject(DefesaFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('DefesaFacade — T-02 (getAit + resumeFromOpenRequest)', () => {
  it('dado GET aits/{id} → openRequestId preenchido (PEDIDO_EM_COMPOSICAO, defesa_previa) então resume() preenchido e nenhum POST requests', async () => {
    // C-3b-28 (1.ª metade)
    const { facade, httpMock } = setup();
    const promise = (
      facade as unknown as {
        load: (params: { screen: 'T-02'; aitId: string }) => Promise<void>;
      }
    ).load({ screen: 'T-02', aitId: AIT_ID });
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    aitReq.flush({
      ...AIT_DETAIL_FIXTURE,
      openRequestId: REQUEST_COMPOSICAO_ID,
    });
    const requestReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}`),
    );
    requestReq.flush({
      request: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        serviceKey: 'defesa_previa',
        targetKind: 'ait',
        targetId: AIT_ID,
        draft: { facts: 'a' },
        version: 1,
      },
    });
    await promise;
    expect(facade.resume()).not.toBeNull();
    httpMock.expectNone(
      (candidate) =>
        candidate.method === 'POST' && candidate.url === '/v1/portal/requests',
    );
  });

  it('dado openRequestId null então resume() null (a página chama start())', async () => {
    // C-3b-28 (2.ª metade)
    const { facade, httpMock } = setup();
    const promise = (
      facade as unknown as {
        load: (params: { screen: 'T-02'; aitId: string }) => Promise<void>;
      }
    ).load({ screen: 'T-02', aitId: AIT_ID });
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/aits/${AIT_ID}`),
    );
    aitReq.flush(AIT_DETAIL_FIXTURE);
    await promise;
    expect(facade.resume()).toBeNull();
  });
});

describe('DefesaFacade — T-03 (target via delegation.externalId, [DIVERGE-4])', () => {
  it('dado GET requests/{rid} → delegation.externalId e actions.canAppeal true então target() { recurso_jari, case, externalId }', async () => {
    // C-3b-29 (1.ª metade)
    const { facade, httpMock } = setup();
    const promise = (
      facade as unknown as {
        load: (params: { screen: 'T-03'; requestId: string }) => Promise<void>;
      }
    ).load({ screen: 'T-03', requestId: REQUEST_EM_ANDAMENTO_ID });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req.flush({
      request: {
        requestId: REQUEST_EM_ANDAMENTO_ID,
        state: 'RESULTADO_DISPONIVEL',
        delegation: { externalId: CASE_EXTERNAL_ID_FIXTURE },
      },
      actions: { canAppeal: true, nextInstanceServiceKey: 'recurso_jari' },
    });
    await promise;
    expect(facade.target()).toEqual({
      serviceKey: 'recurso_jari',
      targetKind: 'case',
      targetId: CASE_EXTERNAL_ID_FIXTURE,
    });
  });

  it('dado externalId null ou canAppeal false então target() null e status error com o texto de ineligible [negativo]', async () => {
    // C-3b-29 (2.ª metade)
    const { facade, httpMock } = setup();
    const promise = (
      facade as unknown as {
        load: (params: { screen: 'T-03'; requestId: string }) => Promise<void>;
      }
    ).load({ screen: 'T-03', requestId: REQUEST_EM_ANDAMENTO_ID });
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`),
    );
    req.flush({
      request: {
        requestId: REQUEST_EM_ANDAMENTO_ID,
        state: 'RESULTADO_DISPONIVEL',
        delegation: { externalId: null },
      },
      actions: { canAppeal: false, nextInstanceServiceKey: null },
    });
    await promise;
    expect(facade.target()).toBeNull();
    expect(facade.status()).toBe('error');
  });
});
