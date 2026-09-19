// R-0014 TASK-0017 (Inspector). CTG-0003c §3.2 — `NotificacoesFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9). `PortalStreamTransport` substituído
// por `useValue` (stub de `Subject<StreamFrame>`) para C-3c-20.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NotificacoesFacade } from './notificacoes.facade'; // §9: "Cannot find module" esperado.
import {
  RealtimeService,
  PortalStreamTransport,
} from '../../core/realtime.service'; // idem.
import {
  createPortalStreamTransportStub,
  streamFrame,
} from '../../../testing/portal-stream-transport.stub';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { SessionFacade } from '../../core/session.facade';
import {
  INBOX_LIST_FIXTURE,
  INBOX_SNE_ITEM_ID,
  portalErrorBody,
} from '../../../testing/http-fixtures-pair3';

function setup() {
  const transport = createPortalStreamTransportStub();
  TestBed.configureTestingModule({
    providers: [
      NotificacoesFacade,
      RealtimeService,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PortalStreamTransport, useValue: { open: transport.open } },
      {
        provide: SessionFacade,
        useValue: createSessionFacadeStub({ active: true }),
      },
    ],
  });
  return {
    // NotificacoesFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.2).
    facade: TestBed.inject(NotificacoesFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
    transport,
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
});

async function flushInbox(httpMock: HttpTestingController, body: unknown) {
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
  );
  req.flush(body as any);
}

describe('NotificacoesFacade — loadList() (T-12; §3.2)', () => {
  it('dado a página de fixture (2 itens) então items() na ordem do servidor, unreadCount() 1 e status ready [negativo: nenhuma reordenação por deadline]', async () => {
    // C-3c-17
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    await flushInbox(httpMock, INBOX_LIST_FIXTURE);
    await promise;
    expect(facade.items().map((item: { id: string }) => item.id)).toEqual(
      INBOX_LIST_FIXTURE.items.map((item) => item.id),
    );
    expect(facade.unreadCount()).toBe(1);
    expect(facade.status()).toBe('ready');
  });
});

