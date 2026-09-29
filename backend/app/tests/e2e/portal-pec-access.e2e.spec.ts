// R-0032 TASK-0003 — baseline snapshot followed by contractual RED examples.
// O3/O4 must add the PEC producer, holder entitlement and dossier port.
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import {
  CPF,
  EXTERNAL,
  asOwner,
  clearCitizenEnv,
  createPortalApp,
  headers,
  newClient,
  resetLocalPortalRows,
  seedLocalTenant,
  setCitizen,
  subjectIdOf,
} from './portal-e2e.support.js';

describe('R-0032 TASK-0003 — matriz de acesso PEC do Portal', () => {
  let app: INestApplication;
  const client = newClient();

  beforeAll(async () => {
    await client.connect();
    await seedLocalTenant(client);
    app = await createPortalApp();
  });

  afterAll(async () => {
    clearCitizenEnv();
    await resetLocalPortalRows(client);
    await app?.close();
    await client.end();
  });

  it('dado matriz atual CIDADAO e rota /v1/portal/exams quando sem entitlement então lista 200 e item 404', async () => {
    setCitizen({ cpf: CPF.ouro, level: 'simples' });
    await subjectIdOf(app, { cpf: CPF.ouro, level: 'simples' });
    const list = await request(app.getHttpServer())
      .get('/v1/portal/exams')
      .set(headers());
    const one = await request(app.getHttpServer())
      .get(`/v1/portal/exams/${EXTERNAL.exam}`)
      .set(headers());
    expect(list.status).toBe(200);
    expect(list.body).toEqual({ items: [] });
    expect(one.status).toBe(404);
  });

  it('dado principal sem CIDADAO ou technical-admin com * quando lê exames então 403', async () => {
    setCitizen({ cpf: CPF.ouro, level: 'avancada', roles: 'SUPORTE' });
    const support = await request(app.getHttpServer())
      .get('/v1/portal/exams')
      .set(headers());
    setCitizen({ cpf: CPF.ouro, level: 'avancada', roles: 'technical-admin' });
    const admin = await request(app.getHttpServer())
      .get('/v1/portal/exams')
      .set(headers());
    expect(support.status).toBe(403);
    expect(admin.status).toBe(403);
  });

  it('dado terceiro, outro tenant, assurance insuficiente ou sessão sem CIDADAO quando consulta o dossiê então 404 ou 403 canônicos sem confirmar o exame', async () => {
    const dossier = `/v1/portal/exams/${EXTERNAL.exam}/dossier`;
    setCitizen({ cpf: CPF.prata, level: 'avancada' });
    const thirdParty = await request(app.getHttpServer())
      .get(dossier)
      .set(headers());
    const otherTenant = await request(app.getHttpServer())
      .get(dossier)
      .set(headers({ 'x-tenant-id': '00000000-0000-7000-8000-000000000099' }));
    setCitizen({ cpf: CPF.ouro, level: 'simples' });
    const insufficientAssurance = await request(app.getHttpServer())
      .get(dossier)
      .set(headers());
    setCitizen({ cpf: CPF.ouro, level: 'avancada', roles: 'SUPORTE' });
    const noCitizen = await request(app.getHttpServer())
      .get(dossier)
      .set(headers());

    expect(thirdParty).toMatchObject({
      status: 404,
      body: { code: 'PORTAL.NOT_FOUND' },
    });
    expect(otherTenant).toMatchObject({
      status: 404,
      body: { code: 'PORTAL.NOT_FOUND' },
    });
    expect(insufficientAssurance).toMatchObject({
      status: 403,
      body: { code: 'PORTAL.ASSURANCE_INSUFFICIENT' },
    });
    expect(noCitizen).toMatchObject({
      status: 403,
      body: { code: 'PORTAL.IDENTITY_NOT_CITIZEN' },
    });
  });

  it('dado vínculo legado owner/renach quando consulta dossiê PEC então não o trata como holder', async () => {
    await asOwner(client);
    setCitizen({ cpf: CPF.ouro, level: 'avancada' });
    const subjectId = await subjectIdOf(app, {
      cpf: CPF.ouro,
      level: 'avancada',
    });
    await client.query(
      `insert into portal.entitlement (tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from)
       values ('00000000-0000-7000-8000-000000000001', $1, 'exam', $2, 'owner', 'renach', '2026-01-01')`,
      [subjectId, EXTERNAL.exam],
    );
    const response = await request(app.getHttpServer())
      .get(`/v1/portal/exams/${EXTERNAL.exam}/dossier`)
      .set(headers());
    expect(response.status).toBe(404);
  });

  it.todo(
    'O3/O4 + OD-R32-002/005: titular com holder/pec-event vigente acessa dossiê sem máscara, sem estado interno e com auditorias PORTAL_PEC_DOSSIER_READ e CH_CANDIDATE_DOSSIER_READ',
  );
  it.todo(
    'O3/O4: holder/pec-event vencido ou revogado recebe 404 sem revelar o exame; DDL atual só admite owner/renach',
  );
  it.todo(
    'O3/O4 + OD-R32-005: SUPORTE conserva fluxo próprio mascarado e não usa a porta cidadã sem máscara',
  );

  it('dado consultas PEC quando inspeciona portal.* então não persiste conteúdo clínico', async () => {
    await asOwner(client);
    const clinicalColumns = await client.query<{ table_name: string }>(
      `select table_name
         from information_schema.columns
        where table_schema = 'portal'
          and column_name in ('diagnosis', 'instrument', 'technical_notes', 'report_content')`,
    );
    expect(clinicalColumns.rows).toEqual([]);
  });
});
