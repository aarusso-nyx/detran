// Identidade federada do cidadão (work/rounds/R-0009/contracts/CTG-0001.md §2,
// §4, §8 e §12; plan R-0009 M3, M4, M6, M24; ADR-0024). Funções puras das
// claims (§2.1) e do nível por ato (§4) mais o serviço injetável declarado
// pelo bloco `module` de BP-PORTAL-IDENTITY-001: upsert do sujeito, matriz
// ato → nível, vínculo e representações. Nunca lê `Date.now()`: o relógio é
// `PortalClock` (adenda A1(g)).
import { createHash } from 'node:crypto';
import { Injectable, Optional } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';
import { addCalendarDays } from '@detran/inf-deadlines';
import {
  SqlTeatEventOutbox,
  type getPrincipalFromRequest,
} from '@detran/shared';

import { PortalClock, type PortalClockLike } from './clock.js';
import { PortalError } from './errors.js';
import {
  portalIdentityEvents,
  type PortalIdentityEventContext,
} from './events.js';

type Principal = NonNullable<ReturnType<typeof getPrincipalFromRequest>>;

/**
 * Subconjunto da transação STYNX que os pacotes do Portal usam: `query`
 * parametrizado devolvendo `rows`. Estrutural para que a `Transaction` real e
 * a tx falsa em memória dos specs (`requests/tests/support/fake-sql.ts`,
 * CTG-0002 §13) sirvam igualmente.
 */
