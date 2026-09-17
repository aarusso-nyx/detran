// Suporte compartilhado dos e2e do Portal de R-0009 CTG-0002 (TASK-0006):
// `portal-requests.e2e.spec.ts`, `portal-routes.e2e.spec.ts`,
// `portal-stream.e2e.spec.ts`. Não é um arquivo de teste (vitest só coleta
// `*.e2e.spec.ts`). Reúne o que `portal-identity.e2e.spec.ts` (CTG-0001,
// verde — intocado) já faz no `beforeAll`: tenant local + usuário + membership,
// marca/hostname, as 21 linhas de `act_level_policy` (CTG-0001 §5, M5/A1) e as
// 15 de `service_catalog` (§10.7, M12) copiadas do contrato; mais o app Nest
// com `PortalClock` substituído por `FixedClock` (2026-09-14, CTG-0002 §13) e
// providers sobrescritos por teste (`PORTAL_DELEGATION_TARGETS`,
// `PORTAL_NATIONAL_READ_PORTS`, `PORTAL_STREAM_POLLER` — §3.2, §8, §9).
//
// Ids das linhas do tenant local: prefixo M22 (`0000700<TT>0`) com `nn` a partir
// de `e1` para nunca colidir com as fixtures canônicas (01…15) — a chave
// primária é o `id` sozinho.
import { createHash, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import pg from 'pg';
import request from 'supertest';
import { PortalClock } from '@detran/portal-identity';

import { AppModule } from '../../src/app.module.js';

export const TENANT_ID = '00000000-0000-7000-8000-000000000001';
export const ACTOR_ID = '00000000-0000-4000-8000-000000000002';
export const CANONICAL_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
export const LOCAL_HOSTNAME = 'portal.local-e2e.invalid';
export const FIXED_TODAY = '2026-09-14';
export const FIXED_TZ = 'America/Manaus';
/** Uuid nulo = `PORTAL_PUBLIC_ACTOR_ID` de `backend/app/src/detran-runtime.ts` (A3(b)). */
export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export const CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';

/** CPFs fixture (CTG-0001 §10.2) — sem DV válido; a guarda não valida DV (OD-P25). */
export const CPF = {
  bronze: '11111111111',
  prata: '22222222222',
  ouro: '33333333333',
  qualificada: '44444444444',
  procurador: '55555555555',
} as const;

/** AITs de `30-fixtures-infraction.sql` e alvos externos `…ff…` (CTG-0001 §10.1/§10.3). */
export const AITS = {
  f1: '00000000-0000-7000-8000-0000f0000001',
  f2: '00000000-0000-7000-8000-0000f0000002',
  f3: '00000000-0000-7000-8000-0000f0000003',
  f5: '00000000-0000-7000-8000-0000f0000005',
  f6: '00000000-0000-7000-8000-0000f0000006',
  f9: '00000000-0000-7000-8000-0000f0000009',
  f10: '00000000-0000-7000-8000-0000f0000010',
  f12: '00000000-0000-7000-8000-0000f0000012',
} as const;
export const EXTERNAL = {
  vehicle: '00000000-0000-7000-8000-00007ff00001',
  exam: '00000000-0000-7000-8000-00007ff00002',
  crash: '00000000-0000-7000-8000-00007ff00003',
  instrument: '00000000-0000-7000-8000-00007ff90001',
} as const;

/** Linhas do tenant local (prefixo M22, nn ≥ e1). */
export const LOCAL = {
  inboxSne: '00000000-0000-7000-8000-000070c000e1',
  inboxPortal: '00000000-0000-7000-8000-000070c000e2',
  inboxOther: '00000000-0000-7000-8000-000070c000e3',
  manifestationCiencia: '00000000-0000-7000-8000-000070700e01',
  manifestationEmAnalise: '00000000-0000-7000-8000-000070700e02',
  manifestationOferecida: '00000000-0000-7000-8000-000070700e03',
  crashView: '00000000-0000-7000-8000-000071e000e1',
  examView: '00000000-0000-7000-8000-000071f000e1',
  pointsView: '00000000-0000-7000-8000-000071000e01',
  representation: '00000000-0000-7000-8000-000070100e01',
  sourceEvent: (nn: number) => `00000000-0000-7000-8000-000071b000e${nn}`,
  infractionView: (nn: number) => `00000000-0000-7000-8000-000070f000e${nn}`,
  entitlement: (nn: number) => `00000000-0000-7000-8000-000070200e0${nn}`,
} as const;

export const SNE_EFFECTS = [
  'ciencia_ficta',
  'canal_exclusivo',
  'desconto_60',
  'cancelamento',
] as const;

/** Cópia de CTG-0001 §5 (M5/A1) — as 21 linhas de act_level_policy. */
export const ACT_LEVEL_POLICY_ROWS: Array<{ actKey: string; minimum: string }> =
  [
    { actKey: 'consulta_multas', minimum: 'simples' },
    { actKey: 'consulta_cnh', minimum: 'simples' },
    { actKey: 'emissao_crlv', minimum: 'simples' },
    { actKey: 'pagamento', minimum: 'simples' },
    { actKey: 'adesao_sne', minimum: 'avancada' },
    { actKey: 'cancelamento_sne', minimum: 'avancada' },
    { actKey: 'lgpd_declaracao', minimum: 'simples' },
    { actKey: 'acompanhar_manifestacao', minimum: 'simples' },
    { actKey: 'defesa_previa', minimum: 'avancada' },
    { actKey: 'recurso_jari', minimum: 'avancada' },
    { actKey: 'recurso_cetran', minimum: 'avancada' },
    { actKey: 'indicacao_condutor', minimum: 'avancada' },
    { actKey: 'procuracao', minimum: 'avancada' },
    { actKey: 'junta_medica', minimum: 'avancada' },
    { actKey: 'lgpd_declaracao:declaracao_completa', minimum: 'avancada' },
    { actKey: 'lgpd_declaracao:correcao', minimum: 'avancada' },
    { actKey: 'lgpd_declaracao:eliminacao', minimum: 'avancada' },
    { actKey: 'manifestar', minimum: 'none' },
    { actKey: 'consulta_bat', minimum: 'simples' },
    { actKey: 'consulta_exame', minimum: 'simples' },
    { actKey: 'avaliar', minimum: 'simples' },
  ];

export const PRESENTIAL_NOTE =
  'Atendimento presencial ([REF-DETRANAM-SERVICOS])';

/** Cópia de CTG-0001 §10.7 (M12) — as 15 linhas de service_catalog. */
export const SERVICE_CATALOG_ROWS: Array<{
  serviceKey: string;
  category: string;
  availability: 'available' | 'partially_available' | 'unavailable';
  minimum: string;
  unavailableReason: string | null;
  alternativeChannelNote: string | null;
  legalDeadline: string;
}> = [
  {
    serviceKey: 'consulta_multas',
    category: 'inf',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'consulta_cnh',
    category: 'ch',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'emissao_crlv',
    category: 'est',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'adesao_sne',
    category: 'inf',
    availability: 'available',
    minimum: 'avancada',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'cancelamento_sne',
    category: 'inf',
    availability: 'available',
    minimum: 'avancada',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'consulta_bat',
    category: 'est',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'consulta_exame',
    category: 'ch',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'manifestar',
    category: 'transversal',
    availability: 'available',
    minimum: 'none',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'resposta em 30 dias, prorrogável 1x — Lei 13.460 art. 16',
  },
  {
    serviceKey: 'avaliar',
    category: 'transversal',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
    legalDeadline: 'sem prazo próprio',
  },
  {
    serviceKey: 'pagamento',
    category: 'inf',
    availability: 'partially_available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote:
      'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'lgpd_declaracao',
    category: 'transversal',
    availability: 'partially_available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote:
      'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'defesa_previa',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: PRESENTIAL_NOTE,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'recurso_jari',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: PRESENTIAL_NOTE,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'recurso_cetran',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: PRESENTIAL_NOTE,
    legalDeadline: 'source_pending (OD-P26)',
  },
  {
    serviceKey: 'indicacao_condutor',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: PRESENTIAL_NOTE,
    legalDeadline: 'source_pending (OD-P26)',
  },
];

export function cpfHash(cpf: string): string {
  return createHash('sha256').update(cpf).digest('hex');
}

export function newClient(): pg.Client {
  return new pg.Client({ connectionString: CONNECTION_STRING });
}

export async function asOwner(client: pg.Client): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  await client.query(`select set_config('app.actor_id', $1, false)`, [
    ACTOR_ID,
  ]);
}

