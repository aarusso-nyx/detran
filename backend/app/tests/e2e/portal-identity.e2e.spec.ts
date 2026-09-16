import { createHash, randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

/**
 * CTG-0001 §11 (TASK-0003) — identidade federada, guarda fail-closed, matriz ato → nível e
 * catálogo público através das quatro rotas de CTG-0001 (`GET identity/me`, `GET brand`,
 * `GET services[/{key}]`). Fica vermelho até TASK-0004 montar os cinco módulos gerados no
 * `AppModule`, criar `PortalCitizenGuard`/`PortalIdentityService` e as rotas manuscritas
 * (`me.controller.ts`, `public.controller.ts`) — hoje as quatro rotas nem existem, então as
 * chamadas HTTP abaixo respondem 404 do próprio Nest (rota inexistente), o sinal esperado de
 * "comportamento ausente" (mesmo padrão de inf-ait-routes.e2e.spec.ts §13 item 2, leitura
 * obrigatória).
 *
 * Setup no molde de backend/app/tests/e2e/inf-ait-routes.e2e.spec.ts (leitura obrigatória):
 * tenant local + usuário + membership fixos, `NestFactory.create(AppModule.forRoot())`,
 * `headers()`/limpeza de env no `afterAll`. `fileParallelism: false` (vitest.config.ts) mantém
 * este arquivo no mesmo processo dos demais e2e — todo `DETRAN_LOCAL_*`/
 * `DETRAN_PORTAL_HOST_RESOLUTION` setado por um teste é limpo no `afterEach`/`afterAll` (padrão
 * de policy-routes.e2e.spec.ts §1-60, leitura obrigatória).
 */
const { Client } = pg;
const tenantId = '00000000-0000-7000-8000-000000000001';
const actorId = '00000000-0000-4000-8000-000000000002';
const canonicalTenantId = '00000000-0000-7000-8000-00000000a001';
const localHostname = 'portal.local-e2e.invalid';
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
let app: Awaited<ReturnType<typeof NestFactory.create>>;

/** Cópia do §5 (M5/A1) — as 21 linhas de act_level_policy, para o tenant local (C-0001-39/40). */
const ACT_LEVEL_POLICY_ROWS: Array<{ actKey: string; minimum: string }> = [
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

/** Cópia do §10.7 (M12) — as 15 linhas de service_catalog, para o tenant local (C-0001-45/46). */
const SERVICE_CATALOG_ROWS: Array<{
  serviceKey: string;
  category: string;
  availability: 'available' | 'partially_available' | 'unavailable';
  minimum: string;
  unavailableReason: string | null;
  alternativeChannelNote: string | null;
}> = [
  {
    serviceKey: 'consulta_multas',
    category: 'inf',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'consulta_cnh',
    category: 'ch',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'emissao_crlv',
    category: 'est',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'adesao_sne',
    category: 'inf',
    availability: 'available',
    minimum: 'avancada',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'cancelamento_sne',
    category: 'inf',
    availability: 'available',
    minimum: 'avancada',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'consulta_bat',
    category: 'est',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'consulta_exame',
    category: 'ch',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'manifestar',
    category: 'transversal',
    availability: 'available',
    minimum: 'none',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'avaliar',
    category: 'transversal',
    availability: 'available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote: null,
  },
  {
    serviceKey: 'pagamento',
    category: 'inf',
    availability: 'partially_available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote:
      'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
  },
  {
    serviceKey: 'lgpd_declaracao',
    category: 'transversal',
    availability: 'partially_available',
    minimum: 'simples',
    unavailableReason: null,
    alternativeChannelNote:
      'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
  },
  {
    serviceKey: 'defesa_previa',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
  },
  {
    serviceKey: 'recurso_jari',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
  },
  {
    serviceKey: 'recurso_cetran',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
  },
  {
    serviceKey: 'indicacao_condutor',
    category: 'inf',
    availability: 'unavailable',
    minimum: 'avancada',
    unavailableReason: 'delegacao_indisponivel_r0007',
    alternativeChannelNote: 'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
  },
];

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, 'local-e2e', 'Local E2E')
     on conflict (id) do update set name = excluded.name`,
    [tenantId],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, 'local-e2e@detran.invalid', 'Local E2E')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [actorId, tenantId],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [tenantId, actorId],
  );

  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(`select set_config('app.actor_id', $1, false)`, [actorId]);

  await client.query(
    `insert into portal.brand_profile (tenant_id, display_name, short_name, legal_name, primary_color, support_url, privacy_url, accessibility_url, service_contact, locale, time_zone)
     values ($1, 'Local E2E Portal (fixture)', 'Local E2E', 'Local E2E Portal (fixture)', '#1351B4', 'https://portal.local-e2e.invalid/suporte', 'https://portal.local-e2e.invalid/privacidade', 'https://portal.local-e2e.invalid/acessibilidade', 'ouvidoria@local-e2e.invalid', 'pt-BR', 'America/Manaus')
     on conflict (tenant_id) do update set display_name = excluded.display_name`,
    [tenantId],
  );
  await client.query(
    `insert into portal.public_hostname (hostname, tenant_id, enabled) values ($1, $2, true)
     on conflict (hostname) do update set tenant_id = excluded.tenant_id, enabled = true`,
    [localHostname, tenantId],
  );

  // `on conflict` mira a chave natural (tenant_id, act_key, effective_from) — não (id) — para o
  // beforeAll ficar idempotente entre execuções sucessivas contra o mesmo banco local (o `id` é
  // sorteado a cada run; mirar (id) faria a segunda execução colidir com a unique de negócio em
  // vez de atualizar a linha existente).
  for (const row of ACT_LEVEL_POLICY_ROWS) {
    await client.query(
      `insert into portal.act_level_policy (id, tenant_id, act_key, minimum_assurance, legal_basis, decision_ref, enabled, effective_from, effective_to)
       values ($1, $2, $3, $4, 'fixture e2e (cópia de CTG-0001 §5)', 'fixture e2e', true, '2026-01-01', null)
       on conflict (tenant_id, act_key, effective_from) do update set minimum_assurance = excluded.minimum_assurance`,
      [randomUUID(), tenantId, row.actKey, row.minimum],
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
         $1, $2, $3, $4, $5, $6, $6, '[]'::jsonb, 'portal', 'source_pending (OD-P26)',
         'gratuito', 'Conforme declaração de acessibilidade (RN-PORTAL-113)', 'Local E2E',
         'fixture e2e', $7, $8, $9, $10, 1, '2026-01-01'
       )
       on conflict (tenant_id, service_key) do update set
         availability = excluded.availability,
         unavailable_reason = excluded.unavailable_reason,
         alternative_channel_note = excluded.alternative_channel_note,
         minimum_assurance = excluded.minimum_assurance`,
      [
        randomUUID(),
        tenantId,
        row.serviceKey,
        `/servicos/${row.serviceKey.replaceAll('_', '-')}`,
        row.category,
        `${row.serviceKey} (fixture e2e)`,
        row.availability,
        row.unavailableReason,
        row.alternativeChannelNote,
        row.minimum,
      ],
    );
  }

  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
  delete process.env.DETRAN_LOCAL_CPF;
  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
});

