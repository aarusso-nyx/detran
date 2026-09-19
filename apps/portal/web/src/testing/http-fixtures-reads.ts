// R-0014 TASK-0015 (Inspector). Fixtures HTTP centralizadas para os specs do par 2 (CTG-0003b
// §9(b)): corpos canônicos das sete leituras novas. Fontes: `@example` dos operations gerados
// (`packages/api-clients/src/generated/BP-PORTAL-{PROJECTIONS,REQUESTS}-001.commands.ts`),
// `backend/database/seed/70-fixtures-portal.sql` (ids, linhas 10.5/10.8/10.8) e os valores
// literais do contrato §8 (C-3b-32: faixas de pagamento — não há fixture de `payment_json` com
// faixas na seed, o AIT `…0f0000002` tem `payment_json: {}`; os valores abaixo são os do próprio
// critério, nunca inventados). Reexporta os ids de `http-fixtures.ts` (par 1) para não duplicar.
import {
  AIT_ID,
  FIXED_CLOCK_ISO,
  REQUEST_COMPOSICAO_ID,
  TENANT_ID,
} from './http-fixtures';

export { AIT_ID, FIXED_CLOCK_ISO, REQUEST_COMPOSICAO_ID, TENANT_ID };

/** `EM_ANDAMENTO_NO_ORGAO`, seed 10.5 linha 9 — pedido de origem do @example de `getRequest`. */
export const REQUEST_EM_ANDAMENTO_ID = '00000000-0000-7000-8000-000070400009';
/** `RESULTADO_DISPONIVEL`, seed 10.5 linha 10. */
export const REQUEST_RESULTADO_ID = '00000000-0000-7000-8000-00007040000a';
/** `CONCLUIDO`, seed 10.5 linha 12; `delegation.externalId` presente. */
export const REQUEST_CONCLUIDO_ID = '00000000-0000-7000-8000-00007040000c';
/** `DESISTIDO`, seed 10.5 linha 13 (par 1: `REQUEST_DESISTIDO_ID`). */
export { REQUEST_DESISTIDO_ID } from './http-fixtures';
/** protocolo do pedido `…070400009` (seed 10.5 + @example de `getRequest`). */
export const PROTOCOL_NUMBER_FIXTURE = 'AM-FIXTURES-2026-0000002';
/** `representation`/`delegation.externalId` de seed 10.3 (usado por T-03/T-04, [DIVERGE-4]). */
export const CASE_EXTERNAL_ID_FIXTURE = '00000000-0000-7000-8000-000070e00001';
/** diligência de teste (`did-1`); campo/forma `source_pending` (OD-P72) — id literal do contrato §8. */
export const DILIGENCE_ID_FIXTURE = 'did-1';