export interface PortalSqlTransaction {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

/** A `Transaction` real satisfaz o subconjunto (verificação em tempo de tipo). */
const _transactionIsPortalSqlTransaction: (
  tx: Transaction,
) => PortalSqlTransaction = (tx) => tx;
void _transactionIsPortalSqlTransaction;

// ---------------------------------------------------------------------------
// §2.1 — claims e principal (M3)
// ---------------------------------------------------------------------------

export const PORTAL_ASSURANCE_LEVELS = [
  'simples',
  'avancada',
  'qualificada',
] as const;
export type PortalAssuranceLevel = (typeof PORTAL_ASSURANCE_LEVELS)[number];

export const PORTAL_GOVBR_LEVELS = [
  'bronze',
  'prata',
  'ouro',
  'qualificada',
] as const;
export type PortalGovbrLevel = (typeof PORTAL_GOVBR_LEVELS)[number];

/** Decreto 10.543/2020 art. 5º I–III (CTG-0001 §4). */
export const PORTAL_ELEVATION_METHODS = [
  'biographic',
  'biometric',
  'icp',
] as const;

export interface PortalClaimNames {
  /** `STYNX_COGNITO_ASSURANCE_CLAIM` ?? `custom:assurance_level` (ADR-0024 §6). */
  assuranceClaim: string;
  /** `STYNX_COGNITO_CPF_CLAIM` ?? `custom:cpf` (ADR-0024 §6). */
  cpfClaim: string;
}

export function portalClaimNames(
  env: Record<string, string | undefined> = process.env,
): PortalClaimNames {
  return {
    assuranceClaim:
      env.STYNX_COGNITO_ASSURANCE_CLAIM ?? 'custom:assurance_level',
    cpfClaim: env.STYNX_COGNITO_CPF_CLAIM ?? 'custom:cpf',
  };
}

export interface PortalIdentityClaims {
  /** Exatamente 11 dígitos (normalizado com `/\D/g`). */
  cpf: string;
  assuranceLevel: PortalAssuranceLevel;
  /** Selo gov.br observado — observacional, nunca autorização (OD-P25). */
  govbrLevel?: PortalGovbrLevel;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Primeira chave presente vence (presença = valor !== undefined). */
function firstPresent(
  claims: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const key of keys) {
    if (claims[key] !== undefined) return claims[key];
  }
  return undefined;
}

/**
 * Leitura fail-closed das claims (§2.1): qualquer falha devolve `null`, nunca
 * lança e nunca degrada para `simples`. Comparação exata dos tokens (sem
 * trim, sem lower-case); o dígito verificador do CPF não é validado nesta
 * rodada (OD-P25).
 */
export function portalIdentityClaims(
  principal: Pick<Principal, 'claims'> | undefined,
  names: PortalClaimNames = portalClaimNames(),
): PortalIdentityClaims | null {
  if (!principal || !isRecord(principal.claims)) return null;
  const claims = principal.claims;

  const assurance = firstPresent(claims, [
    'assurance_level',
    names.assuranceClaim,
  ]);
  if (
    typeof assurance !== 'string' ||
    !(PORTAL_ASSURANCE_LEVELS as readonly string[]).includes(assurance)
  ) {
    return null;
  }

  const rawCpf = firstPresent(claims, ['cpf', names.cpfClaim]);
  if (typeof rawCpf !== 'string') return null;
  const cpf = rawCpf.replace(/\D/g, '');
  if (cpf.length !== 11) return null;

  const govbr = claims['govbr_level'];
  const govbrLevel =
    typeof govbr === 'string' &&
    (PORTAL_GOVBR_LEVELS as readonly string[]).includes(govbr)
      ? (govbr as PortalGovbrLevel)
      : undefined;

  return {
    cpf,
    assuranceLevel: assurance as PortalAssuranceLevel,
    ...(govbrLevel ? { govbrLevel } : {}),
  };
}

// ---------------------------------------------------------------------------
// §4 — nível por ato (M4/M5)
// ---------------------------------------------------------------------------

export type PortalRequiredAssurance = 'none' | PortalAssuranceLevel;

/** Ordem `none < simples < avancada < qualificada` (route contract §11). */
export function assuranceRank(level: PortalRequiredAssurance): 0 | 1 | 2 | 3 {
  switch (level) {
    case 'none':
      return 0;
    case 'simples':
      return 1;
    case 'avancada':
      return 2;
    case 'qualificada':
      return 3;
  }
}

export interface ActLevelDecision {
  actKey: string;
  required: PortalRequiredAssurance;
  current: PortalAssuranceLevel;
  policyId: string;
}

interface ActLevelPolicyRow extends Record<string, unknown> {
  id: string;
  minimum_assurance: string;
}

/** Vigência de `portal.act_level_policy` (§4): `$1` = act_key, `$2` = hoje. */
const ACT_LEVEL_POLICY_SQL = `select id, minimum_assurance
     from portal.act_level_policy
    where act_key = $1
      and enabled = true
      and effective_from <= $2::date
      and $2::date < coalesce(effective_to, 'infinity'::date)
    order by effective_from desc
    limit 1`;

/**
 * Compara o nível da sessão com o mínimo do ato dentro da transação do
 * comando (§4). Ato sem linha vigente NUNCA libera (M4); linha `qualificada`
 * é defeito de configuração (RN-PORTAL-101 (c)); `none` não compara (H.51).
 * Nunca consulta `govbrLevel` (UC-PORTAL-019 AC-2).
 */
export async function assertActLevel(
  tx: PortalSqlTransaction,
  identity: PortalIdentityClaims,
  actKey: string,
  resumeRoute: string,
  clock: PortalClockLike = new PortalClock(),
): Promise<ActLevelDecision> {
  const result = await tx.query<ActLevelPolicyRow>(ACT_LEVEL_POLICY_SQL, [
    actKey,
    clock.today(),
  ]);
  const row = result.rows[0];
  if (!row) {
    throw new PortalError('PORTAL.INTERNAL', {
      status: 500,
      context: { actKey },
    });
  }
  const required = row.minimum_assurance as PortalRequiredAssurance;
  if (required === 'qualificada') {
    throw new PortalError('PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED', {
      status: 500,
      context: { actKey },
    });
  }
  const current = identity.assuranceLevel;
  if (required !== 'none' && assuranceRank(current) < assuranceRank(required)) {
    throw new PortalError('PORTAL.ASSURANCE_INSUFFICIENT', {
      status: 403,
      context: {
        actKey,
        required,
        current,
        elevationMethods: [...PORTAL_ELEVATION_METHODS],
        resumeRoute,
      },
    });
  }
  return { actKey, required, current, policyId: row.id };
}

// ---------------------------------------------------------------------------
// §8 GET me — sujeito, requisitos por ato, representações (M6)
// ---------------------------------------------------------------------------

export interface PortalSubjectRecord {
  subjectId: string;
  name: string | null;
  observedAt: Date;
  version: number;
}

export interface PortalActRequirement {
  actKey: string;
  minimumAssurance: PortalRequiredAssurance;
  allowed: boolean;
  reason?:
    | 'PORTAL.ASSURANCE_INSUFFICIENT'
    | 'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED';
}

export interface PortalRepresentationSummary {
  id: string;
  representedName: string;
  scope: 'ait' | 'all';
  validUntil: string | null;
}

export interface PortalMeResponse {
  subjectId: string;
  cpf: string;
  name: string | null;
  assuranceLevel: PortalAssuranceLevel;
  govbrLevelObservedAt: string;
  actRequirements: PortalActRequirement[];
  representations: PortalRepresentationSummary[];
  /** `@stynx-nyx/preferences` não é montado nesta rodada (CTG-0002). */
  preferences: null;
  /** Registro PII/`@stynx-nyx/privacy` pendente (OD-P17). */
  heldDataSummary: never[];
}

/** `sha256` hex minúsculo do CPF de 11 dígitos (M6; risco OD-P23). */
export function cpfHashOf(cpf: string): string {
  return createHash('sha256').update(cpf).digest('hex');
}

interface SubjectRow extends Record<string, unknown> {
  id: string;
  name: string;
  observed_at: Date;
  version: number;
}

interface ActRequirementRow extends Record<string, unknown> {
  id: string;
  act_key: string;
  minimum_assurance: string;
}

interface RepresentationRow extends Record<string, unknown> {
  id: string;
  represented_name: string;
  scope: 'ait' | 'all';
  valid_until: string | null;
}

interface EntitlementRow extends Record<string, unknown> {
  id: string;
}

/**
 * `portal.subject.name` é `not null` no DDL 61 gerado, enquanto o contrato
 * §7.1/§8 admite `null` quando a claim OIDC `name` não existe (D13 — o DDL
 * manda nas colunas): a ausência é gravada como `''` e devolvida como `null`.
 */
const NO_NAME = '';

/** `tenant_id` é preenchido pela trigger `auth.enforce_tenant_id` (C-0001-32). */
const UPSERT_SUBJECT_SQL = `insert into portal.subject
      (cpf_hash, name, govbr_level_observed, assurance_level_observed, observed_at, version)
    values ($1, $2, $3, $4, $5, 1)
    on conflict (tenant_id, cpf_hash) do update set
      assurance_level_observed = excluded.assurance_level_observed,
      govbr_level_observed = coalesce(excluded.govbr_level_observed, portal.subject.govbr_level_observed),
      name = coalesce(nullif(excluded.name, ''), portal.subject.name),
      observed_at = excluded.observed_at,
      updated_at = excluded.observed_at,
      version = portal.subject.version + case
        when portal.subject.assurance_level_observed is distinct from excluded.assurance_level_observed
          or (excluded.govbr_level_observed is not null
              and excluded.govbr_level_observed is distinct from portal.subject.govbr_level_observed)
        then 1 else 0 end
    returning id, name, observed_at, version`;

/** Todas as linhas vigentes (uma por `act_key`, a mais recente), `act_key` asc. */
const ACT_REQUIREMENTS_SQL = `select distinct on (act_key) id, act_key, minimum_assurance
     from portal.act_level_policy
    where enabled = true
      and effective_from <= $1::date
      and $1::date < coalesce(effective_to, 'infinity'::date)
    order by act_key asc, effective_from desc`;

const REPRESENTATIONS_SQL = `select id, represented_name, scope,
          to_char(valid_until, 'YYYY-MM-DD') as valid_until
     from portal.representation
    where representative_subject_id = $1
      and state = 'PROCURACAO_VALIDADA'
      and (valid_until is null or valid_until >= $2::date)
    order by created_at asc, id asc`;

const ENTITLEMENT_SQL = `select id
     from portal.entitlement
    where subject_id = $1
      and target_kind = $2
      and target_id = $3
      and valid_from <= $4::date
      and (valid_until is null or valid_until >= $4::date)
    limit 1`;

// ---------------------------------------------------------------------------
// §3 representações — [WF-PORTAL-002] (CTG-0001 §6.2; CTG-0002 §2.1)
// ---------------------------------------------------------------------------

export const REPRESENTATION_STATES = [
  'PROCURACAO_APRESENTADA',
  'PROCURACAO_VALIDADA',
  'PROCURACAO_RECUSADA',
] as const;
export type RepresentationState = (typeof REPRESENTATION_STATES)[number];

export interface RepresentationTransition {
  /** `null` = apresentação. */
  from: RepresentationState | null;
  to: RepresentationState;
  command: 'present' | 'validate' | 'refuse' | 'resubmit';
  guard: string;
}

/** Só `portal.representation.state` é persistido (CTG-0001 §6.2). */
export const REPRESENTATION_TRANSITIONS: readonly RepresentationTransition[] = [
  {
    from: null,
    to: 'PROCURACAO_APRESENTADA',
    command: 'present',
    guard: "POST representations; assertActLevel('procuracao')",
  },
  {
    from: 'PROCURACAO_APRESENTADA',
    to: 'PROCURACAO_VALIDADA',
    command: 'validate',
    guard:
      'instrumento conferido (documento assinado no nível do ato presume-se autêntico — RN-PORTAL-104)',
  },
  {
    from: 'PROCURACAO_APRESENTADA',
    to: 'PROCURACAO_RECUSADA',
    command: 'refuse',
    guard:
      'refusal_reason obrigatório (422 REPRESENTATION_REFUSED na resposta síncrona, WF-PORTAL-002)',
  },
  {
    from: 'PROCURACAO_RECUSADA',
    to: 'PROCURACAO_APRESENTADA',
    command: 'resubmit',
    guard: 'reenvio sem reinício (WF-PORTAL-002)',
  },
];

export interface CreateRepresentationInput {
  representedCpf: string;
  representedName: string;
  instrumentDocumentId: string;
  scope: 'ait' | 'all';
  validUntil?: string;
}

export interface PortalRepresentationResponse {
  id: string;
  representedName: string;
  scope: 'ait' | 'all';
  validUntil: string | null;
  state: RepresentationState;
  refusalReason: string | null;
}

export interface ValidateRepresentationInput {
  outcome: 'validated' | 'refused';
  reason?: string;
  /** Alvos (`portal.entitlement.target_id`) quando `scope = 'ait'` (OD-P37). */
  aitIds?: readonly string[];
}

interface RepresentationDetailRow extends Record<string, unknown> {
  id: string;
  representative_subject_id: string;
  represented_cpf_hash: string;
  represented_name: string;
  scope: 'ait' | 'all';
  valid_until: string | null;
  state: RepresentationState;
  refusal_reason: string | null;
}

const REPRESENTATION_COLUMNS = `id, representative_subject_id, represented_cpf_hash, represented_name,
          scope, to_char(valid_until, 'YYYY-MM-DD') as valid_until, state, refusal_reason`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 61). */
