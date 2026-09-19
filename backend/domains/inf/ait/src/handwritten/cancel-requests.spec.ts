import { describe, expect, it, vi } from 'vitest';

import { AitLifecycleService } from '../ait-lifecycle.service.js';

/**
 * CTG-0001 §4.15/§4.17/§12/§13 itens 3/4/7 (R-0008, TASK-0002 iteração 3) —
 * C-0001-26..28 e a Adenda §13: o caminho 202 de `cancel-requests` quando o
 * AIT ainda não existe no servidor (M4), a incoerência `addressedTo` × `kind`
 * (item 3 amplia para `decision_body` divergente em `decide`), a segunda
 * decisão sobre um pedido já decidido, a guarda de estado do pedido e do AIT
 * em `decide` (item 4), e a validação de `originStatus` contra o vocabulário
 * canônico (item 7). A Adenda §12 grava `justification`/`requested_by`/
 * `idempotency_key`/`version` na própria linha de `ait_cancel_request`.
 * `AitLifecycleService.createCancelRequest`/`.decideCancelRequest` — ver
 * nota de design em `ait-state-transitions.matrix.spec.ts`.
 */

/** [WF-TEAT-001] — os 17 tokens de `inf.ait_state_ref` (DDL 14, §3 do contrato). */
const AIT_STATE_TOKENS = [
  'RASCUNHO_OFFLINE',
  'CANCELADO_RASCUNHO',
  'FINALIZADO_LOCAL',
  'ENFILEIRADO',
  'TRANSMITIDO',
  'RECEBIDO',
  'SUSPEITO_CONCORRENCIA',
  'VALIDANDO',
  'ACEITO',
  'REJEITADO',
  'PENDENTE_CORRECAO',
  'CORRIGIDO',
  'INTEGRADO',
  'PROCESSADO',
  'ARQUIVADO',
  'SOLICITADO_CANCEL_POSFINAL',
  'CANCELADO_POSFINAL',
];

function stubService(
  options: {
    cancelRequest?: Record<string, unknown>;
    ait?: Record<string, unknown>;
  } = {},
) {
  const cancelRequests = {
    create: vi.fn(async (dto: Record<string, unknown>) => ({
      id: 'cancel-request-1',
      status: 'requested',
      version: 1,
      ...dto,
    })),
    findOne: vi.fn(async () => options.cancelRequest),
    update: vi.fn(async (_id: string, patch: unknown) => patch),
  };
  const repositories = {
    ait: {
      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
      findOne: vi.fn(async () => {
        if (options.ait) return { ...options.ait };
        throw new Error(
          'não deveria consultar o AIT quando targetAitId/ait_id está ausente',
        );
      }),
      update: vi.fn(async (_id: string, patch: Record<string, unknown>) => ({
        ...(options.ait ?? {}),
        ...patch,
      })),
    } as never,
    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
    vehicles: {} as never,
    people: {} as never,
    corrections: {} as never,
    signatures: {} as never,
    printEvents: {} as never,
  };
  const outbox = { append: vi.fn(async () => ({ id: 'outbox-row-cr' })) };
  const service = new (
    AitLifecycleService as unknown as new (
      repositories: unknown,
      normative: unknown,
      collaborators?: unknown,
    ) => AitLifecycleService & {
      createCancelRequest?: (...args: unknown[]) => Promise<unknown>;
      decideCancelRequest?: (...args: unknown[]) => Promise<unknown>;
    }
  )(repositories, { assertActive: vi.fn() }, { cancelRequests, outbox });
  return { service, cancelRequests };
}

/** Rejects cleanly when the not-yet-implemented method is absent. */
function createCancelRequest(
  service: ReturnType<typeof stubService>['service'],
  dto: Record<string, unknown>,
): Promise<unknown> {
  return service.createCancelRequest
    ? service.createCancelRequest(dto)
    : Promise.reject(
        new Error(
          'AitLifecycleService.createCancelRequest ainda não existe (TASK-0003, M4)',
        ),
      );
}

function reviewCancelRequest(
  service: ReturnType<typeof stubService>['service'],
  requestId: string,
  actorId?: string,
): Promise<unknown> {
  return service.reviewCancelRequest
    ? service.reviewCancelRequest(requestId, actorId)
    : Promise.reject(
        new Error('AitLifecycleService.reviewCancelRequest ainda não existe'),
      );
}

function decideCancelRequest(
  service: ReturnType<typeof stubService>['service'],
  requestId: string,
  decision: string,
  decisionNote: string,
  actorId: string,
  options: Record<string, unknown> = {},
): Promise<unknown> {
  return service.decideCancelRequest
    ? service.decideCancelRequest(
        requestId,
        decision,
        decisionNote,
        actorId,
        options,
      )
    : Promise.reject(
        new Error(
          'AitLifecycleService.decideCancelRequest ainda não existe (TASK-0003, M4)',
        ),
      );
}