/** `GET aits` — `@example` de `portalAitList` (`BP-PORTAL-PROJECTIONS-001.commands.ts`). */
export const AIT_LIST_PAGE_FIXTURE = {
  items: [
    {
      aitId: AIT_ID,
      aitNumber: 'FIX-0000001',
      plate: 'FIX2E01',
      occurredAt: '2026-05-01T12:00:00-04:00',
      framingLabel: 'fixture',
      amount: 195.23,
      situation: 'aguardando_defesa' as const,
      deadlines: [],
      pointsStatus: 'none' as const,
      actions: [],
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

/** `GET aits/{aitId}` — `@example` de `portalAitGet` (payment.tiers `[]`, C-3b-02). */
export const AIT_DETAIL_FIXTURE = {
  aitId: AIT_ID,
  aitNumber: 'FIX-0000001',
  plate: 'FIX2E01',
  occurredAt: '2026-05-01T12:00:00-04:00',
  framingLabel: 'fixture',
  amount: 195.23,
  situation: 'aguardando_defesa' as const,
  deadlines: [] as unknown[],
  pointsStatus: 'none' as const,
  actions: [] as unknown[],
  notices: [] as unknown[],
  payment: { tiers: [] as unknown[], paid: false, paidTier: null },
  openRequestId: null as string | null,
  evidenceAvailable: false,
};

/** `deadlines[]` de um AIT (`AitDeadline`, contrato §2.1) — reutilizada por T-01/T-14. */
export const AIT_DEADLINE_FIXTURE = {
  kind: 'T-DEF',
  dueOn: '2026-10-14',
  ownedBy: 'citizen' as const,
};

/** Forma comum de uma faixa da fixture (única interface — evita união de literais exatos, que
 *  travaria `.map()` com substituição parcial de campo nos specs, ex.: C-3b-36 amount null). */
export interface PaymentTierFixtureShape {
  readonly code:
    | 'desconto_80'
    | 'desconto_60_reconhecimento'
    | 'desconto_40_fora_sne'
    | 'integral_juros';
  readonly percent: number;
  readonly amount: number | null;
  readonly availableUntil: string | null;
  readonly requiresSne: boolean;
  readonly waivesAppeal: boolean;
}

/**
 * Faixas de pagamento do critério C-3b-32 (contrato §8; valores literais do próprio critério —
 * não há `payment_json` com faixas na seed 70-fixtures-portal.sql, o AIT `…0f0000002` tem
 * `payment_json: {}`). Ordem = `PAYMENT_TIER_ORDER` (§4.1): 80 · 60(SNE) · 40(renúncia) · integral.
 */
export const PAYMENT_TIERS_FIXTURE: readonly PaymentTierFixtureShape[] = [
  {
    code: 'desconto_80',
    percent: 80,
    amount: 156.18,
    availableUntil: '2026-09-30',
    requiresSne: false,
    waivesAppeal: false,
  },
  {
    code: 'desconto_60_reconhecimento',
    percent: 60,
    amount: 117.14,
    availableUntil: '2026-09-30',
    requiresSne: true,
    waivesAppeal: true,
  },
  {
    code: 'desconto_40_fora_sne',
    percent: 60,
    amount: 117.14,
    availableUntil: '2026-09-30',
    requiresSne: false,
    waivesAppeal: true,
  },
  {
    code: 'integral_juros',
    percent: 100,
    amount: 197.18,
    availableUntil: null,
    requiresSne: false,
    waivesAppeal: false,
  },
];

export const PAYMENT_INFO_FIXTURE = {
  tiers: PAYMENT_TIERS_FIXTURE,
  paid: false,
  paidTier: null as string | null,
};

/** `GET aits/{aitId}` com as faixas de pagamento acima — T-13/T-23 (C-3b-82…87). */
export const AIT_DETAIL_WITH_PAYMENT_FIXTURE = {
  ...AIT_DETAIL_FIXTURE,
  payment: PAYMENT_INFO_FIXTURE,
};

/** `GET aits/{aitId}/points` — `@example` de `portalAitPointsGet`. */
export const AIT_POINTS_FIXTURE = {
  aitId: AIT_ID,
  pointsStatus: 'none' as const,
  points: null,
};

/** `GET points-summary` — `@example`; valores = seed 10.8 `portal.points_view`. */
export const POINTS_SUMMARY_FIXTURE = {
  definitivePoints: 3,
  disputedPoints: 4,
  byVehicle: [] as unknown[],
  last12Months: [] as unknown[],
  cachedAt: FIXED_CLOCK_ISO,
};

/** `GET requests` — `@example` de `portalRequestList`. */
export const REQUEST_LIST_PAGE_FIXTURE = {
  items: [
    {
      requestId: REQUEST_EM_ANDAMENTO_ID,
      protocol: PROTOCOL_NUMBER_FIXTURE,
      serviceKey: 'adesao_sne',
      targetLabel: null,
      situation: 'EM_ANDAMENTO_NO_ORGAO' as const,
      nextAction: {
        by: 'agency' as const,
        label: 'portal.requests.nextAction.EM_ANDAMENTO_NO_ORGAO',
        dueOn: null,
      },
      updatedAt: FIXED_CLOCK_ISO,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

/**
 * `GET requests/{id}` — `@example` de `portalRequestGet` (ETag "1"): pedido `…070400009`,
 * `canWithdraw: false`, `withdrawalBlockedReason: 'estado_nao_admite'` (o estado
 * `EM_ANDAMENTO_NO_ORGAO` não admite desistência direta pela leitura — C-3b-05/C-3b-90).
 */
export const REQUEST_DETAIL_FIXTURE = {
  request: {
    requestId: REQUEST_EM_ANDAMENTO_ID,
    state: 'EM_ANDAMENTO_NO_ORGAO' as const,
    serviceKey: 'adesao_sne',
    targetKind: 'none' as const,
    targetId: null as string | null,
    channel: 'portal' as const,
    minimumAssurance: 'avancada' as const,
    delegation: {
      status: 'delegated' as const,
      domain: 'portal',
      command: 'portal:sne-enrollment:enroll',
      externalId: null as string | null,
      error: null as string | null,
    },
    protocol: {
      number: PROTOCOL_NUMBER_FIXTURE,
      issuedAt: '2026-09-02T12:00:00-04:00',
      channel: 'portal' as const,
      receiptHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
    },
    draft: null as Record<string, unknown> | null,
    withdrawnAt: null as string | null,
    createdAt: '2026-09-02T12:00:00-04:00',
    updatedAt: '2026-09-02T12:00:00-04:00',
    version: 1,
  },
  timeline: [] as unknown[],
  deadlines: [] as unknown[],
  documents: [] as unknown[],
  diligences: [] as unknown[],
  decision: null as unknown,
  actions: {
    canRespondDiligence: false,
    canWithdraw: false,
    withdrawalBlockedReason: 'estado_nao_admite' as string | null,
    canAppeal: false,
    nextInstanceServiceKey: null as string | null,
  },
};

/**
 * Variante do pedido acima com diligência `open` (`did-1`), todas as ações habilitadas e uma
 * decisão — usada por T-07/T-10/T-11 (C-3b-91, C-3b-96, C-3b-99…102). `documents[]`/`diligences[]`
 * `source_pending` (OD-P72): forma construída aqui a partir das interfaces propostas em
 * `data/portal-read.models.ts` (contrato §2.1), nunca de fonte que não exista.
 */
export const REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE = {
  request: {
    ...REQUEST_DETAIL_FIXTURE.request,
    requestId: REQUEST_RESULTADO_ID,
    targetKind: 'exam' as const,
    targetId: '00000000-0000-7000-8000-00007ff00002',
  },
  timeline: [] as unknown[],
  deadlines: [
    {
      kind: 'diligencia' as const,
      dueOn: '2026-10-14',
      ownedBy: 'citizen' as const,
    },
  ],
  documents: [
    {
      documentId: 'doc-1',
      title: 'Parecer',
      kind: null as string | null,
      issuedAt: '2026-09-05',
      downloadUrl: 'https://storage.invalid/p.pdf' as string | null,
    },
  ],
  diligences: [
    {
      diligenceId: DILIGENCE_ID_FIXTURE,
      requestText: 'Envie o laudo',
      dueOn: '2026-10-14' as string | null,
      status: 'open' as const,
      outcome: null as string | null,
    },
  ],
  decision: null as unknown,
  actions: {
    canRespondDiligence: true,
    canWithdraw: true,
    withdrawalBlockedReason: null as string | null,
    canAppeal: true,
    nextInstanceServiceKey: 'recurso_cetran' as string | null,
  },
};

/** `GET requests/{id}/decision` — `@example` de `portalRequestDecisionGet` (`deferido`). */
export const DECISION_DEFERIDO_FIXTURE = {
  outcome: 'deferido' as const,
  summary: null as string | null,
  publishedOn: '2026-09-10',
  documentUrl: null as string | null,
  nextStep: { kind: 'none' as const, serviceKey: null, dueOn: null },
  refundDue: false,
  finalInstance: true,
};