const INSERT_REPRESENTATION_SQL = `insert into portal.representation
      (representative_subject_id, represented_cpf_hash, represented_name,
       instrument_document_id, scope, valid_until, state, refusal_reason)
    values ($1, $2, $3, $4, $5, $6, 'PROCURACAO_APRESENTADA', null)
    returning ${REPRESENTATION_COLUMNS}`;

const LIST_REPRESENTATIONS_SQL = `select ${REPRESENTATION_COLUMNS}
     from portal.representation
    where representative_subject_id = $1
    order by created_at asc, id asc`;

const OWNED_REPRESENTATION_SQL = `select ${REPRESENTATION_COLUMNS}
     from portal.representation
    where id = $1 and representative_subject_id = $2
    for update`;

const REPRESENTATION_FOR_UPDATE_SQL = `select ${REPRESENTATION_COLUMNS}
     from portal.representation
    where id = $1
    for update`;

const REVOKE_REPRESENTATION_SQL = `update portal.representation
      set valid_until = $2::date, updated_at = $3
    where id = $1
    returning ${REPRESENTATION_COLUMNS}`;

const VALIDATE_REPRESENTATION_SQL = `update portal.representation
      set state = $2, refusal_reason = $3, updated_at = $4
    where id = $1
    returning ${REPRESENTATION_COLUMNS}`;

