// R-0014 TASK-0017 (Inspector). CTG-0003c §3.6 — `AtendimentoFacade`; arquivo inteiramente novo
// (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AtendimentoFacade } from './atendimento.facade'; // §9: "Cannot find module" esperado.
import { SessionFacade } from '../../core/session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import {
  MANIFESTATION_ACKNOWLEDGED_FIXTURE,
  MANIFESTATION_CIENCIA_FIXTURE,
  MANIFESTATION_CIENCIA_ID,
  MANIFESTATION_CREATED_FIXTURE,
  MANIFESTATION_ENCERRADA_FIXTURE,
  MANIFESTATION_ENCERRADA_ID,
  portalErrorBody,
} from '../../../testing/http-fixtures-pair3';

function setup(active = true) {
  TestBed.configureTestingModule({
    providers: [
      AtendimentoFacade,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SessionFacade, useValue: createSessionFacadeStub({ active }) },
    ],
  });
  return {
    // AtendimentoFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.6).
    facade: TestBed.inject(AtendimentoFacade) as any,
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

describe('AtendimentoFacade — create() (T-21; §3.6; [DIVERGE-19]/[DIVERGE-20])', () => {
  it('dado create(body) sem sessão então o corpo enviado tem anonymous:true e attachmentIds:[]', async () => {
    // C-3c-42 (1.ª parte)
    const { facade, httpMock } = setup(false);
    const promise = facade.create({ kind: 'reclamacao', text: 'x' });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    expect(req.request.body.anonymous).toBe(true);
    expect(req.request.body.attachmentIds).toEqual([]);
    req.flush(MANIFESTATION_CREATED_FIXTURE);
    await promise;
  });

  it('dado create(body) com sessão e checkbox desmarcado então anonymous:false', async () => {
    // C-3c-42 (2.ª parte)
    const { facade: facadeWithSession, httpMock: httpMock2 } = setup(true);
    const promise2 = facadeWithSession.create({
      kind: 'reclamacao',
      text: 'x',
      anonymous: false,
    });
    const req2 = await vi.waitFor(() =>
      httpMock2.expectOne('/v1/portal/manifestations'),
    );
    expect(req2.request.body.anonymous).toBe(false);
    req2.flush({ ...MANIFESTATION_CREATED_FIXTURE, anonymous: false });
    await promise2;
  });
});

describe('AtendimentoFacade — create() com sucesso (§5.6; RN-109 3)', () => {
  it('dado create com 201 então created() tem protocol e agencyDueOn', async () => {
    // C-3c-43
    const { facade, httpMock } = setup(true);
    const promise = facade.create({ kind: 'reclamacao', text: 'x' });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(MANIFESTATION_CREATED_FIXTURE);
    await promise;
    expect(facade.created()?.protocol).toBe(
      MANIFESTATION_CREATED_FIXTURE.protocol,
    );
    expect(facade.created()?.agencyDueOn).toBe(
      MANIFESTATION_CREATED_FIXTURE.agencyDueOn,
    );
  });
});

describe('AtendimentoFacade — create() com 400 (RN-109 1) [negativo]', () => {
  it("dado create com 400 MANIFESTATION_KIND_INVALID{allowed} então createError.fields ['kind']", async () => {
    // C-3c-44
    const { facade, httpMock } = setup(true);
    const promise = facade.create({ kind: 'reclamacao', text: 'x' });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(
      portalErrorBody('PORTAL.MANIFESTATION_KIND_INVALID', 400, {
        allowed: ['reclamacao', 'denuncia'],
      }),
      { status: 400, statusText: 'Bad Request' },
    );
    await promise;
    expect(facade.createError()?.fields).toEqual(['kind']);
  });
});

describe('AtendimentoFacade — create() com 500 (§3.6) [negativo]', () => {
  it('dado create com 500 então createError.messageKey não sugere recusa', async () => {
    // C-3c-45
    const { facade, httpMock } = setup(true);
    const promise = facade.create({ kind: 'reclamacao', text: 'x' });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await promise;
    expect(facade.createError()?.messageKey).not.toMatch(/recusad/);
  });
});

describe('AtendimentoFacade — loadDetail() (T-22; ENCERRADA com prorrogação; RN-109 4/5; UC-016 AC-4)', () => {
  it('dado …070700007 (ENCERRADA com extended) então detail().deadlines.extended tem justification e newDueOn e info_due_on nunca é exposto [negativo]', async () => {
    // C-3c-46
    const { facade, httpMock } = setup(true);
    const promise = facade.loadDetail(MANIFESTATION_ENCERRADA_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/manifestations/${MANIFESTATION_ENCERRADA_ID}`,
      ),
    );
    req.flush(MANIFESTATION_ENCERRADA_FIXTURE);
    await promise;
    expect(facade.detail()?.deadlines.extended?.justification).toBe(
      'fixture: prorrogação justificada',
    );
    expect(facade.detail()?.deadlines.extended?.newDueOn).toBe('2026-09-18');
    expect(
      (facade.detail() as { info_due_on?: unknown }).info_due_on,
    ).toBeUndefined();
  });
});

describe('AtendimentoFacade — acknowledge() (T-22; §3.6; [DIVERGE-18])', () => {
  it('dado state CIENCIA_AO_USUARIO então detail permite ciência; acknowledge com 200 então etag() "2", loadDetail despachado e evaluationOffered true habilita a avaliação inline', async () => {
    // C-3c-47
    const { facade, httpMock } = setup(true);
    const promise = facade.loadDetail(MANIFESTATION_CIENCIA_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/manifestations/${MANIFESTATION_CIENCIA_ID}`,
      ),
    );
    req.flush(MANIFESTATION_CIENCIA_FIXTURE);
    await promise;
    expect(facade.detail()?.state).toBe('CIENCIA_AO_USUARIO');

    const ackPromise = facade.acknowledge(MANIFESTATION_CIENCIA_ID);
    const ackReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/manifestations/${MANIFESTATION_CIENCIA_ID}/acknowledge`,
      ),
    );
    ackReq.flush(MANIFESTATION_ACKNOWLEDGED_FIXTURE, {
      headers: { ETag: '"2"' },
    });
    await ackPromise;
    expect(facade.etag()).toBe('"2"');
    const reloadReq = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/manifestations/${MANIFESTATION_CIENCIA_ID}`,
      ),
    );
    reloadReq.flush({
      ...MANIFESTATION_CIENCIA_FIXTURE,
      state: 'AVALIACAO_OFERECIDA',
      evaluationOffered: true,
    });
    await vi.waitFor(() =>
      expect(facade.detail()?.evaluationOffered).toBe(true),
    );
  });
});