afterEach(() => {
  // Mesmo cuidado de inf-ait-routes.e2e.spec.ts (leitura obrigatória) — roda mesmo quando o
  // teste lança no meio, para nenhum DETRAN_LOCAL_*/DETRAN_PORTAL_HOST_RESOLUTION vazar para o
  // próximo teste ou arquivo (fileParallelism: false, mesmo processo).
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
  delete process.env.DETRAN_LOCAL_CPF;
  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
});

const headers = () => ({
  authorization: 'Bearer local',
  'x-tenant-id': tenantId,
  'idempotency-key': randomUUID(),
});

describe('GET /v1/portal/identity/me (§3, §8; M4) — guarda fail-closed', () => {
  it('C-0001-38 — dado DETRAN_LOCAL_ROLES=CIDADAO sem DETRAN_LOCAL_ASSURANCE_LEVEL quando GET me então 403 PORTAL.ASSURANCE_NOT_VERIFIED', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
  });

  it('C-0001-39 — dado ASSURANCE_LEVEL=avancada e CPF=22222222222 quando GET me então 200 com o corpo do §8 e actRequirements com 21 itens', async () => {
    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'avancada';
    process.env.DETRAN_LOCAL_CPF = '22222222222';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.cpf).toBe('22222222222');
    expect(response.body.assuranceLevel).toBe('avancada');
    expect(typeof response.body.subjectId).toBe('string');
    expect(response.body.actRequirements).toHaveLength(21);
    expect(response.body.representations).toEqual([]);
    expect(response.body.preferences).toBeNull();
    expect(response.body.heldDataSummary).toEqual([]);

    const adesaoSne = response.body.actRequirements.find(
      (item: { actKey: string }) => item.actKey === 'adesao_sne',
    );
    expect(adesaoSne?.allowed).toBe(true);
    const manifestar = response.body.actRequirements.find(
      (item: { actKey: string }) => item.actKey === 'manifestar',
    );
    expect(manifestar?.allowed).toBe(true);
    const defesaPrevia = response.body.actRequirements.find(
      (item: { actKey: string }) => item.actKey === 'defesa_previa',
    );
    expect(defesaPrevia?.allowed).toBe(true);
  });

  it('C-0001-40 — dado ASSURANCE_LEVEL=simples e CPF=11111111111 quando GET me então actRequirements: adesao_sne allowed=false reason PORTAL.ASSURANCE_INSUFFICIENT; consulta_multas allowed=true', async () => {
    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'simples';
    process.env.DETRAN_LOCAL_CPF = '11111111111';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const adesaoSne = response.body.actRequirements.find(
      (item: { actKey: string }) => item.actKey === 'adesao_sne',
    );
    expect(adesaoSne).toMatchObject({
      allowed: false,
      reason: 'PORTAL.ASSURANCE_INSUFFICIENT',
    });
    const consultaMultas = response.body.actRequirements.find(
      (item: { actKey: string }) => item.actKey === 'consulta_multas',
    );
    expect(consultaMultas?.allowed).toBe(true);
  });

  it('C-0001-41 — dado GET me duas vezes com o mesmo CPF então uma única linha em portal.subject (upsert) e version 1; dado a segunda com nível diferente então version 2', async () => {
    const cpf = '33333333333';
    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'simples';
    process.env.DETRAN_LOCAL_CPF = cpf;
    const cpfHash = createHash('sha256').update(cpf).digest('hex');

    const first = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(first.status, JSON.stringify(first.body)).toBe(200);

    const second = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(second.status, JSON.stringify(second.body)).toBe(200);

    const afterTwoSameLevel = await client.query<{
      count: string;
      version: number;
    }>(
      `select count(*)::text as count, max(version) as version from portal.subject
        where tenant_id = $1 and cpf_hash = $2`,
      [tenantId, cpfHash],
    );
    expect(afterTwoSameLevel.rows[0]?.count).toBe('1');
    expect(afterTwoSameLevel.rows[0]?.version).toBe(1);

    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'avancada';
    const third = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(third.status, JSON.stringify(third.body)).toBe(200);

    const afterLevelChange = await client.query<{
      count: string;
      version: number;
    }>(
      `select count(*)::text as count, max(version) as version from portal.subject
        where tenant_id = $1 and cpf_hash = $2`,
      [tenantId, cpfHash],
    );
    expect(afterLevelChange.rows[0]?.count).toBe('1');
    expect(afterLevelChange.rows[0]?.version).toBe(2);
  });

  it('C-0001-42 — dado DETRAN_LOCAL_ROLES=field-agent com claims válidas quando GET me então 403 PORTAL.IDENTITY_NOT_CITIZEN', async () => {
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'simples';
    process.env.DETRAN_LOCAL_CPF = '11111111111';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('PORTAL.IDENTITY_NOT_CITIZEN');
  });

  it('C-0001-43 — dado DETRAN_LOCAL_ROLES=technical-admin sem claims quando GET me então 403 PORTAL.ASSURANCE_NOT_VERIFIED (a política concede "*"; a guarda nega)', async () => {
    process.env.DETRAN_LOCAL_ROLES = 'technical-admin';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('PORTAL.ASSURANCE_NOT_VERIFIED');
  });

  it('C-0001-51 — dado GET me quando bem-sucedido então uma linha de auditoria com action PORTAL_IDENTITY_READ e entity portal.subject (M20, RN-PORTAL-118 4)', async () => {
    process.env.DETRAN_LOCAL_ASSURANCE_LEVEL = 'avancada';
    process.env.DETRAN_LOCAL_CPF = '22222222222';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/identity/me')
      .set(headers());
    expect(response.status, JSON.stringify(response.body)).toBe(200);

    const audited = await client.query<{ action: string; entity: string }>(
      `select action, entity from audit.events
        where tenant_id = $1 and action = 'PORTAL_IDENTITY_READ'
        order by occurred_at desc limit 1`,
      [tenantId],
    );
    expect(audited.rows[0]?.action).toBe('PORTAL_IDENTITY_READ');
    expect(audited.rows[0]?.entity).toBe('portal.subject');
  });
});