const INSERT_REPRESENTATIVE_ENTITLEMENT_SQL = `insert into portal.entitlement
      (subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
    values ($1, 'ait', $2, 'representative', 'representation', $3::date, $4)
    on conflict (tenant_id, subject_id, target_kind, target_id, relation) do update set
      valid_until = excluded.valid_until,
      updated_at = excluded.created_at`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function representationOf(
  row: RepresentationDetailRow,
): PortalRepresentationResponse {
  return {
    id: row.id,
    representedName: row.represented_name,
    scope: row.scope,
    validUntil: row.valid_until,
    state: row.state,
    refusalReason:
      row.state === 'PROCURACAO_RECUSADA' ? (row.refusal_reason ?? null) : null,
  };
}

@Injectable()
export class PortalIdentityService {
  private readonly clock: PortalClockLike;

  constructor(@Optional() clock?: PortalClock) {
    this.clock = clock ?? new PortalClock();
  }

  /** §8: insert sob demanda; `version` só incrementa quando um nível muda. */
  async upsertSubject(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    name: string | null,
    clock: PortalClockLike = this.clock,
  ): Promise<PortalSubjectRecord> {
    const result = await tx.query<SubjectRow>(UPSERT_SUBJECT_SQL, [
      cpfHashOf(identity.cpf),
      name ?? NO_NAME,
      identity.govbrLevel ?? null,
      identity.assuranceLevel,
      clock.now(),
    ]);
    const row = result.rows[0];
    if (!row) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    return {
      subjectId: row.id,
      name: row.name === NO_NAME ? null : row.name,
      observedAt: row.observed_at,
      version: row.version,
    };
  }