/** Mesmo `beforeAll` de portal-identity.e2e.spec.ts (tenant local, marca, hostname, políticas, catálogo). */
export async function seedLocalTenant(client: pg.Client): Promise<void> {
  await asOwner(client);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, 'local-e2e', 'Local E2E')
     on conflict (id) do update set name = excluded.name`,
    [TENANT_ID],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, 'local-e2e@detran.invalid', 'Local E2E')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [ACTOR_ID, TENANT_ID],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [TENANT_ID, ACTOR_ID],
  );
  await client.query(
    `insert into portal.brand_profile (tenant_id, display_name, short_name, legal_name, primary_color, support_url, privacy_url, accessibility_url, service_contact, locale, time_zone)
     values ($1, 'Local E2E Portal (fixture)', 'Local E2E', 'Local E2E Portal (fixture)', '#1351B4', 'https://portal.local-e2e.invalid/suporte', 'https://portal.local-e2e.invalid/privacidade', 'https://portal.local-e2e.invalid/acessibilidade', 'ouvidoria@local-e2e.invalid', 'pt-BR', $2)
     on conflict (tenant_id) do update set display_name = excluded.display_name`,
    [TENANT_ID, FIXED_TZ],
  );
  await client.query(
    `insert into portal.public_hostname (hostname, tenant_id, enabled) values ($1, $2, true)
     on conflict (hostname) do update set tenant_id = excluded.tenant_id, enabled = true`,
    [LOCAL_HOSTNAME, TENANT_ID],
  );
  for (const row of ACT_LEVEL_POLICY_ROWS) {
    await client.query(
      `insert into portal.act_level_policy (id, tenant_id, act_key, minimum_assurance, legal_basis, decision_ref, enabled, effective_from, effective_to)
       values ($1, $2, $3, $4, 'fixture e2e (cópia de CTG-0001 §5)', 'fixture e2e', true, '2026-01-01', null)
       on conflict (tenant_id, act_key, effective_from) do update set minimum_assurance = excluded.minimum_assurance`,
      [randomUUID(), TENANT_ID, row.actKey, row.minimum],
    );
  }
  for (const row of SERVICE_CATALOG_ROWS) {
    await client.query(
      `insert into portal.service_catalog (
         id, tenant_id, service_key, route, category, title, summary, requirements_json,
         delivery_channel, legal_deadline, cost, accessibility_note, responsible_party,
         normative_reference, availability, unavailable_reason, alternative_channel_note,
         minimum_assurance, version, effective_from
       ) values (
         $1, $2, $3, $4, $5, $6, $6, '["Conta gov.br"]'::jsonb, 'portal', $11,
         'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'Local E2E',
         'fixture e2e', $7, $8, $9, $10, 1, '2026-01-01'
       )
       on conflict (tenant_id, service_key) do update set
         availability = excluded.availability,
         unavailable_reason = excluded.unavailable_reason,
         alternative_channel_note = excluded.alternative_channel_note,
         minimum_assurance = excluded.minimum_assurance,
         legal_deadline = excluded.legal_deadline,
         requirements_json = excluded.requirements_json`,
      [
        randomUUID(),
        TENANT_ID,
        row.serviceKey,
        `/servicos/${row.serviceKey.replaceAll('_', '-')}`,
        row.category,
        `${row.serviceKey} (fixture e2e)`,
        row.availability,
        row.unavailableReason,
        row.alternativeChannelNote,
        row.minimum,
        row.legalDeadline,
      ],
    );
  }
}

/**
 * Limpa o que os e2e de CTG-0002 criam no tenant local (idempotência contra banco
 * persistente — precedente C-0001-41). Nunca toca subject/act_level_policy/
 * service_catalog/brand/hostname (compartilhados com portal-identity.e2e.spec.ts).
 */
export async function resetLocalPortalRows(client: pg.Client): Promise<void> {
  await asOwner(client);
  for (const table of [
    'portal.consequence_ack',
    'portal.evaluation',
    'portal.request_attachment',
    'portal.protocol',
    'portal.request_draft',
    'portal.request',
    'portal.idempotency_record',
    'portal.acknowledgement_evidence',
    'portal.inbox_item',
    'portal.sne_enrollment',
    'portal.push_subscription',
    'portal.manifestation_extension',
    'portal.manifestation',
    'portal.projection_applied_event',
    'portal.process_timeline',
    'portal.points_view',
    'portal.crash_view',
    'portal.exam_view',
    'portal.infraction_view',
    'portal.national_read_cache',
    'portal.entitlement',
    'portal.representation',
  ]) {
    await client.query(`delete from ${table} where tenant_id = $1`, [
      TENANT_ID,
    ]);
  }
  await client.query(
    `delete from integration.outbox where tenant_id = $1 and (topic like 'portal.%' or topic like 'inf.%' or topic like 'rait.%')`,
    [TENANT_ID],
  );
}

/**
 * Limpa, ao final de `portal-requests.e2e.spec.ts`, as linhas do tenant local
 * criadas para um sujeito específico (o sujeito ouro, CPF fixture
 * `33333333333` — plan.md §Triagem, TASK-0006 iteração 2): sem isso,
 * `portal-identity.e2e.spec.ts` C-0001-41 (`delete from portal.subject`)
 * viola FK numa segunda execução contra banco persistente. Ordem das FKs
 * (DDL 61/62): idempotency_record, consequence_ack, request_draft,
 * request_attachment, protocol, evaluation, request, representation,
 * entitlement — nunca `portal.subject` em si (compartilhado com outros
 * arquivos e2e).
 */
export async function resetGoldenSubjectRows(
  client: pg.Client,
  subjectId: string,
): Promise<void> {
  await asOwner(client);
  const requestIds = (
    await client.query<{ id: string }>(
      `select id from portal.request where tenant_id = $1 and subject_id = $2`,
      [TENANT_ID, subjectId],
    )
  ).rows.map((row) => row.id);
  await client.query(
    `delete from portal.idempotency_record where tenant_id = $1 and subject_id = $2`,
    [TENANT_ID, subjectId],
  );
  if (requestIds.length > 0) {
    await client.query(
      `delete from portal.consequence_ack where tenant_id = $1 and request_id = any($2::uuid[])`,
      [TENANT_ID, requestIds],
    );
    await client.query(
      `delete from portal.request_draft where tenant_id = $1 and request_id = any($2::uuid[])`,
      [TENANT_ID, requestIds],
    );
    await client.query(
      `delete from portal.request_attachment where tenant_id = $1 and request_id = any($2::uuid[])`,
      [TENANT_ID, requestIds],
    );
    await client.query(
      `delete from portal.protocol where tenant_id = $1 and request_id = any($2::uuid[])`,
      [TENANT_ID, requestIds],
    );
    await client.query(
      `delete from portal.evaluation where tenant_id = $1 and subject_kind = 'request' and subject_id = any($2::uuid[])`,
      [TENANT_ID, requestIds],
    );
  }
  await client.query(
    `delete from portal.request where tenant_id = $1 and subject_id = $2`,
    [TENANT_ID, subjectId],
  );
  await client.query(
    `delete from portal.representation where tenant_id = $1 and representative_subject_id = $2`,
    [TENANT_ID, subjectId],
  );
  await client.query(
    `delete from portal.entitlement where tenant_id = $1 and subject_id = $2`,
    [TENANT_ID, subjectId],
  );
}

export interface CitizenEnv {
  cpf: string;
  level: 'simples' | 'avancada' | 'qualificada';
  roles?: string;
}

export function setCitizen({
  cpf,
  level,
  roles = 'CIDADAO',
}: CitizenEnv): void {
  process.env.DETRAN_LOCAL_ROLES = roles;
  process.env.DETRAN_LOCAL_CPF = cpf;
  process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = level;
}

export function clearCitizenEnv(): void {
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
  delete process.env.DETRAN_LOCAL_CPF;
  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
}

export function headers(
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': randomUUID(),
    ...extra,
  };
}

/** Cabeçalhos sem sessão (rotas públicas): tenant pelo header, sem Authorization. */
export function anonymousHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    'x-tenant-id': TENANT_ID,
    'idempotency-key': randomUUID(),
    ...extra,
  };
}

export interface ProviderOverride {
  token: unknown;
  value: unknown;
}

/**
 * Relógio fixo com a forma de `PortalClock`/`Clock` (`now()`, `today(tz)`) — o
 * mesmo contrato de `FixedClock` de `@detran/inf-deadlines` (rait-test-strategy.md
 * §6), reproduzido aqui porque `@detran/app` não declara aquele pacote como
 * dependência (`package.json` está fora do que o Inspector toca).
 */
export class E2eFixedClock {
  readonly tz = FIXED_TZ;
  today(_tenantTz?: string): string {
    return FIXED_TODAY;
  }
  now(): Date {
    return new Date(`${FIXED_TODAY}T12:00:00.000Z`);
  }
}

/** App real com `PortalClock` fixo (CTG-0002 §13) e providers de teste (§3.2, §8, §9). */
export async function createPortalApp(
  overrides: ProviderOverride[] = [],
  options: { fixedClock?: boolean } = {},
): Promise<INestApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule.forRoot()] });
  if (options.fixedClock !== false) {
    builder = builder
      .overrideProvider(PortalClock)
      .useValue(new E2eFixedClock());
  }
  for (const override of overrides) {
    builder = builder
      .overrideProvider(override.token as never)
      .useValue(override.value);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({
    logger: false,
    abortOnError: false,
  });
  await app.init();
  return app;
}

/** `GET me` cria/atualiza o sujeito (M22: o e2e cria os seus via API) e devolve o id. */
export async function subjectIdOf(
  app: INestApplication,
  citizen: CitizenEnv,
): Promise<string> {
  setCitizen(citizen);
  const response = await request(app.getHttpServer())
    .get('/v1/portal/identity/me')
    .set(headers());
  if (response.status !== 200) {
    throw new Error(
      `GET me falhou para ${citizen.cpf}: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }
  return response.body.subjectId as string;
}

/** `import()` dinâmico de módulos que só existem depois de TASK-0007/0008. */
export const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

export async function auditRows(
  client: pg.Client,
  action: string,
): Promise<Array<{ action: string; entity: string }>> {
  await asOwner(client);
  const result = await client.query<{ action: string; entity: string }>(
    `select action, entity from audit.events where tenant_id = $1 and action = $2 order by occurred_at desc`,
    [TENANT_ID, action],
  );
  return result.rows;
}