describe('GET /v1/portal/brand e /v1/portal/services (@Public, M12) — sem Authorization', () => {
  it('C-0001-44 — dado sem Authorization quando GET /v1/portal/brand então 200 com os 10 campos do tenant local', async () => {
    const response = await request(app.getHttpServer()).get('/v1/portal/brand');
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toMatchObject({
      displayName: 'Local E2E Portal (fixture)',
      shortName: 'Local E2E',
      legalName: 'Local E2E Portal (fixture)',
      primaryColor: '#1351B4',
      locale: 'pt-BR',
      timeZone: 'America/Manaus',
    });
    expect(Object.keys(response.body).sort()).toEqual(
      [
        'displayName',
        'shortName',
        'legalName',
        'primaryColor',
        'supportUrl',
        'privacyUrl',
        'accessibilityUrl',
        'serviceContact',
        'locale',
        'timeZone',
      ].sort(),
    );
  });

  it('C-0001-45 — dado sem Authorization quando GET /v1/portal/services então 200 com 15 itens, 9/2/4 por availability, ordem category,serviceKey', async () => {
    const response = await request(app.getHttpServer()).get(
      '/v1/portal/services',
    );
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toHaveLength(15);
    const byAvailability = {
      available: 0,
      partially_available: 0,
      unavailable: 0,
    };
    for (const service of response.body as Array<{
      availability: keyof typeof byAvailability;
    }>) {
      byAvailability[service.availability] += 1;
    }
    expect(byAvailability).toEqual({
      available: 9,
      partially_available: 2,
      unavailable: 4,
    });
    const ordered = [...response.body].sort(
      (
        left: { category: string; serviceKey: string },
        right: { category: string; serviceKey: string },
      ) =>
        left.category === right.category
          ? left.serviceKey.localeCompare(right.serviceKey)
          : left.category.localeCompare(right.category),
    );
    expect(response.body).toEqual(ordered);
  });

  it('C-0001-46 — dado GET /v1/portal/services/manifestar então 200 minimumAssurance "none"; dado GET services/nao_existe então 404 PORTAL.NOT_FOUND { kind: "service" }', async () => {
    const found = await request(app.getHttpServer()).get(
      '/v1/portal/services/manifestar',
    );
    expect(found.status, JSON.stringify(found.body)).toBe(200);
    expect(found.body.minimumAssurance).toBe('none');

    const missing = await request(app.getHttpServer()).get(
      '/v1/portal/services/nao_existe',
    );
    expect(missing.status, JSON.stringify(missing.body)).toBe(404);
    expect(missing.body.code).toBe('PORTAL.NOT_FOUND');
    expect(missing.body.context).toEqual({ kind: 'service' });
  });
});

