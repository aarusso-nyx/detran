// Eventos publicados por `@detran/portal-inbox` (work/rounds/R-0009/contracts/
// CTG-0002.md §11; plan R-0009 M15, M21): `INBOX_LIDO` (type
// `portal.inbox.read`), `NOTIFICACAO_CIENCIA` (type
// `portal.notification.acknowledged` — o prefixo `portal.` distingue a
// publicação do Portal da ciência do módulo dono, ADR-0016) e
// `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` (type
// `portal.sne-enrollment.changed`, união discriminada em `domainEvent`).
// Padrão de `inf/infraction/src/handwritten/events.ts`: envelope de
// rait-events-sse-contract.md §1, `strictObject` em toda parte — `data` só com
// ids, tokens, datas e o `cpf_hash` do sujeito (escopo do SSE, §9); nunca
// e-mail nem telefone.
//
// Os `type` técnicos `portal.<x>.<y>` são montados por concatenação, nunca
// como literal (`tools/parameters/verify.mjs --check-usage`; precedente de
// `portal/requests/src/handwritten/events.ts`).
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { TeatEventEnvelope } from '@detran/shared';

const PORTAL_TOPIC_PREFIX = 'portal';

export const PORTAL_INBOX_READ_TYPE = `${PORTAL_TOPIC_PREFIX}.inbox.read`;
export const PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE = `${PORTAL_TOPIC_PREFIX}.notification.acknowledged`;
export const PORTAL_SNE_ENROLLMENT_CHANGED_TYPE = `${PORTAL_TOPIC_PREFIX}.sne-enrollment.changed`;

export const PORTAL_INBOX_ITEM_AGGREGATE_KIND = 'portal.inbox_item';
export const PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND = 'portal.sne_enrollment';

const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const actor = z.strictObject({
  kind: z.enum(['user', 'system', 'timer']),
  id: z.string(),
  role: z.string().optional(),
});

function envelope<D extends ZodType>(
  type: string,
  domainEvent: string,
  aggregateKind: string,
  data: D,
) {
  return z.strictObject({
    id: z.string(),
    type: z.literal(type),
    domainEvent: z.literal(domainEvent),
    version: z.int().min(1),
    occurredAt: z.iso.datetime(),
    tenantId: z.uuid(),
    actor,
    correlationId: z.string(),
    causationId: z.string().optional(),
    aggregate: z.strictObject({
      kind: z.literal(aggregateKind),
      id: z.uuid(),
      version: z.int().min(1),
    }),
    data,
  });
}

const inboxLido = envelope(
  PORTAL_INBOX_READ_TYPE,
  'INBOX_LIDO',
  PORTAL_INBOX_ITEM_AGGREGATE_KIND,
  z.strictObject({
    inboxItemId: z.uuid(),
    subjectId: z.uuid(),
    subjectCpfHash: sha256,
    source: z.enum(['sne', 'portal']),
    sourceEventId: z.uuid(),
    aitId: z.uuid().nullable(),
    requestId: z.uuid().nullable(),
    readOn: localDate,
  }),
);

const notificacaoCiencia = envelope(
  PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE,
  'NOTIFICACAO_CIENCIA',
  PORTAL_INBOX_ITEM_AGGREGATE_KIND,
  z.strictObject({
    inboxItemId: z.uuid(),
    sourceEventId: z.uuid(),
    aitId: z.uuid().nullable(),
    subjectCpfHash: sha256,
    acknowledgedAt: z.iso.datetime(),
    readOn: localDate,
    evidenceSha256: sha256,
    fictitious: z.literal(false),
  }),
);

const sneAdesaoSolicitada = envelope(
  PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
  'SNE_ADESAO_SOLICITADA',
  PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
  z.strictObject({
    enrollmentId: z.uuid(),
    subjectId: z.uuid(),
    subjectCpfHash: sha256,
    toState: z.literal('ADERIDO_SNE'),
    since: z.iso.datetime(),
    channel: z.enum(['push', 'email', 'sne']).nullable(),
    consentTextVersion: z.string(),
  }),
);

