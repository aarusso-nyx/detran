import { describe, expect, it, vi } from 'vitest';

import { AitLifecycleService } from '../ait-lifecycle.service.js';

/**
 * CTG-0001 §3.1 (R-0008, TASK-0002) — C-0001-11: matriz completa de guarda de
 * estado do AIT, [WF-TEAT-001], 16 comandos × 17 estados, nenhuma célula
 * omitida.
 *
 * Alvo de teste: `AitLifecycleService` (a mesma classe já exercitada por
 * `ait-lifecycle.service.spec.ts` e chamada diretamente pelos métodos do
 * `AitCommandsController` hoje). O layout do §9 do contrato sugere um
 * arquivo por comando em `src/handwritten/*.command.ts` para TASK-0003; como
 * esses arquivos ainda não existem e o formato interno de cada um não é
 * fixado por nenhuma fonte canônica (só o formato HTTP/DTO o é), testar
 * contra o serviço existente evita inventar uma API que TASK-0003 teria de
 * descartar. Os métodos novos (`reviewConcurrency`, `archive`,
 * `createCancelRequest`) ainda não existem na classe — chamá-los falha com
 * "is not a function", que é a mesma "comportamento ausente" que motiva
 * todas as demais células vermelhas desta matriz (o serviço ainda lança
 * `BadRequestException` sem `.code`/`.context`, não `DetranError`).
 */

const ALL_STATES = [
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
] as const;

function stubService(currentStatus: string) {
  const ait: Record<string, unknown> = {
    id: 'ait-matrix',
    current_status: currentStatus,
    ait_number: '000001',
    series: 'F',
    version: 1,
  };
  const update = vi.fn(async (_id: string, patch: Record<string, unknown>) => {
    Object.assign(ait, patch);
    return { ...ait };
  });
  const findOne = vi.fn(async () => ({ ...ait }));
  const repositories = {
    ait: {
      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
      findOne,
      update,
      create: vi.fn(async (dto: Record<string, unknown>) => ({
        id: 'cancel-request-1',
        ...dto,
      })),
    } as never,
    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
    vehicles: { create: vi.fn(async (dto: unknown) => dto) } as never,
    people: { create: vi.fn(async (dto: unknown) => dto) } as never,
    corrections: {
      create: vi.fn(async (dto: unknown) => dto),
      findOne: vi.fn(async () => ({
        id: 'correction-1',
        ait_id: 'ait-matrix',
        justification: 'saneamento aprovado',
      })),
      update: vi.fn(async (_id: string, patch: unknown) => patch),
    } as never,
    signatures: { create: vi.fn(async (dto: unknown) => dto) } as never,
    printEvents: { create: vi.fn(async (dto: unknown) => dto) } as never,
  };
  // §13 item 1: concurrency-review agora exige um conflito aberto via
  // SyncConflictPort (collaborators.syncConflicts, proposta do Inspector —
  // ver review-concurrency.spec.ts); esta matriz testa a guarda de ESTADO
  // do AIT, não a guarda de conflito, então o stub sempre devolve um
  // conflito aberto para não confundir as duas.
  const syncConflicts = {
    findOpenConcurrencyConflict: vi.fn(async () => ({
      id: 'conflict-matrix',
      syncQueueItemId: 'queue-matrix',
    })),
    resolve: vi.fn(async () => undefined),
  };
  const outbox = { append: vi.fn(async () => ({ id: 'outbox-matrix' })) };
  const service = new (
    AitLifecycleService as unknown as new (
      repositories: unknown,
      normative: unknown,
      collaborators?: unknown,
    ) => AitLifecycleService
  )(repositories, { assertActive: vi.fn() }, { outbox, syncConflicts });
  return service as AitLifecycleService & {
    reviewConcurrency?: (...args: unknown[]) => Promise<unknown>;
    archive?: (...args: unknown[]) => Promise<unknown>;
    createCancelRequest?: (...args: unknown[]) => Promise<unknown>;
  };
}

