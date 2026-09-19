// R-0014 TASK-0015 (Inspector). CTG-0003b §3.4 — `shared/wizard-resume.ts` (novo; §1) —
// "Cannot find module" até TASK-0016 (esperado, §9). `resumeFromOpenRequest` usa a leitura
// `getRequest` de `PortalClient` (arquivo "altera" — cast via `contract-types-appeal.ts`, mesmo
// padrão de `data/portal.client.reads.spec.ts`).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ResumeService } from '../core/resume.service';
import { PortalClient } from '../data/portal.client';
import type { PortalClientReads } from '../../testing/contract-types-appeal';
import { resumeFromOpenRequest, resumePointFor } from './wizard-resume';
import type { WizardTarget } from './service-wizard.store';
import {
  AIT_ID,
  REQUEST_COMPOSICAO_ID,
} from '../../testing/http-fixtures-reads';

const TARGET: WizardTarget = {
  serviceKey: 'defesa_previa',
  targetKind: 'ait',
  targetId: AIT_ID,
};
const RESUME_ROUTE = `/autos/${AIT_ID}/defesa/nova`;

describe('resumePointFor() ([UC-PORTAL-019] AC-4)', () => {
  it('dado ResumeService.save({ route, draft }) quando resumePointFor(resume, route, target) então devolve o draft e peek() passa a null (consumido); dado route ou serviceKey diferente então null e peek() intacto', () => {
    // C-3b-26
    TestBed.configureTestingModule({});
    const resume = TestBed.inject(ResumeService);
    const draft = {
      requestId: REQUEST_COMPOSICAO_ID,
      serviceKey: 'defesa_previa',
      targetKind: 'ait' as const,
      targetId: AIT_ID,
      step: 'assinatura' as const,
      etag: '"2"',
      values: { facts: 'x' },
    };
    resume.save({ route: RESUME_ROUTE, draft });
    const result = resumePointFor(resume, RESUME_ROUTE, TARGET);
    expect(result).toEqual(draft);
    expect(resume.peek()).toBeNull();

    resume.save({ route: RESUME_ROUTE, draft });
    expect(
      resumePointFor(resume, '/autos/outro/defesa/nova', TARGET),
    ).toBeNull();
    expect(resume.peek()).not.toBeNull();

    expect(
      resumePointFor(resume, RESUME_ROUTE, {
        ...TARGET,
        serviceKey: 'recurso_jari',
      }),
    ).toBeNull();
    expect(resume.peek()).not.toBeNull();
  });
});

describe('resumeFromOpenRequest() (§3.4)', () => {
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
    TestBed.inject(HttpTestingController).verify();
  });

  it('dado GET requests/{id} → PEDIDO_EM_COMPOSICAO { serviceKey: defesa_previa, targetKind: ait, targetId, draft: { facts: a }, version: 1 } então { requestId, step: composicao, etag: "1", values: { facts: a } }; dado state PROTOCOLADO então existing_request; dado serviceKey diferente então null', async () => {
    // C-3b-27
    const { client, httpMock } = setup();
    const promise = resumeFromOpenRequest(
      client as unknown as import('../data/portal.client').PortalClient,
      REQUEST_COMPOSICAO_ID,
      TARGET,
    );
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}`),
    );
    req.flush(
      {
        request: {
          requestId: REQUEST_COMPOSICAO_ID,
          state: 'PEDIDO_EM_COMPOSICAO',
          serviceKey: 'defesa_previa',
          targetKind: 'ait',
          targetId: AIT_ID,
          draft: { facts: 'a' },
          version: 1,
        },
      },
      { headers: { ETag: '"1"' } },
    );
    expect(await promise).toEqual({
      requestId: REQUEST_COMPOSICAO_ID,
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AIT_ID,
      step: 'composicao',
      etag: '"1"',
      values: { facts: 'a' },
    });

    const protocoladoPromise = resumeFromOpenRequest(
      client as unknown as import('../data/portal.client').PortalClient,
      REQUEST_COMPOSICAO_ID,
      TARGET,
    );
    const req2 = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}`),
    );
    req2.flush({
      request: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PROTOCOLADO',
        serviceKey: 'defesa_previa',
        targetKind: 'ait',
        targetId: AIT_ID,
        draft: null,
        version: 1,
      },
    });
    expect(await protocoladoPromise).toBe('existing_request');

    const otherServicePromise = resumeFromOpenRequest(
      client as unknown as import('../data/portal.client').PortalClient,
      REQUEST_COMPOSICAO_ID,
      TARGET,
    );
    const req3 = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/requests/${REQUEST_COMPOSICAO_ID}`),
    );
    req3.flush({
      request: {
        requestId: REQUEST_COMPOSICAO_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        serviceKey: 'indicacao_condutor',
        targetKind: 'ait',
        targetId: AIT_ID,
        draft: {},
        version: 1,
      },
    });
    expect(await otherServicePromise).toBeNull();
  });
});