  /** §8 `actRequirements`: a leitura não lança; só o ato (`assertActLevel`) lança. */
  async actRequirements(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    clock: PortalClockLike = this.clock,
  ): Promise<PortalActRequirement[]> {
    const result = await tx.query<ActRequirementRow>(ACT_REQUIREMENTS_SQL, [
      clock.today(),
    ]);
    return result.rows.map((row) => {
      const minimumAssurance = row.minimum_assurance as PortalRequiredAssurance;
      if (minimumAssurance === 'qualificada') {
        return {
          actKey: row.act_key,
          minimumAssurance,
          allowed: false,
          reason: 'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
        };
      }
      const allowed =
        minimumAssurance === 'none' ||
        assuranceRank(identity.assuranceLevel) >=
          assuranceRank(minimumAssurance);
      return {
        actKey: row.act_key,
        minimumAssurance,
        allowed,
        ...(allowed ? {} : { reason: 'PORTAL.ASSURANCE_INSUFFICIENT' }),
      };
    });
  }

  /** §4, dentro da transação do comando; relógio injetado (A1(g)). */
  assertActLevel(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    actKey: string,
    resumeRoute: string,
  ): Promise<ActLevelDecision> {
    return assertActLevel(tx, identity, actKey, resumeRoute, this.clock);
  }

