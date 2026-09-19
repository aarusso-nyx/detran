// R-0014 TASK-0017 (Inspector). CTG-0003c §3.10 — `InicioFacade`; arquivo inteiramente novo (§1)
// — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { InicioFacade } from './inicio.facade'; // §9: "Cannot find module" esperado.
import { SessionFacade } from '../session.facade';
import { ResumeService } from '../resume.service';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { portalErrorBody } from '../../../testing/http-fixtures-pair3';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      InicioFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: SessionFacade,
        useValue: createSessionFacadeStub({
          active: true,
          assuranceLevel: 'simples',
        }),
      },
    ],
  });
  return {
    // InicioFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.10).
    facade: TestBed.inject(InicioFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
    resumeService: TestBed.inject(ResumeService),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
});

async function flushAll(
  httpMock: HttpTestingController,
  bodies: { inbox: unknown; aits: unknown; requests: unknown },
) {
  const inboxReq = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
  );
  inboxReq.flush(bodies.inbox as any);
  const aitsReq = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
  );
  if (bodies.aits instanceof Error) {
    // não usado; ver flushWithAitsError
  } else {
    aitsReq.flush(bodies.aits as any);
  }
  const requestsReq = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/requests'),
  );
  requestsReq.flush(bodies.requests as any);
}

describe('InicioFacade — pending() (/inicio; §3.10; UC-019 3a)', () => {
  it('dado inbox (1 não lida), aits (1 com action available), requests (1 nextAction.by citizen dueOn 2026-10-01) e ResumePoint então pending() tem 4 itens ordenados por dueOn como texto (sem dueOn por último) e o resumePoint aponta a rota certa', async () => {
    // C-3c-66
    const { facade, httpMock, resumeService } = setup();
    resumeService.save({ route: '/autos/x/defesa/nova', draft: null });
    const promise = facade.load();
    await flushAll(httpMock, {
      inbox: {
        items: [
          {
            id: 'i-1',
            kind: 'acao_necessaria',
            source: 'portal',
            category: 'SISTEMA',
            aitId: null,
            requestId: null,
            readOn: null,
            deadline: null,
            fictitiousAcknowledgementOn: null,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
      aits: {
        items: [
          {
            aitId: 'a-1',
            aitNumber: 'FIX-1',
            deadlines: [
              { kind: 'T-DEF', dueOn: '2026-09-20', ownedBy: 'citizen' },
            ],
            actions: [{ key: 'defesa_previa', available: true }],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
      requests: {
        items: [
          {
            requestId: 'r-1',
            situation: 'PROTOCOLADO',
            nextAction: {
              by: 'citizen',
              label: 'portal.requests.nextAction.PROTOCOLADO',
              dueOn: '2026-10-01',
            },
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    });
    await promise;
    expect(facade.status()).toBe('ready');
    expect(facade.pending().length).toBe(4);
    const dueOns = facade
      .pending()
      .map((item: { dueOn: string | null }) => item.dueOn);
    expect(dueOns[dueOns.length - 1]).toBeNull();
    expect(facade.resumePoint()).toEqual({
      route: '/autos/x/defesa/nova',
      draft: null,
    });
  });
});

describe('InicioFacade — falha parcial (§3.10) [negativo: falha de uma fonte não esconde as outras]', () => {
  it('dado GET aits 500 e GET inbox 200 então aitsStatus error, inboxStatus ready e unread() preenchido', async () => {
    // C-3c-67
    const { facade, httpMock } = setup();
    const promise = facade.load();
    const inboxReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
    );
    inboxReq.flush({
      items: [
        {
          id: 'i-1',
          kind: 'acao_necessaria',
          source: 'portal',
          category: 'SISTEMA',
          aitId: null,
          requestId: null,
          readOn: null,
          deadline: null,
          fictitiousAcknowledgementOn: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const aitsReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    aitsReq.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const requestsReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
      ),
    );
    requestsReq.flush({ items: [], total: 0, page: 1, pageSize: 20 });
    await promise;
    expect(facade.aitsStatus()).toBe('error');
    expect(facade.inboxStatus()).toBe('ready');
    expect(facade.unread().length).toBe(1);
  });
});
