import { createHash } from 'node:crypto';
import type pg from 'pg';

import {
  AITS,
  CPF,
  EXTERNAL,
  LOCAL,
  SNE_EFFECTS,
  TENANT_ID,
  asOwner,
  cpfHash,
} from './portal-e2e.support.js';

export const JOURNEY_SNE_ID = '00000000-0000-7000-8000-000070e000e1';
export const JOURNEY_READ_REQUEST_ID = '00000000-0000-7000-8000-000070400e09';

/** M17: JSON recursive, ordered, UTF-8, no spaces and omitting undefined. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function idempotencyKey(
  action: string,
  target: string,
  body: unknown,
): string {
  return `${action}:${target}:${createHash('sha256')
    .update(canonicalJson(body), 'utf8')
    .digest('hex')}`;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('resposta não é um objeto');
  }
  return value as Record<string, unknown>;
}

export function bodyText(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Fixture local única de CTG-0004.  A ordem é deliberada: os sujeitos já
 * existem por `subjectIdOf`, depois os vínculos e as projeções são inseridos
 * como owner.  Não há porta falsa nem dado nacional nesta rotina.
 */
export async function seedJourneyFixtures(
  client: pg.Client,
  subjects: Record<'bronze' | 'prata' | 'ouro', string>,
): Promise<void> {
  await asOwner(client);
  const nil = '00000000-0000-0000-0000-000000000000';
  const infractions: Array<[number, string, string, string, string]> = [
    [1, AITS.f1, CPF.bronze, 'FIX-0000001', 'em_recurso'],
    [2, AITS.f2, CPF.prata, 'FIX-0000002', 'aguardando_defesa'],
    [3, AITS.f3, CPF.prata, 'FIX-0000003', 'aguardando_defesa'],
    [5, AITS.f5, CPF.prata, 'FIX-0000005', 'aguardando_defesa'],
    [10, AITS.f10, CPF.prata, 'FIX-0000010', 'aguardando_defesa'],
  ];
  for (const [nn, aitId, cpf, number, situation] of infractions) {
    await client.query(
      `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
       values ($1, $2, $3, $4, $5, $6, '2026-05-01T12:00:00-04:00', 'fixture', 195.23, $7, '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, $8, 0)`,
      [
        nn === 10
          ? '00000000-0000-7000-8000-000070f000f0'
          : LOCAL.infractionView(nn),
        TENANT_ID,
        aitId,
        cpfHash(cpf),
        number,
        `FIX${nn}`,
        situation,
        nil,
      ],
    );
  }
  await client.query(
    `insert into portal.manifestation (id, tenant_id, state, kind, confidential, anonymous, subject_id, text, protocol, received_at, agency_due_on, decided_at, decision_text, version)
     values ($1, $2, 'AVALIACAO_OFERECIDA', 'reclamacao', false, false, $3, 'fixture', 'LOCAL-E2E-2026-9000003', '2026-07-10T12:00:00-04:00', '2026-08-09', '2026-08-01T12:00:00-04:00', 'fixture', 1)`,
    [LOCAL.manifestationOferecida, TENANT_ID, subjects.prata],
  );
  await client.query(
    `insert into portal.request (id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel, delegation_status, minimum_assurance, version)
     values ($1, $2, 'AVALIACAO_OFERECIDA', 'consulta_multas', $3, 'ait', $4, 'portal', 'not_applicable', 'simples', 4)`,
    [JOURNEY_READ_REQUEST_ID, TENANT_ID, subjects.prata, AITS.f2],
  );
  await client.query(
    `insert into portal.process_timeline (id, tenant_id, request_id, case_id, entries_json, deadlines_json, decision_json, last_event_id)
     values ('00000000-0000-7000-8000-000071d000e1', $1, $2, '00000000-0000-7000-8000-000071d00001', '[]'::jsonb, '[]'::jsonb, '{"result":"fixture"}'::jsonb, $3)`,
    [TENANT_ID, JOURNEY_READ_REQUEST_ID, nil],
  );
  await client.query(
    `insert into portal.inbox_item (id, tenant_id, subject_id, kind, action_required, source, source_event_id, subject_line, summary, ait_id, request_id, available_on, read_on, fictitious_acknowledgement_on, deadline_due_on, deadline_owned_by)
     values ($1, $2, $3, 'SNE', true, 'sne', $4, 'Notificação SNE', 'fixture', $5, null, '2026-09-01', null, '2026-10-01', '2026-10-01', 'citizen')`,
    [LOCAL.inboxSne, TENANT_ID, subjects.prata, LOCAL.sourceEvent(1), AITS.f2],
  );
  await client.query(
    `insert into portal.sne_enrollment (id, tenant_id, subject_id, state, channel, email, consent_text_version, effects_ack, since)
     values ($1, $2, $3, 'ADERIDO_SNE', 'sne', 'prata@fixture.invalid', '1', $4::jsonb, '2026-01-01T00:00:00Z')`,
    [JOURNEY_SNE_ID, TENANT_ID, subjects.prata, JSON.stringify(SNE_EFFECTS)],
  );
  await client.query(
    `insert into portal.crash_view (id, tenant_id, crash_id, subject_cpf_hash, state_label, summary_json, third_party_fields_suppressed, last_event_id)
     values ($1, $2, $3, $4, 'fixture', '{}'::jsonb, true, $5)`,
    [LOCAL.crashView, TENANT_ID, EXTERNAL.crash, cpfHash(CPF.prata), nil],
  );
  await client.query(
    `insert into portal.exam_view (id, tenant_id, exam_id, subject_cpf_hash, legal_label, valid_until, board_due_on, last_event_id)
     values ($1, $2, $3, $4, 'fixture', '2027-01-01', null, $5)`,
    [LOCAL.examView, TENANT_ID, EXTERNAL.exam, cpfHash(CPF.ouro), nil],
  );
  const entitlements: Array<[number, keyof typeof subjects, string, string]> = [
    [1, 'bronze', 'ait', AITS.f1],
    [2, 'prata', 'ait', AITS.f2],
    [3, 'prata', 'ait', AITS.f3],
    [4, 'prata', 'ait', AITS.f5],
    [5, 'prata', 'ait', AITS.f10],
    [6, 'prata', 'crash', EXTERNAL.crash],
    [7, 'ouro', 'exam', EXTERNAL.exam],
    [8, 'prata', 'vehicle', EXTERNAL.vehicle],
  ];
  for (const [nn, subject, kind, target] of entitlements) {
    await client.query(
      `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
       values ($1, $2, $3, $4, $5, 'owner', 'manual', '2026-01-01', null)`,
      [LOCAL.entitlement(nn), TENANT_ID, subjects[subject], kind, target],
    );
  }
}
