import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { RaitSessionCommandService } from '@detran/inf-rait-session';
import { RaitWorklistCommandService } from '@detran/inf-rait-worklist';

const { Client } = pg;
const DATABASE_URL =
  'postgresql://aarusso@localhost/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const CASE = '00000000-0000-7000-8000-000010000018';
const SESSION = '00000000-0000-7000-8000-000030009901';
const OPEN_SESSION = '00000000-0000-7000-8000-000030009902';
const OPEN_AGENDA = '00000000-0000-7000-8000-000031009902';
const MINUTES = '00000000-0000-7000-8000-000034009901';
const DOCUMENT = '00000000-0000-7000-8000-000036009901';
const SECRETARY = '00000000-0000-4000-8000-0000b0000005';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const SEEDED_MEMBER = '00000000-0000-7000-8000-000021000011';
const RAPPORTEUR_MEMBER = '00000000-0000-7000-8000-000021000008';
const RAPPORTEUR = '00000000-0000-4000-8000-0000b0000008';
const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const HASH_C = 'c'.repeat(64);

const client = new Client({ connectionString: DATABASE_URL });

const requestContext = (actor: () => string) => ({
  hasActiveContext: () => true,
  snapshot: () => ({ tenantId: TENANT, actorId: actor() }),
});

const database = {
  tx: async <T>(
    work: (tx: { query: typeof client.query }) => Promise<T>,
  ): Promise<T> => work({ query: client.query.bind(client) }),
};

async function rollback<T>(work: () => Promise<T>): Promise<T> {
  await client.query('begin');
  await client.query(`select set_config('app.tenant_id', $1, true)`, [TENANT]);
  try {
    return await work();
  } finally {
    await client.query('rollback');
  }
}