describe('AtendimentoFacade — acknowledge() com 409 (§3.6) [negativo]', () => {
  it('dado acknowledge com 409 MANIFESTATION_STATE_INVALID então ackStatus error e nextStep reload', async () => {
    // C-3c-48
    const { facade, httpMock } = setup(true);
    const promise = facade.acknowledge(MANIFESTATION_CIENCIA_ID);
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        `/v1/portal/manifestations/${MANIFESTATION_CIENCIA_ID}/acknowledge`,
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.MANIFESTATION_STATE_INVALID', 409, {
        state: 'EM_ANALISE',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    await promise;
    expect(facade.ackStatus()).toBe('error');
    expect(facade.ackError()?.nextStep).toBe('reload');
  });
});

describe('AtendimentoFacade — evaluate() (T-26; §3.6)', () => {
  it('dado evaluate com 409 EVALUATION_ALREADY_SUBMITTED então evaluationError code correspondente', async () => {
    // C-3c-49 (1.ª parte)
    const { facade, httpMock } = setup(true);
    const promise = facade.evaluate({
      subjectKind: 'request',
      subjectId: 'r-1',
      scores: {
        satisfaction: 5,
        quality: 5,
        deadline: 5,
        clarity: 5,
        channel: 5,
      },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/evaluations'),
    );
    req.flush(portalErrorBody('PORTAL.EVALUATION_ALREADY_SUBMITTED', 409), {
      status: 409,
      statusText: 'Conflict',
    });
    await promise;
    expect(facade.evaluationError()?.code).toBe(
      'PORTAL.EVALUATION_ALREADY_SUBMITTED',
    );
  });

  it('dado evaluate com 409 EVALUATION_NOT_OFFERED então evaluationError code correspondente', async () => {
    // C-3c-49 (2.ª parte)
    const { facade: facade2, httpMock: httpMock2 } = setup(true);
    const promise2 = facade2.evaluate({
      subjectKind: 'request',
      subjectId: 'r-1',
      scores: {
        satisfaction: 5,
        quality: 5,
        deadline: 5,
        clarity: 5,
        channel: 5,
      },
    });
    const req2 = await vi.waitFor(() =>
      httpMock2.expectOne('/v1/portal/evaluations'),
    );
    req2.flush(portalErrorBody('PORTAL.EVALUATION_NOT_OFFERED', 409), {
      status: 409,
      statusText: 'Conflict',
    });
    await promise2;
    expect(facade2.evaluationError()?.code).toBe(
      'PORTAL.EVALUATION_NOT_OFFERED',
    );
  });

  it("dado evaluate com subjectKind:'manifestation' e 404 NOT_FOUND{kind:'manifestation'} então nextStepRoute usa recurso=manifestation (nunca recurso=request) (A12(f))", async () => {
    // A12(f)
    const { facade: facade3, httpMock: httpMock3 } = setup(true);
    const promise3 = facade3.evaluate({
      subjectKind: 'manifestation',
      subjectId: 'm-1',
      scores: {
        satisfaction: 5,
        quality: 5,
        deadline: 5,
        clarity: 5,
        channel: 5,
      },
    });
    const req3 = await vi.waitFor(() =>
      httpMock3.expectOne('/v1/portal/evaluations'),
    );
    req3.flush(
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'manifestation' }),
      { status: 404, statusText: 'Not Found' },
    );
    await promise3;
    expect(facade3.evaluationError()?.nextStepRoute).toBe(
      '/vinculo/por-que-nao-vejo?recurso=manifestation&id=m-1',
    );
    expect(facade3.evaluationError()?.nextStepRoute).not.toContain(
      'recurso=request',
    );
  });
});

describe('AtendimentoFacade — evaluate() com sucesso (§5.7)', () => {
  it("dado evaluate com 201 { publicNotice:'portal.evaluations.publicIndicator' } então evaluation().publicNotice é essa chave", async () => {
    // C-3c-50
    const { facade, httpMock } = setup(true);
    const promise = facade.evaluate({
      subjectKind: 'request',
      subjectId: 'r-1',
      scores: {
        satisfaction: 5,
        quality: 5,
        deadline: 5,
        clarity: 5,
        channel: 5,
      },
    });
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/evaluations'),
    );
    req.flush({
      evaluationId: 'e-1',
      subjectKind: 'request',
      subjectId: 'r-1',
      state: 'AVALIADA',
      submittedAt: '2026-09-14',
      publicNotice: 'portal.evaluations.publicIndicator',
    });
    await promise;
    expect(facade.evaluation()?.publicNotice).toBe(
      'portal.evaluations.publicIndicator',
    );
  });
});