interface CommandCase {
  name: string;
  admitted: readonly string[];
  /** States that raise a more specific code than AIT_STATE_INVALID. */
  exceptions?: Readonly<Record<string, string>>;
  expectedTarget?: string;
  invoke: (
    service: ReturnType<typeof stubService>,
    aitId: string,
    currentStatus: string,
  ) => Promise<unknown>;
}

const COMMANDS: readonly CommandCase[] = [
  {
    name: 'vehicles',
    admitted: ['RASCUNHO_OFFLINE'],
    invoke: (service, id) =>
      service.addVehicle(id, {
        vehicle_snapshot_id: 'veh-1',
        role: 'infractor',
      }),
  },
  {
    name: 'people',
    admitted: ['RASCUNHO_OFFLINE'],
    invoke: (service, id) =>
      service.addPerson(id, {
        person_id: 'person-1',
        role: 'driver',
        identified_by: 'document',
      }),
  },
  {
    name: 'science',
    admitted: ['RASCUNHO_OFFLINE', 'FINALIZADO_LOCAL'],
    invoke: (service, id) =>
      service.recordScience(id, { signature_type: 'signed' }),
  },
  {
    name: 'finalize',
    admitted: ['RASCUNHO_OFFLINE'],
    expectedTarget: 'FINALIZADO_LOCAL',
    invoke: (service, id) => service.finalize(id, 'actor-1'),
  },
  {
    name: 'print-events',
    admitted: ['FINALIZADO_LOCAL', 'ENFILEIRADO'],
    invoke: (service, id) =>
      service.recordPrint(id, { event_type: 'impressao' }),
  },
  {
    name: 'queue-transmission',
    admitted: ['FINALIZADO_LOCAL'],
    expectedTarget: 'ENFILEIRADO',
    invoke: (service, id) => service.queueTransmission(id, 'actor-1'),
  },
  {
    name: 'receive-protocol',
    admitted: ['ENFILEIRADO', 'TRANSMITIDO'],
    expectedTarget: 'RECEBIDO',
    invoke: (service, id) =>
      service.receiveProtocol(id, `protocol-${id}`, 'actor-1'),
  },
  {
    name: 'concurrency-review',
    admitted: ['SUSPEITO_CONCORRENCIA'],
    expectedTarget: 'RECEBIDO',
    invoke: (service, id) =>
      service.reviewConcurrency
        ? service.reviewConcurrency(
            id,
            'release',
            'apuração concluída',
            'actor-1',
          )
        : Promise.reject(
            new Error(
              'AitLifecycleService.reviewConcurrency ainda não existe (TASK-0003, M4)',
            ),
          ),
  },
  {
    name: 'request-correction',
    admitted: ['VALIDANDO', 'REJEITADO'],
    expectedTarget: 'PENDENTE_CORRECAO',
    invoke: (service, id) =>
      service.requestCorrection(id, 'correção necessária', 'actor-1'),
  },
  {
    name: 'corrections',
    admitted: ['PENDENTE_CORRECAO'],
    invoke: (service, id) =>
      service.addCorrection(id, {
        operator_user_ref: 'actor-1',
        correction_type: 'endereco',
        justification: 'saneamento de campo não essencial',
      }),
  },
  {
    name: 'corrections/approve',
    admitted: ['PENDENTE_CORRECAO'],
    expectedTarget: 'CORRIGIDO',
    invoke: (service, id) =>
      service.approveCorrection(id, 'correction-1', 'actor-1'),
  },
  {
    name: 'accept',
    admitted: ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'],
    exceptions: {
      SUSPEITO_CONCORRENCIA: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
    },
    expectedTarget: 'INTEGRADO',
    invoke: (service, id) => service.accept(id, 'actor-1'),
  },
  {
    name: 'reject',
    admitted: ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
    exceptions: {
      SUSPEITO_CONCORRENCIA: 'TEAT.AIT_CONCURRENCY_PENDING_REVIEW',
    },
    expectedTarget: 'REJEITADO',
    invoke: (service, id) =>
      service.reject(id, 'motivo da rejeição', 'actor-1'),
  },
  {
    name: 'archive',
    admitted: ['PROCESSADO'],
    expectedTarget: 'ARQUIVADO',
    invoke: (service, id) =>
      service.archive
        ? service.archive(id, 'processamento concluído', 'actor-1')
        : Promise.reject(
            new Error(
              'AitLifecycleService.archive ainda não existe (TASK-0003, M4)',
            ),
          ),
  },
  {
    name: 'cancel-requests (draft)',
    admitted: ['RASCUNHO_OFFLINE'],
    invoke: (service, id, currentStatus) =>
      service.createCancelRequest
        ? service.createCancelRequest({
            entityType: 'ait-cancel-request',
            trafficAgencyId: 'agency-1',
            idempotencyKey: `draft-${id}-${currentStatus}`,
            targetLocalActId: `local-${id}`,
            targetAitId: id,
            originStatus: currentStatus,
            justification: 'desistência do agente antes da finalização',
            requestedBy: 'actor-1',
          })
        : Promise.reject(
            new Error(
              'AitLifecycleService.createCancelRequest ainda não existe (TASK-0003, M4)',
            ),
          ),
  },
  {
    name: 'cancel-requests (post_final)',
    admitted: [
      'FINALIZADO_LOCAL',
      'RECEBIDO',
      'VALIDANDO',
      'ACEITO',
      'INTEGRADO',
    ],
    expectedTarget: 'SOLICITADO_CANCEL_POSFINAL',
    invoke: (service, id, currentStatus) =>
      service.createCancelRequest
        ? service.createCancelRequest({
            entityType: 'ait-cancel-posfinal-request',
            trafficAgencyId: 'agency-1',
            idempotencyKey: `post-final-${id}-${currentStatus}`,
            targetLocalActId: `local-${id}`,
            targetAitId: id,
            originStatus: currentStatus,
            justification: 'erro material identificado após a finalização',
            requestedBy: 'actor-1',
          })
        : Promise.reject(
            new Error(
              'AitLifecycleService.createCancelRequest ainda não existe (TASK-0003, M4)',
            ),
          ),
  },
];