describe('CTG-0002 final structural corrections', () => {
  beforeAll(async () => client.connect());
  afterAll(async () => client.end());

  it('draw origina snapshot, manifesto, assignments e T-CLAIM; accept transiciona o caso e arma T-VOTO com ETag round-trip', async () =>
    rollback(async () => {
      let actor = SECRETARY;
      await client.query(
        `delete from inf.rait_assignment
          where tenant_id = $1 and case_id = $2 and active`,
        [TENANT, CASE],
      );
      await client.query(
        `update inf.rait_case set state = 'DISTRIBUIDO'
          where tenant_id = $1 and id = $2`,
        [TENANT, CASE],
      );
      await client.query(
        `update inf.rait_batch set state = 'LOTE_ABERTO', seed = null,
           drawn_at = null, accepted_at = null, homologated_at = null,
           homologated_by = null, version = 1
          where tenant_id = $1 and id = $2`,
        [TENANT, BATCH],
      );
      await client.query(
        `update inf.rait_batch_item set member_id = null, claim_due_on = null,
           accepted_at = null, declined_at = null, decline_kind = null
          where tenant_id = $1 and batch_id = $2`,
        [TENANT, BATCH],
      );

      const service = new RaitWorklistCommandService(
        database as never,
        requestContext(() => actor) as never,
      );
      Object.defineProperty(service, 'trust', {
        value: {
          prepareBatchMinutesManifest: async (input: {
            batchId: string;
            snapshotHash: string;
          }) => ({
            tenantId: TENANT,
            aggregateId: input.batchId,
            documentId: DOCUMENT,
            contentHash: HASH_A,
            snapshotHash: input.snapshotHash,
            manifestHash: HASH_B,
            documentKind: 'BATCH_DISTRIBUTION_MINUTES',
            manifestVersion: 'draw-v1',
            preparedAt: '2026-09-19T12:00:00.000Z',
          }),
        },
      });

      const drawn = await service.execute({
        command: 'draw',
        targetId: BATCH,
        payload: {},
        headers: { 'Idempotency-Key': 'ctg2-final-draw' },
      });
      expect(drawn.etag).toBe('W/"2"');
      const evidence = await client.query<{
        snapshots: string;
        manifests: string;
        assignments: string;
        claim_due_on: string | null;
        member_id: string;
        person_id: string;
      }>(
        `select
           (select count(*)::text from inf.rait_batch_draw_snapshot where tenant_id = $1 and batch_id = $2) snapshots,
           (select count(*)::text from inf.rait_batch_minutes_manifest where tenant_id = $1 and batch_id = $2) manifests,
           (select count(*)::text from inf.rait_assignment where tenant_id = $1 and batch_id = $2 and active) assignments,
           item.claim_due_on::text, item.member_id, member.person_id
         from inf.rait_batch_item item
         join inf.rait_pool_member member on member.id = item.member_id
        where item.tenant_id = $1 and item.batch_id = $2 and item.case_id = $3`,
        [TENANT, BATCH, CASE],
      );
      expect(evidence.rows[0]).toMatchObject({
        snapshots: '1',
        manifests: '1',
        assignments: '1',
      });
      expect(evidence.rows[0]?.claim_due_on).not.toBeNull();

      actor = evidence.rows[0]!.person_id;
      await client.query(
        `update inf.rait_batch set homologated_at = clock_timestamp(),
           homologated_by = $1 where tenant_id = $2 and id = $3`,
        [CHAIR, TENANT, BATCH],
      );
      const accepted = await service.execute({
        command: 'accept-batch-item',
        targetId: BATCH,
        payload: { caseId: CASE },
        headers: {
          'Idempotency-Key': 'ctg2-final-accept',
          'If-Match': drawn.etag,
        },
      });
      expect(accepted.etag).toBe('W/"3"');
      const transitioned = await client.query<{
        state: string;
        timer: string;
      }>(
        `select item.state,
                (select timer_code from inf.rait_deadline
                  where tenant_id = item.tenant_id and case_id = item.id
                    and timer_code = 'T-VOTO') timer
           from inf.rait_case item where tenant_id = $1 and id = $2`,
        [TENANT, CASE],
      );
      expect(transitioned.rows[0]).toEqual({
        state: 'EM_INSTRUCAO',
        timer: 'T-VOTO',
      });
    }));

  it('impedimento devolve a versão numérica pós-transação do lote', async () =>
    rollback(async () => {
      await client.query(
        `update inf.rait_batch set state = 'LOTE_SORTEADO',
           homologated_at = clock_timestamp(), homologated_by = $1,
           seed = repeat('01',32), drawn_at = clock_timestamp(),
           accepted_at = null, version = 2
          where tenant_id = $2 and id = $3`,
        [CHAIR, TENANT, BATCH],
      );
      await client.query(
        `update inf.rait_batch_item set member_id = $1,
           claim_due_on = current_date + 2, accepted_at = null,
           declined_at = null, decline_kind = null
          where tenant_id = $2 and batch_id = $3 and case_id = $4`,
        [RAPPORTEUR_MEMBER, TENANT, BATCH, CASE],
      );
      const service = new RaitWorklistCommandService(
        database as never,
        requestContext(() => RAPPORTEUR) as never,
      );
      const impeded = await service.execute({
        command: 'declare-batch-item-impediment',
        targetId: BATCH,
        payload: {
          caseId: CASE,
          kind: 'impedimento',
          grounds: 'sensor estrutural CTG-0002',
        },
        headers: {
          'Idempotency-Key': 'ctg2-final-impediment',
          'If-Match': 'W/"2"',
        },
      });
      expect(impeded.etag).toBe('W/"3"');
      const batch = await client.query<{ version: number }>(
        'select version from inf.rait_batch where tenant_id = $1 and id = $2',
        [TENANT, BATCH],
      );
      expect(batch.rows[0]?.version).toBe(3);
    }));

  it('convene-extraordinary e open confrontam e devolvem a versão do agregado em round-trip', async () =>
    rollback(async () => {
      await client.query(
        `insert into inf.rait_session
           (id, tenant_id, judging_body, state, quorum_required,
            chair_member_id, version)
         values ($1,$2,'jari','FORMANDO_PAUTA',1,$3,1)`,
        [OPEN_SESSION, TENANT, SEEDED_MEMBER],
      );
      await client.query(
        `insert into inf.rait_agenda_item
           (id, tenant_id, session_id, case_id, position, priority,
            rapporteur_member_id)
         values ($1,$2,$3,$4,1,true,$5)`,
        [OPEN_AGENDA, TENANT, OPEN_SESSION, CASE, SEEDED_MEMBER],
      );
      await client.query(
        `insert into inf.rait_bench
           (tenant_id, session_id, state, confirmed_count, confirmed_at)
         values ($1,$2,'BANCA_CONFIRMADA',1,clock_timestamp())`,
        [TENANT, OPEN_SESSION],
      );
      await client.query(
        `update inf.rait_pool_member set mandate_starts_on = current_date - 1,
           institutional_valid_from = current_date - 1
          where tenant_id = $1 and id = $2`,
        [TENANT, SEEDED_MEMBER],
      );
      await client.query(
        `insert into inf.rait_attendance
           (tenant_id, session_id, member_id, present, is_chair,
            mandate_starts_on_snapshot, institutional_valid_from)
         values ($1,$2,$3,true,true,current_date - 1,current_date - 1)`,
        [TENANT, OPEN_SESSION, SEEDED_MEMBER],
      );

      const service = new RaitSessionCommandService(
        database as never,
        requestContext(() => CHAIR) as never,
      );
      const convened = await service.execute({
        command: 'convene-extraordinary',
        targetId: OPEN_SESSION,
        payload: {},
        headers: {
          'Idempotency-Key': 'ctg2-final-convene',
          'If-Match': 'W/"1"',
        },
      });
      expect(convened.etag).toBe('W/"2"');
      const attendance = await client.query<{
        present: boolean;
        is_chair: boolean;
        mandate_current: boolean;
        institution_current: boolean;
      }>(
        `select present, is_chair,
                mandate_starts_on_snapshot <= current_date and
                  (mandate_ends_on_snapshot is null or mandate_ends_on_snapshot >= current_date)
                  as mandate_current,
                institutional_valid_from <= current_date and
                  (institutional_valid_to is null or institutional_valid_to >= current_date)
                  as institution_current
           from inf.rait_attendance
          where tenant_id = $1 and session_id = $2 and member_id = $3`,
        [TENANT, OPEN_SESSION, SEEDED_MEMBER],
      );
      expect(attendance.rows[0]).toEqual({
        present: true,
        is_chair: true,
        mandate_current: true,
        institution_current: true,
      });
      const opened = await service.execute({
        command: 'open',
        targetId: OPEN_SESSION,
        payload: {},
        headers: {
          'Idempotency-Key': 'ctg2-final-open',
          'If-Match': convened.etag,
        },
      });
      expect(opened.etag).toBe('W/"3"');
    }));

  it('sign e publish avançam somente metadados da ata, preservam conteúdo imutável e usam ETag round-trip', async () =>
    rollback(async () => {
      await client.query(
        `insert into inf.rait_session
           (id, tenant_id, judging_body, state, quorum_required, quorum_observed)
         values ($1,$2,'jari','ATA_LAVRADA',1,1)`,
        [SESSION, TENANT],
      );
      await client.query(
        `insert into inf.rait_minutes
           (id, tenant_id, session_id, content, document_hash)
         values ($1,$2,$3,'{"source":"server"}'::jsonb,$4)`,
        [MINUTES, TENANT, SESSION, HASH_C],
      );
      await client.query(
        `insert into inf.rait_session_minutes_snapshot
           (tenant_id, session_id, snapshot_version, snapshot, snapshot_hash,
            origin, captured_at)
         values ($1,$2,'session-minutes-v1','{}'::jsonb,$3,
                 'server_session_records',clock_timestamp())`,
        [TENANT, SESSION, HASH_A],
      );
      await client.query(
        `insert into inf.rait_session_minutes_manifest
           (tenant_id, session_id, minutes_id, document_id, content_hash,
            snapshot_hash, manifest_hash, document_kind, manifest_version,
            prepared_at)
         values ($1,$2,$3,$4,$5,$6,$7,'SESSION_MINUTES',
                 'session-minutes-v1',clock_timestamp())`,
        [TENANT, SESSION, MINUTES, DOCUMENT, HASH_B, HASH_A, HASH_C],
      );
      await client.query(
        `insert into inf.rait_minutes_required_signer
           (tenant_id, minutes_id, person_id, signer_role, signer_basis,
            derived_at)
         values ($1,$2,$3,'presidente','effective_chair',clock_timestamp())`,
        [TENANT, MINUTES, CHAIR],
      );

      const service = new RaitSessionCommandService(
        database as never,
        requestContext(() => CHAIR) as never,
      );
      Object.defineProperty(service, 'trust', {
        value: {
          verifySessionMinutesEvidence: async () => ({
            tenantId: TENANT,
            sessionId: SESSION,
            minutesId: MINUTES,
            signatureRef: 'sig:ctg2-final',
            documentId: DOCUMENT,
            contentHash: HASH_B,
            snapshotHash: HASH_A,
            documentKind: 'SESSION_MINUTES',
            signerPersonId: CHAIR,
            padesLevel: 'PAdES-B-LT',
            tsaAt: '2026-09-19T12:00:00.000Z',
            tsaValidationStatus: 'GOOD',
            certificateValidationSource: 'OCSP',
            certificateValidationStatus: 'GOOD',
            certificateValidatedAt: '2026-09-19T12:00:00.000Z',
          }),
        },
      });

      const signed = await service.execute({
        command: 'sign-minutes',
        targetId: MINUTES,
        payload: { signature_ref: 'sig:ctg2-final' },
        headers: {
          'Idempotency-Key': 'ctg2-final-sign',
          'If-Match': 'W/"1"',
        },
      });
      expect(signed.etag).toBe('W/"2"');
      const published = await service.execute({
        command: 'publish',
        targetId: MINUTES,
        payload: {},
        headers: {
          'Idempotency-Key': 'ctg2-final-publish',
          'If-Match': signed.etag,
        },
      });
      expect(published.etag).toBe('W/"3"');

      const result = await client.query<{
        content: Record<string, unknown>;
        signed: boolean;
        published: boolean;
      }>(
        `select content, signed_at is not null signed,
                published_at is not null published
           from inf.rait_minutes where tenant_id = $1 and id = $2`,
        [TENANT, MINUTES],
      );
      expect(result.rows[0]).toEqual({
        content: { source: 'server' },
        signed: true,
        published: true,
      });
      await expect(
        client.query(
          `update inf.rait_minutes set content = '{"tampered":true}'::jsonb
            where tenant_id = $1 and id = $2`,
          [TENANT, MINUTES],
        ),
      ).rejects.toMatchObject({ code: '42501' });
    }));
});