describe('AIT — cancel-requests: caminho 202 sem AIT no servidor (C-0001-26, M4)', () => {
  it('dado entityType="ait-cancel-posfinal-request" e targetAitId ausente então 202, pedido "requested" e context.targetLocalActId na resposta, nunca 404', async () => {
    const { service } = stubService();
    const result = (await createCancelRequest(service, {
      entityType: 'ait-cancel-posfinal-request',
      trafficAgencyId: 'agency-1',
      idempotencyKey: 'idem-202',
      targetLocalActId: 'local-act-202',
      originStatus: 'FINALIZADO_LOCAL',
      justification: 'AIT ainda não sincronizado',
      requestedBy: 'actor-1',
    })) as {
      status?: string;
      httpStatus?: number;
      context?: { targetLocalActId?: string };
    };
    expect(result.status).toBe('requested');
    expect(result.httpStatus).toBe(202);
    expect(result.context?.targetLocalActId).toBe('local-act-202');
  });
});

describe('AIT — cancel-requests: addressedTo incoerente com kind (C-0001-27)', () => {
  it('dado addressedTo="traffic-authority" e entityType="ait-cancel-posfinal-request" (kind=post_final espera diretoria-fiscalizacao) então 400 TEAT.VALIDATION_FAILED', async () => {
    const { service } = stubService();
    await expect(
      createCancelRequest(service, {
        entityType: 'ait-cancel-posfinal-request',
        addressedTo: 'traffic-authority',
        trafficAgencyId: 'agency-1',
        idempotencyKey: 'idem-mismatch',
        targetLocalActId: 'local-act-mismatch',
        originStatus: 'FINALIZADO_LOCAL',
        justification: 'endereçamento incoerente',
        requestedBy: 'actor-1',
      }),
    ).rejects.toMatchObject({ code: 'TEAT.VALIDATION_FAILED', status: 400 });
  });
});

describe('AIT — cancel-requests: originStatus validado contra o vocabulário canônico (§13 item 7)', () => {
  it('dado originStatus fora dos 17 tokens de inf.ait_state_ref então 400 TEAT.ENUM_INVALID com context.field="originStatus" e context.allowed[]', async () => {
    const { service } = stubService();
    await expect(
      createCancelRequest(service, {
        entityType: 'ait-cancel-request',
        trafficAgencyId: 'agency-1',
        idempotencyKey: 'idem-enum',
        targetLocalActId: 'local-act-enum',
        originStatus: 'ESTADO_INEXISTENTE',
        justification: 'token inválido',
        requestedBy: 'actor-1',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.ENUM_INVALID',
      status: 400,
      context: expect.objectContaining({
        field: 'originStatus',
        allowed: expect.arrayContaining(AIT_STATE_TOKENS),
      }),
    });
  });

  it('dado targetAitId presente com originStatus ≠ ait.current_status então 409 TEAT.AIT_STATE_INVALID', async () => {
    const { service } = stubService({
      ait: {
        id: 'ait-mismatch',
        current_status: 'FINALIZADO_LOCAL',
        version: 1,
      },
    });
    await expect(
      createCancelRequest(service, {
        entityType: 'ait-cancel-posfinal-request',
        trafficAgencyId: 'agency-1',
        idempotencyKey: 'idem-origin-mismatch',
        targetLocalActId: 'local-act-origin-mismatch',
        targetAitId: 'ait-mismatch',
        // AIT está FINALIZADO_LOCAL, mas o pedido alega RECEBIDO.
        originStatus: 'RECEBIDO',
        justification: 'origem divergente do estado real',
        requestedBy: 'actor-1',
      }),
    ).rejects.toMatchObject({ code: 'TEAT.AIT_STATE_INVALID', status: 409 });
  });
});

describe('AIT — cancel-requests/{id}/decide: decision_body divergente de addressed_to (§13 item 3)', () => {
  it('dado decision_body informado ≠ ait_cancel_request.addressed_to então 403 TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN antes de qualquer efeito (sem update na linha)', async () => {
    const { service, cancelRequests } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'requested',
        addressed_to: 'diretoria-fiscalizacao',
        ait_id: null,
        version: 1,
      },
    });
    await expect(
      decideCancelRequest(
        service,
        'cancel-request-1',
        'approve',
        'decision_body incoerente',
        'actor-1',
        { decisionBody: 'traffic-authority' },
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN',
      status: 403,
      context: expect.objectContaining({
        addressedTo: 'diretoria-fiscalizacao',
      }),
    });
    expect(cancelRequests.update).not.toHaveBeenCalled();
  });
});