describe('AIT — matriz de guarda de estado WF-TEAT-001 (C-0001-11, 16 comandos × 17 estados)', () => {
  for (const command of COMMANDS) {
    describe(`comando: ${command.name}`, () => {
      for (const state of ALL_STATES) {
        const admitted = command.admitted.includes(state);
        const exceptionCode = command.exceptions?.[state];

        if (admitted) {
          it(`dado AIT em ${state} quando ${command.name} então sucede${
            command.expectedTarget ? ` (→ ${command.expectedTarget})` : ''
          }`, async () => {
            const service = stubService(state);
            const result = (await command.invoke(
              service,
              'ait-matrix',
              state,
            )) as { current_status?: string } | undefined;
            if (command.expectedTarget) {
              expect(result?.current_status).toBe(command.expectedTarget);
            }
          });
          continue;
        }

        if (exceptionCode) {
          it(`dado AIT em ${state} quando ${command.name} então ${exceptionCode} (precede AIT_STATE_INVALID, RN-TEAT-111)`, async () => {
            const service = stubService(state);
            await expect(
              command.invoke(service, 'ait-matrix', state),
            ).rejects.toMatchObject({ code: exceptionCode });
          });
          continue;
        }

        it(`dado AIT em ${state} (não admitido) quando ${command.name} então 409 TEAT.AIT_STATE_INVALID com context.allowed=[${command.admitted.join(', ')}]`, async () => {
          const service = stubService(state);
          await expect(
            command.invoke(service, 'ait-matrix', state),
          ).rejects.toMatchObject({
            code: 'TEAT.AIT_STATE_INVALID',
            status: 409,
            context: expect.objectContaining({
              allowed: [...command.admitted],
            }),
          });
        });
      }
    });
  }

  it('cataloga exatamente 16 comandos e 17 estados (nenhuma célula omitida)', () => {
    expect(COMMANDS).toHaveLength(16);
    expect(ALL_STATES).toHaveLength(17);
  });
});