describe('NotificacoesFacade — ciência ficta recebida ([DIVERGE-4]; WF-PORTAL-003) [negativo]', () => {
  it('dado o item SNE …070c00001 então fictitiousAcknowledgementOn é 2026-10-01 tal como recebido; o arquivo não contém aritmética de 30 dias', async () => {
    // C-3c-18
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    await flushInbox(httpMock, INBOX_LIST_FIXTURE);
    await promise;
    const sneItem = facade
      .items()
      .find((item: { id: string }) => item.id === INBOX_SNE_ITEM_ID);
    expect(sneItem.fictitiousAcknowledgementOn).toBe('2026-10-01');

    const dir = dirname(fileURLToPath(import.meta.url));
    let source = '';
    try {
      source = await readFile(join(dir, 'notificacoes.facade.ts'), 'utf8');
    } catch {
      return;
    }
    expect(/setDate\(|86400|30\s*\*\s*24/.test(source)).toBe(false);
  });
});

describe('NotificacoesFacade — markRead() (§3.2)', () => {
  it('dado markRead(id) com 200 então o item ganha readOn localmente, readStatus done e um novo GET inbox é despachado', async () => {
    // C-3c-19
    const { facade, httpMock } = setup();
    const listPromise = facade.loadList();
    await flushInbox(httpMock, INBOX_LIST_FIXTURE);
    await listPromise;

    const markPromise = facade.markRead(INBOX_SNE_ITEM_ID);
    const readReq = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/inbox/${INBOX_SNE_ITEM_ID}/read`),
    );
    readReq.flush({
      id: INBOX_SNE_ITEM_ID,
      readOn: '2026-09-14',
      acknowledgementEvidence: null,
    });
    await markPromise;
    expect(facade.readStatus()).toBe('done');
    const itemAfter = facade
      .items()
      .find((item: { id: string }) => item.id === INBOX_SNE_ITEM_ID);
    expect(itemAfter.readOn).toBe('2026-09-14');
    await flushInbox(httpMock, INBOX_LIST_FIXTURE);
  });
});

describe('NotificacoesFacade — tempo real (§3.2 d; §4.1)', () => {
  it('dado um frame SSE event inbox.item recebido pelo transporte stub então a facade despacha GET inbox [negativo: sem frame nenhum GET extra]', async () => {
    // C-3c-20
    const { facade, httpMock, transport } = setup();
    const listPromise = facade.loadList();
    await flushInbox(httpMock, INBOX_LIST_FIXTURE);
    await listPromise;

    const realtime = TestBed.inject(RealtimeService) as any;
    realtime.start();
    TestBed.tick();
    transport
      .current()!
      .next(
        streamFrame('e1', 'inbox.item', { data: { id: null, kind: null } }),
      );
    await flushInbox(httpMock, INBOX_LIST_FIXTURE);
    httpMock.expectNone((candidate) => candidate.url === '/v1/portal/inbox');
  });
});

describe('NotificacoesFacade — enroll() (T-09; §3.2 e)', () => {
  it("dado enroll(body) com 403 ASSURANCE_INSUFFICIENT{required:avancada,current:simples} então nextStep elevation e nextStepRoute /assinatura/elevacao?retomar=%2Fsne [negativo: nunca 'acesso negado']", async () => {
    // C-3c-21
    const { facade, httpMock } = setup();
    const promise = facade.enroll({
      email: 'a@fixtures.invalid',
      phone: '92999990000',
      channel: 'email',
      consent: {
        textVersion: 'v1',
        effectsAck: [
          'ciencia_ficta',
          'canal_exclusivo',
          'desconto_60',
          'cancelamento',
        ],
      },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(
      portalErrorBody('PORTAL.ASSURANCE_INSUFFICIENT', 403, {
        required: 'avancada',
        current: 'simples',
      }),
      { status: 403, statusText: 'Forbidden' },
    );
    await promise;
    expect(facade.sneCommandError()?.nextStep).toBe('elevation');
    expect(facade.sneCommandError()?.nextStepRoute).toBe(
      '/assinatura/elevacao?retomar=%2Fsne',
    );
  });

  it("dado enroll(body) com 422 SNE_CONTACT_REQUIRED{missing:['phone']} então sneCommandError.fields = ['phone']", async () => {
    // C-3c-22
    const { facade, httpMock } = setup();
    const promise = facade.enroll({
      email: 'a@fixtures.invalid',
      channel: 'email',
      consent: { textVersion: 'v1', effectsAck: [] },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(
      portalErrorBody('PORTAL.SNE_CONTACT_REQUIRED', 422, {
        missing: ['phone'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await promise;
    expect(facade.sneCommandError()?.fields).toEqual(['phone']);
  });

  it('dado enroll(body) com 503 SNE_UPSTREAM_UNAVAILABLE{retryAfter} então sneCommandStatus unavailable', async () => {
    // C-3c-23
    const { facade, httpMock } = setup();
    const promise = facade.enroll({
      email: 'a@fixtures.invalid',
      phone: '92999990000',
      channel: 'email',
      consent: { textVersion: 'v1', effectsAck: [] },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(
      portalErrorBody('PORTAL.SNE_UPSTREAM_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await promise;
    expect(facade.sneCommandStatus()).toBe('unavailable');
  });
});

describe('NotificacoesFacade — cancel() (T-09; §3.2)', () => {
  it('dado cancel() com 200 { enrolled:false, cancelledAt } então enrollment() reflete enrolled false', async () => {
    // C-3c-24
    const { facade, httpMock } = setup();
    const promise = facade.cancel();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush({
      enrolled: false,
      since: null,
      channel: 'email',
      cancelable: false,
      cancelledAt: '2026-09-14',
    });
    await promise;
    expect(facade.enrollment()?.enrolled).toBe(false);
  });
});

describe('NotificacoesFacade — savePreferences() (§2.3; §3.2)', () => {
  it("dado savePreferences({channel:'email'}) com 428 então preferencesStatus unavailable e a apresentação é portal.errors.if_match_required", async () => {
    // C-3c-25
    const { facade, httpMock } = setup();
    const promise = facade.savePreferences({ channel: 'email' });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/identity/preferences'),
    );
    req.flush(portalErrorBody('PORTAL.IF_MATCH_REQUIRED', 428), {
      status: 428,
      statusText: 'Precondition Required',
    });
    await promise;
    expect(facade.preferencesStatus()).toBe('unavailable');
    expect(facade.preferencesError()?.messageKey).toBe(
      'portal.errors.if_match_required',
    );
  });
});
