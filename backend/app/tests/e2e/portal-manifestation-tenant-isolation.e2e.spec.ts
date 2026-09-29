import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  CPF,
  TENANT_ID,
  asOwner,
  clearCitizenEnv,
  cpfHash,
  createPortalApp,
  headers,
  newClient,
  resetLocalPortalRows,
  seedLocalTenant,
  setCitizen,
} from './portal-e2e.support.js';

/**
 * Hotfix de segurança (autorizado pelo Owner em 2026-09-29, fora de R-0022):
 * `POST /v1/portal/manifestations` é `@Public()` com autenticação
 * OPORTUNISTA (CTG-0002 §2.8, A4(b)). Um cidadão com membership só no tenant
 * local, enviando `X-Tenant-Id` de outro tenant (B, sem membership), era
 * recusado pelo guard interno (entitlement) mas o principal já ficara na
 * requisição; o app semeava o tenant B pelo cabeçalho e o controlador lia o
 * principal recusado como cidadão identificado — gravando em B um
 * `portal.subject` com o `cpf_hash` do cidadão de A e a manifestação ligada a
 * ele (`anonymous:false`). Regressão: nunca identificado fora do tenant de
 * membership.
 *
 * Tenant B = o tenant B de `tools/check-rls-smoke.ts`, criado como owner com
 * `on conflict do nothing` e mantido (o `@Audit` grava `audit.events` em B,
 * imutável e com FK para `auth.tenants`). Limpeza só das linhas criadas aqui.
 */
const TENANT_B = '00000000-0000-7000-8000-000000000102';
const citizen = { cpf: CPF.prata, level: 'avancada' as const };

const client = newClient();
let app: INestApplication;

/** Linhas criadas por este arquivo, por tenant, para a limpeza no `afterAll`. */
const created: Array<{
  tenantId: string;
  idempotencyKey: string;
  manifestationId?: string;
}> = [];
const preexistingSubject: Record<string, boolean> = {};

function api() {
  return request(app.getHttpServer());
}

async function asOwnerIn(tenantId: string): Promise<void> {
  await asOwner(client);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
}

async function subjectIdsOf(tenantId: string, hash: string) {
  await asOwnerIn(tenantId);
  return (
    await client.query<{ id: string }>(
      `select id from portal.subject where tenant_id = $1 and cpf_hash = $2`,
      [tenantId, hash],
    )
  ).rows.map((row) => row.id);
}

async function manifestationRow(tenantId: string, id: string) {
  await asOwnerIn(tenantId);
  return (
    await client.query<{
      tenant_id: string;
      anonymous: boolean;
      subject_id: string | null;
    }>(
      `select tenant_id, anonymous, subject_id from portal.manifestation where id = $1`,
      [id],
    )
  ).rows[0];
}

