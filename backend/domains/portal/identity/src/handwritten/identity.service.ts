// Identidade federada do cidadão (work/rounds/R-0009/contracts/CTG-0001.md §2,
// §4, §8 e §12; plan R-0009 M3, M4, M6, M24; ADR-0024). Funções puras das
// claims (§2.1) e do nível por ato (§4) mais o serviço injetável declarado
// pelo bloco `module` de BP-PORTAL-IDENTITY-001: upsert do sujeito, matriz
// ato → nível, vínculo e representações. Nunca lê `Date.now()`: o relógio é
// `PortalClock` (adenda A1(g)).
import { createHash } from 'node:crypto';
import { Injectable, Optional } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';
import type { getPrincipalFromRequest } from '@detran/shared';

import { PortalClock, type PortalClockLike } from './clock.js';
import { PortalError } from './errors.js';

type Principal = NonNullable<ReturnType<typeof getPrincipalFromRequest>>;

/** Subconjunto da transação STYNX que este pacote usa (SQL parametrizado). */
export type PortalSqlTransaction = Pick<Transaction, 'query'>;

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