  /**
   * §12 (M10): vínculo vigente do sujeito com o alvo; ausência disfarça
   * inexistência (`404 PORTAL.NOT_FOUND { kind }`, route contract §1.2).
   */
  async assertEntitled(
    tx: PortalSqlTransaction,
    subjectId: string,
    targetKind: string,
    targetId: string,
    clock: PortalClockLike = this.clock,
  ): Promise<{ entitlementId: string }> {
    const result = await tx.query<EntitlementRow>(ENTITLEMENT_SQL, [
      subjectId,
      targetKind,
      targetId,
      clock.today(),
    ]);
    const row = result.rows[0];
    if (!row) {
      throw new PortalError('PORTAL.NOT_FOUND', {
        status: 404,
        context: { kind: targetKind },
      });
    }
    return { entitlementId: row.id };
  }

  /** §8 `representations`: só `PROCURACAO_VALIDADA` não vencida. */
  async representationsOf(
    tx: PortalSqlTransaction,
    subjectId: string,
    clock: PortalClockLike = this.clock,
  ): Promise<PortalRepresentationSummary[]> {
    const result = await tx.query<RepresentationRow>(REPRESENTATIONS_SQL, [
      subjectId,
      clock.today(),
    ]);
    return result.rows.map((row) => ({
      id: row.id,
      representedName: row.represented_name,
      scope: row.scope,
      validUntil: row.valid_until,
    }));
  }

  // -------------------------------------------------------------------------
  // §3 representações (CTG-0002 §2.1) — [WF-PORTAL-002]
  // -------------------------------------------------------------------------