async function manifest(
  tenantId: string,
  body: Record<string, unknown>,
  extra: Record<string, string> = {},
) {
  const requestHeaders = headers({ 'x-tenant-id': tenantId, ...extra });
  const entry: (typeof created)[number] = {
    tenantId,
    idempotencyKey: requestHeaders['idempotency-key']!,
  };
  created.push(entry);
  const response = await api()
    .post('/v1/portal/manifestations')
    .set(requestHeaders)
    .send(body);
  if (typeof response.body?.manifestationId === 'string') {
    entry.manifestationId = response.body.manifestationId as string;
  }
  return response;
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  await client.connect();
  await seedLocalTenant(client);
  await resetLocalPortalRows(client);
  await asOwnerIn(TENANT_B);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, 'sp', 'DETRAN SP')
     on conflict (id) do nothing`,
    [TENANT_B],
  );
  for (const tenantId of [TENANT_ID, TENANT_B]) {
    preexistingSubject[tenantId] =
      (await subjectIdsOf(tenantId, cpfHash(citizen.cpf))).length > 0;
  }
  app = await createPortalApp();
}, 60_000);

afterEach(() => {
  clearCitizenEnv();
});

afterAll(async () => {
  await app?.close();
  const hash = cpfHash(citizen.cpf);
  for (const entry of created) {
    await asOwnerIn(entry.tenantId);
    // chave persistida = `<escopo>:<Idempotency-Key>` (escopo = sujeito ou `public`)
    await client.query(
      `delete from portal.idempotency_record where tenant_id = $1 and key like $2`,
      [entry.tenantId, `%:${entry.idempotencyKey}`],
    );
    if (entry.manifestationId) {
      await client.query(
        `delete from integration.outbox where tenant_id = $1 and aggregate_id = $2`,
        [entry.tenantId, entry.manifestationId],
      );
      await client.query(
        `delete from portal.manifestation where tenant_id = $1 and id = $2`,
        [entry.tenantId, entry.manifestationId],
      );
    }
  }
  for (const tenantId of [TENANT_ID, TENANT_B]) {
    if (preexistingSubject[tenantId]) continue;
    await asOwnerIn(tenantId);
    await client.query(
      `delete from portal.subject where tenant_id = $1 and cpf_hash = $2`,
      [tenantId, hash],
    );
  }
  await client.end();
});

describe('Hotfix — isolamento de tenant na manifestação oportunista (§2.8)', () => {
  it('dado cidadão CIDADAO com membership só no tenant local quando POST manifestations com X-Tenant-Id do tenant B então nunca identificado, nunca 500 e nenhum sujeito do cidadão gravado em B', async () => {
    setCitizen(citizen);
    // pré-condição: a mesma credencial é recusada em B numa rota autenticada
    const me = await api()
      .get('/v1/portal/identity/me')
      .set(headers({ 'x-tenant-id': TENANT_B }));
    expect(me.status, JSON.stringify(me.body)).toBe(403);

    const response = await manifest(
      TENANT_B,
      { kind: 'reclamacao', text: 'cruzamento de tenant (hotfix)' },
      { 'x-tenant-id': TENANT_B },
    );
    expect(response.status, JSON.stringify(response.body)).not.toBe(500);
    expect(response.body?.anonymous, JSON.stringify(response.body)).not.toBe(
      false,
    );
    if (response.status === 201) {
      expect(response.body.anonymous).toBe(true);
      const row = await manifestationRow(
        TENANT_B,
        response.body.manifestationId as string,
      );
      expect(row).toMatchObject({
        tenant_id: TENANT_B,
        anonymous: true,
        subject_id: null,
      });
    }
    if (!preexistingSubject[TENANT_B]) {
      expect(await subjectIdsOf(TENANT_B, cpfHash(citizen.cpf))).toEqual([]);
    }
  });

  it('dado o mesmo cidadão CIDADAO quando POST manifestations no próprio tenant então 201 com anonymous false e sujeito ligado', async () => {
    setCitizen(citizen);
    const response = await manifest(TENANT_ID, {
      kind: 'sugestao',
      text: 'controle positivo (hotfix)',
    });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.anonymous).toBe(false);
    const row = await manifestationRow(
      TENANT_ID,
      response.body.manifestationId as string,
    );
    expect(row?.tenant_id).toBe(TENANT_ID);
    expect(row?.anonymous).toBe(false);
    expect(row?.subject_id).not.toBeNull();
    expect(await subjectIdsOf(TENANT_ID, cpfHash(citizen.cpf))).toContain(
      row?.subject_id,
    );
  });

  it('dado credencial local sem claims de CPF quando POST manifestations no próprio tenant então 201 anônima', async () => {
    clearCitizenEnv();
    const response = await manifest(TENANT_ID, {
      kind: 'elogio',
      text: `sem claims (hotfix) ${randomUUID()}`,
    });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.anonymous).toBe(true);
    const row = await manifestationRow(
      TENANT_ID,
      response.body.manifestationId as string,
    );
    expect(row).toMatchObject({ anonymous: true, subject_id: null });
  });
});