const sneCancelamentoSolicitado = envelope(
  PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
  'SNE_CANCELAMENTO_SOLICITADO',
  PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
  z.strictObject({
    enrollmentId: z.uuid(),
    subjectId: z.uuid(),
    subjectCpfHash: sha256,
    fromState: z.literal('ADERIDO_SNE'),
    toState: z.literal('NAO_ADERIDO_SNE'),
    cancelledAt: z.iso.datetime(),
  }),
);

/** `type` → schema (o de `portal.sne-enrollment.changed` é a união por `domainEvent`). */
export const PORTAL_INBOX_EVENT_SCHEMAS: Readonly<Record<string, ZodType>> = {
  [PORTAL_INBOX_READ_TYPE]: inboxLido,
  [PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE]: notificacaoCiencia,
  [PORTAL_SNE_ENROLLMENT_CHANGED_TYPE]: z.discriminatedUnion('domainEvent', [
    sneAdesaoSolicitada,
    sneCancelamentoSolicitado,
  ]),
};

export type InboxLidoData = z.infer<typeof inboxLido>['data'];
export type NotificacaoCienciaData = z.infer<typeof notificacaoCiencia>['data'];
export type SneAdesaoSolicitadaData = z.infer<
  typeof sneAdesaoSolicitada
>['data'];
export type SneCancelamentoSolicitadoData = z.infer<
  typeof sneCancelamentoSolicitado
>['data'];

export interface PortalInboxEventContext {
  occurredAt: string;
  actorId: string;
  correlationId: string;
}

function portalEnvelope(
  type: string,
  domainEvent: string,
  aggregate: TeatEventEnvelope['aggregate'],
  data: Record<string, unknown>,
  context: PortalInboxEventContext,
): TeatEventEnvelope {
  return {
    id: '',
    type,
    domainEvent,
    version: 1,
    occurredAt: context.occurredAt,
    tenantId: '',
    actor: { kind: 'user', id: context.actorId },
    correlationId: context.correlationId,
    aggregate,
    data,
  };
}

/**
 * Fábricas por `domainEvent`. `inbox_item` não tem `version` → `aggregate.version`
 * fixa em 1 (uma publicação por evento e agregado, §6.1); `sne_enrollment`
 * recebe o número da transição calculado pelo serviço (§11, D8).
 */
export const portalInboxEvents = {
  inboxLido(
    inboxItemId: string,
    data: InboxLidoData,
    context: PortalInboxEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_INBOX_READ_TYPE,
      'INBOX_LIDO',
      { kind: PORTAL_INBOX_ITEM_AGGREGATE_KIND, id: inboxItemId, version: 1 },
      data,
      context,
    );
  },
  notificacaoCiencia(
    inboxItemId: string,
    data: NotificacaoCienciaData,
    context: PortalInboxEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_NOTIFICATION_ACKNOWLEDGED_TYPE,
      'NOTIFICACAO_CIENCIA',
      { kind: PORTAL_INBOX_ITEM_AGGREGATE_KIND, id: inboxItemId, version: 1 },
      data,
      context,
    );
  },
  sneAdesaoSolicitada(
    enrollmentId: string,
    transition: number,
    data: SneAdesaoSolicitadaData,
    context: PortalInboxEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
      'SNE_ADESAO_SOLICITADA',
      {
        kind: PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
        id: enrollmentId,
        version: transition,
      },
      data,
      context,
    );
  },
  sneCancelamentoSolicitado(
    enrollmentId: string,
    transition: number,
    data: SneCancelamentoSolicitadoData,
    context: PortalInboxEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_SNE_ENROLLMENT_CHANGED_TYPE,
      'SNE_CANCELAMENTO_SOLICITADO',
      {
        kind: PORTAL_SNE_ENROLLMENT_AGGREGATE_KIND,
        id: enrollmentId,
        version: transition,
      },
      data,
      context,
    );
  },
};