  /** `POST representations`: apresentação da procuração (`assertActLevel` é do controlador). */
  async createRepresentation(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    subjectId: string,
    input: CreateRepresentationInput,
    clock: PortalClockLike = this.clock,
  ): Promise<PortalRepresentationResponse> {
    if (input.representedCpf === identity.cpf) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['representedCpf'] },
      });
    }
    if (input.validUntil !== undefined && input.validUntil < clock.today()) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['validUntil'] },
      });
    }
    const result = await tx.query<RepresentationDetailRow>(
      INSERT_REPRESENTATION_SQL,
      [
        subjectId,
        cpfHashOf(input.representedCpf),
        input.representedName,
        input.instrumentDocumentId,
        input.scope,
        input.validUntil ?? null,
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    return representationOf(row);
  }

  /** `GET representations`: todas as do sujeito, todos os estados. */
  async listRepresentations(
    tx: PortalSqlTransaction,
    subjectId: string,
  ): Promise<PortalRepresentationResponse[]> {
    const result = await tx.query<RepresentationDetailRow>(
      LIST_REPRESENTATIONS_SQL,
      [subjectId],
    );
    return result.rows.map(representationOf);
  }

  /**
   * `DELETE representations/{id}`: revogação sem apagar (RN-PORTAL-112) —
   * `valid_until = today − 1`; vínculos `origin='representation'` ficam (OD-P37).
   */
  async revokeRepresentation(
    tx: PortalSqlTransaction,
    subjectId: string,
    representationId: string,
    clock: PortalClockLike = this.clock,
  ): Promise<
    Pick<PortalRepresentationResponse, 'id' | 'state' | 'validUntil'>
  > {
    if (!UUID_RE.test(representationId)) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['id'] },
      });
    }
    const owned = await tx.query<RepresentationDetailRow>(
      OWNED_REPRESENTATION_SQL,
      [representationId, subjectId],
    );
    if (!owned.rows[0]) {
      throw new PortalError('PORTAL.NOT_FOUND', {
        status: 404,
        context: { kind: 'representation' },
      });
    }
    const yesterday = addCalendarDays(clock.today(), -1);
    const updated = await tx.query<RepresentationDetailRow>(
      REVOKE_REPRESENTATION_SQL,
      [representationId, yesterday, clock.now()],
    );
    const row = updated.rows[0] ?? owned.rows[0];
    return { id: row.id, state: row.state, validUntil: yesterday };
  }

  /**
   * Validação/recusa da procuração (CTG-0001 §6.2; sem rota nesta rodada —
   * OD-P37): em `validated` materializa `portal.entitlement` (relation
   * `representative`, origin `representation`) por AIT informado e publica
   * `REPRESENTACAO_VALIDADA` na mesma transação.
   */
  async validateRepresentation(
    tx: PortalSqlTransaction,
    representationId: string,
    input: ValidateRepresentationInput,
    context: Pick<PortalIdentityEventContext, 'actorId' | 'correlationId'>,
    clock: PortalClockLike = this.clock,
  ): Promise<PortalRepresentationResponse> {
    const current = (
      await tx.query<RepresentationDetailRow>(REPRESENTATION_FOR_UPDATE_SQL, [
        representationId,
      ])
    ).rows[0];
    if (!current) {
      throw new PortalError('PORTAL.NOT_FOUND', {
        status: 404,
        context: { kind: 'representation' },
      });
    }
    const command = input.outcome === 'validated' ? 'validate' : 'refuse';
    const transition = REPRESENTATION_TRANSITIONS.find(
      (row) => row.from === current.state && row.command === command,
    );
    if (!transition) {
      // portal-error-catalog.md não tem código de estado para a procuração
      // (só REPRESENTATION_REFUSED/EXPIRED, sem rota nesta rodada — OD-P37);
      // sem rota, a guarda interna responde com o genérico do §7.
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['state'] },
      });
    }
    if (command === 'refuse' && !input.reason) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['reason'] },
      });
    }
    const now = clock.now();
    const updated = (
      await tx.query<RepresentationDetailRow>(VALIDATE_REPRESENTATION_SQL, [
        representationId,
        transition.to,
        command === 'refuse' ? (input.reason ?? null) : null,
        now,
      ])
    ).rows[0];
    if (!updated) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    if (command === 'validate') {
      if (updated.scope === 'ait') {
        for (const aitId of input.aitIds ?? []) {
          await tx.query(INSERT_REPRESENTATIVE_ENTITLEMENT_SQL, [
            updated.representative_subject_id,
            aitId,
            clock.today(),
            updated.valid_until,
          ]);
        }
      }
      await new SqlTeatEventOutbox().append(
        tx as never,
        portalIdentityEvents.representacaoValidada(
          updated.id,
          {
            representationId: updated.id,
            representativeSubjectId: updated.representative_subject_id,
            representedCpfHash: updated.represented_cpf_hash,
            scope: updated.scope,
            validUntil: updated.valid_until,
            validatedAt: now.toISOString(),
          },
          { ...context, occurredAt: now.toISOString() },
        ),
      );
    }
    return representationOf(updated);
  }

  /** Corpo de `GET /v1/portal/identity/me` (§8), numa única transação. */
  async readMe(
    tx: PortalSqlTransaction,
    identity: PortalIdentityClaims,
    name: string | null,
  ): Promise<PortalMeResponse> {
    const subject = await this.upsertSubject(tx, identity, name);
    const actRequirements = await this.actRequirements(tx, identity);
    const representations = await this.representationsOf(tx, subject.subjectId);
    return {
      subjectId: subject.subjectId,
      cpf: identity.cpf,
      name: subject.name,
      assuranceLevel: identity.assuranceLevel,
      govbrLevelObservedAt: subject.observedAt.toISOString(),
      actRequirements,
      representations,
      preferences: null,
      heldDataSummary: [],
    };
  }
}