describe('Resolução de tenant pelo Host (§9, M11) — DETRAN_PORTAL_HOST_RESOLUTION=on', () => {
  it('C-0001-47 — dado Host "portal.local-e2e.invalid" sem X-Tenant-Id quando GET brand então 200 (tenant do Host)', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/brand')
      .set('Host', localHostname);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.displayName).toBe('Local E2E Portal (fixture)');
  });

  it('C-0001-48 — dado Host desconhecido sem X-Tenant-Id quando GET brand então 421 PORTAL.TENANT_UNRESOLVED', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/brand')
      .set('Host', 'portal.desconhecido.invalid');
    expect(response.status, JSON.stringify(response.body)).toBe(421);
    expect(response.body.code).toBe('PORTAL.TENANT_UNRESOLVED');
  });

  it('C-0001-49 — dado Host "portal.local-e2e.invalid" e X-Tenant-Id = tenant canônico quando GET brand então 403 PORTAL.SESSION_TENANT_MISMATCH', async () => {
    process.env.DETRAN_PORTAL_HOST_RESOLUTION = 'on';
    const response = await request(app.getHttpServer())
      .get('/v1/portal/brand')
      .set('Host', localHostname)
      .set('x-tenant-id', canonicalTenantId);
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body.code).toBe('PORTAL.SESSION_TENANT_MISMATCH');
  });

  it('C-0001-50 — dado DETRAN_PORTAL_HOST_RESOLUTION ausente e Host desconhecido quando GET brand então comportamento atual (tenant local) — 200', async () => {
    delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
    const response = await request(app.getHttpServer())
      .get('/v1/portal/brand')
      .set('Host', 'portal.desconhecido.invalid');
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.displayName).toBe('Local E2E Portal (fixture)');
  });
});