describe('AIT — cancel-requests/{id}/decide: segunda decisão e guarda de estado (C-0001-28, §13 item 4)', () => {
  it('dado um pedido já approved quando decide outra vez então 409 TEAT.AIT_CANCEL_ALREADY_DECIDED com context.decidedAt', async () => {
    const decidedAt = '2026-09-14T10:00:00.000-04:00';
    const { service } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'approved',
        decided_at: decidedAt,
        version: 2,
      },
    });
    await expect(
      decideCancelRequest(
        service,
        'cancel-request-1',
        'approve',
        'segunda tentativa de decisão',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED',
      status: 409,
      context: expect.objectContaining({ decidedAt }),
    });
  });

  it('dado um pedido denied quando decide outra vez então 409 TEAT.AIT_CANCEL_ALREADY_DECIDED (mesma guarda para deny)', async () => {
    const decidedAt = '2026-09-14T11:00:00.000-04:00';
    const { service } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'denied',
        decided_at: decidedAt,
        version: 2,
      },
    });
    await expect(
      decideCancelRequest(
        service,
        'cancel-request-1',
        'deny',
        'segunda tentativa',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED',
      status: 409,
    });
  });

  it('dado um pedido em status fora de requested|under_review|approved|denied então 409 TEAT.AIT_STATE_INVALID (guarda defensiva, §13 item 4 "qualquer outro")', async () => {
    const { service } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'unexpected-status',
        version: 1,
      },
    });
    await expect(
      decideCancelRequest(
        service,
        'cancel-request-1',
        'approve',
        'decisão sobre status inesperado',
        'actor-1',
      ),
    ).rejects.toMatchObject({ code: 'TEAT.AIT_STATE_INVALID', status: 409 });
  });

  it('dado um pedido draft requested com ait_id presente mas o AIT não está em RASCUNHO_OFFLINE então 409 TEAT.AIT_STATE_INVALID com context.allowed=["RASCUNHO_OFFLINE"]', async () => {
    const { service } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'requested',
        kind: 'draft',
        ait_id: 'ait-draft-1',
        version: 1,
      },
      ait: {
        id: 'ait-draft-1',
        current_status: 'FINALIZADO_LOCAL',
        version: 1,
      },
    });
    await expect(
      decideCancelRequest(
        service,
        'cancel-request-1',
        'approve',
        'AIT já avançou além do rascunho',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        aitId: 'ait-draft-1',
        currentState: 'FINALIZADO_LOCAL',
        allowed: ['RASCUNHO_OFFLINE'],
      }),
    });
  });

  it('dado um pedido post_final requested com ait_id presente mas o AIT não está em SOLICITADO_CANCEL_POSFINAL então 409 TEAT.AIT_STATE_INVALID com context.allowed=["SOLICITADO_CANCEL_POSFINAL"]', async () => {
    const { service } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'requested',
        kind: 'post_final',
        ait_id: 'ait-postfinal-1',
        origin_status: 'FINALIZADO_LOCAL',
        version: 1,
      },
      ait: {
        id: 'ait-postfinal-1',
        current_status: 'ACEITO',
        version: 1,
      },
    });
    await expect(
      decideCancelRequest(
        service,
        'cancel-request-1',
        'approve',
        'AIT não está mais em SOLICITADO_CANCEL_POSFINAL',
        'actor-1',
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_STATE_INVALID',
      status: 409,
      context: expect.objectContaining({
        aitId: 'ait-postfinal-1',
        currentState: 'ACEITO',
        allowed: ['SOLICITADO_CANCEL_POSFINAL'],
      }),
    });
  });
});

/**
 * CTG-0001 §13 item 2 (Adenda, R-0008, TASK-0002 iteração 5) —
 * delivery-review ciclo 2, achado único: com `ait_id` nulo, `review`/`decide`
 * usam `ait_cancel_request.version` para `If-Match`/`ETag` (não pulam a
 * checagem). `getCancelRequestSummary` já devolve a versão certa por fonte
 * (`ait_ait.version` com `ait_id`, `ait_cancel_request.version` sem) — o que
 * falta é o próprio `reviewCancelRequest`/`decideCancelRequest` incrementar e
 * expor essa versão no retorno para o controlador montar o `ETag` (e o
 * controlador parar de pular `assertIfMatch`/`ETag` quando `ait_id` é nulo,
 * tratado em `ait-cancel-requests.controller.ts`, fora do meu "Pode tocar").
 */
describe('AIT — review/decide incrementam e expõem version do pedido quando ait_id é nulo (§13 item 2)', () => {
  it('dado um pedido requested com ait_id nulo (version=1) quando reviewCancelRequest então status="under_review" e version=2 no retorno', async () => {
    const { service, cancelRequests } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'requested',
        ait_id: null,
        version: 1,
      },
    });
    const result = (await reviewCancelRequest(
      service,
      'cancel-request-1',
      'actor-1',
    )) as { status?: string; version?: number };
    expect(result.status).toBe('under_review');
    expect(result.version).toBe(2);
    expect(cancelRequests.update).toHaveBeenCalledWith(
      'cancel-request-1',
      expect.objectContaining({ version: 2 }),
      expect.anything(),
    );
  });

  it('dado um pedido requested com ait_id nulo (version=1) quando decideCancelRequest com approve então version=2 no retorno', async () => {
    const { service } = stubService({
      cancelRequest: {
        id: 'cancel-request-1',
        status: 'requested',
        kind: 'draft',
        ait_id: null,
        version: 1,
      },
    });
    const result = (await decideCancelRequest(
      service,
      'cancel-request-1',
      'approve',
      'aprovado sem AIT no servidor',
      'actor-1',
    )) as { status?: string; version?: number };
    expect(result.status).toBe('approved');
    expect(result.version).toBe(2);
  });
});
