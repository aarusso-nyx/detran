// R-0022 CTG-0008 §4 — caracterização da fila e do ACK RENACH sobre SQL real
// (arquivo fixo I, A2.1). Regras do contrato:
// - operação sob teste e asserção passam por porta DETRAN
//   (`PecRenachTransmissionService`, `SqlTeatEventOutbox`) em transação
//   `role_app_backend` com o tenant do contexto (padrão `database.tx` /
//   `asTenant` de `r21-renach-characterization.integration.spec.ts`);
// - owner só cria e remove tenants/atores; nunca grava na outbox. Os itens de
//   fila RENACH entram pelo escritor DETRAN `SqlTeatEventOutbox.append`
//   (CTG-0008 §1 #2) com o tópico `ch.renach.exam-result`; sem `reportId`
//   no payload, o despacho falha antes do provedor, o que basta para as
//   propriedades de fila, ACK e isolamento aqui caracterizadas;
// - nenhuma asserção lê `integration.*` diretamente: o resultado observado é
//   o de `dispatchDue`/`recordAcknowledgement`, o do leitor real do log
//   (`TeatStreamService`, §1 #13) e o de `PecToxicologyInboundService`,
//   válidos nas duas fases.
import { createHash, randomUUID } from 'node:crypto';
import { HttpException } from '@nestjs/common';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  ReportLifecycleService,
  ReportRepository,
} from '@detran/ch-clinical-reports';
import { BoatCrashCommandsService } from '@detran/est-crash';
import { teatEventSink } from '@detran/ops-core';
import {
  SqlTeatEventOutbox,
  outboxIdempotencyKey,
  type TeatEventEnvelope,
} from '@detran/shared';

import {
  PecRenachTransmissionService,
  type DispatchResult,
  type RenachAcknowledgementInput,
} from '../../src/pec-renach-transmission.service.js';
import { BoatRenaestTransmissionService } from '../../src/boat-renaest-transmission.service.js';
import { PecToxicologyInboundService } from '../../src/pec-toxicology-inbound.service.js';
import { TeatIntegrationsService } from '../../src/teat-integrations.service.js';
import {
  TeatStreamService,
  type OutboxRow,
  type StreamCursor,
} from '../../src/teat-stream.service.js';

const { Client } = pg;
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
const RENACH_TOPIC = 'ch.renach.exam-result';
// Relógio fixo: `occurredAt` vira `available_at`; precisa estar no passado.
const OCCURRED_AT = '2026-09-01T12:00:00.000Z';

interface Tenant {
  tenantId: string;
  actorId: string;
  clients: pg.Client[];
}

const owner = new Client({ connectionString });
const tenantA: Tenant = {
  tenantId: randomUUID(),
  actorId: randomUUID(),
  clients: [new Client({ connectionString }), new Client({ connectionString })],
};
const tenantB: Tenant = {
  tenantId: randomUUID(),
  actorId: randomUUID(),
  clients: [new Client({ connectionString })],
};
const tenants = [tenantA, tenantB];
// Tenants descartáveis por grupo de casos: a fila é por tenant e o despacho
// reclama tudo o que estiver elegível no tenant do contexto.
const scratch: Tenant[] = [];

async function asTenant<T>(
  client: pg.Client,
  tenant: Tenant,
  work: () => Promise<T>,
): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query("select set_config('app.tenant_id', $1, true)", [
      tenant.tenantId,
    ]);
    await client.query("select set_config('app.actor_id', $1, true)", [
      tenant.actorId,
    ]);
    const result = await work();
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

function sqlTransaction(client: pg.Client) {
  return {
    query: (sql: string, values?: readonly unknown[]) =>
      client.query(sql, values ? [...values] : undefined),
  };
}

function renachPort() {
  return {
    submitMedicalExam: vi.fn(),
    submitPsychologicalEvaluation: vi.fn(),
  };
}

function tenantDatabase(tenant: Tenant, client: pg.Client) {
  return {
    tx: <T>(work: (tx: unknown) => Promise<T>) =>
      asTenant(client, tenant, () => work(sqlTransaction(client))),
  };
}

function tenantContext(tenant: Tenant) {
  return {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: tenant.tenantId,
      actorId: tenant.actorId,
      requestId: `r22-outbox-${randomUUID()}`,
    }),
  };
}

function transmissions(
  tenant: Tenant,
  client: pg.Client,
  port = renachPort(),
): PecRenachTransmissionService {
  return new PecRenachTransmissionService(
    tenantDatabase(tenant, client) as never,
    tenantContext(tenant) as never,
    port as never,
  );
}

/** Lista e saúde da fila de operador (§1 #10). */
function integrations(tenant: Tenant): TeatIntegrationsService {
  return new TeatIntegrationsService(
    tenantDatabase(tenant, tenant.clients[0] as pg.Client) as never,
    tenantContext(tenant) as never,
  );
}

/** Leitor real do log consumido pelo SSE TEAT (§1 #13). */
function reader(tenant: Tenant): TeatStreamService {
  return new TeatStreamService(
    tenantDatabase(tenant, tenant.clients[0] as pg.Client) as never,
    tenantContext(tenant) as never,
  );
}

async function readAll(tenant: Tenant, since: string): Promise<OutboxRow[]> {
  return reader(tenant).listSince({ createdAt: since, id: null });
}

function logEnvelope(
  tenant: Tenant,
  overrides: Partial<TeatEventEnvelope> = {},
): TeatEventEnvelope {
  // Tokens canônicos citados no contrato da porta (`outbox.ts`).
  return queueEnvelope(tenant, {
    type: 'ait.changed',
    domainEvent: 'AIT_FINALIZADO',
    aggregate: { kind: 'ait', id: randomUUID(), version: 1 },
    ...overrides,
  });
}

function queueEnvelope(
  tenant: Tenant,
  overrides: Partial<TeatEventEnvelope> = {},
): TeatEventEnvelope {
  return {
    id: '',
    type: RENACH_TOPIC,
    // Rótulo de fixture, não token canônico: o despacho RENACH não o lê.
    domainEvent: 'FIXTURE_R22_OUTBOX',
    version: 1,
    occurredAt: OCCURRED_AT,
    tenantId: tenant.tenantId,
    actor: { kind: 'system', id: tenant.actorId },
    correlationId: randomUUID(),
    aggregate: { kind: 'ch.report', id: randomUUID(), version: 1 },
    data: {},
    ...overrides,
  };
}

async function append(
  tenant: Tenant,
  envelope: TeatEventEnvelope,
): Promise<string> {
  const client = tenant.clients[0] as pg.Client;
  const { id } = await asTenant(client, tenant, () =>
    new SqlTeatEventOutbox().append(sqlTransaction(client) as never, envelope),
  );
  expect(id).toMatch(/^[0-9a-f-]{36}$/u);
  return id;
}

async function enqueue(
  tenant: Tenant,
  count: number,
): Promise<Array<{ id: string; key: string }>> {
  const items: Array<{ id: string; key: string }> = [];
  for (let index = 0; index < count; index += 1) {
    const envelope = queueEnvelope(tenant);
    items.push({
      id: await append(tenant, envelope),
      key: outboxIdempotencyKey(envelope),
    });
  }
  return items;
}

async function newTenant(label: string, clientCount = 1): Promise<Tenant> {
  const tenant: Tenant = {
    tenantId: randomUUID(),
    actorId: randomUUID(),
    clients: Array.from(
      { length: clientCount },
      () => new Client({ connectionString }),
    ),
  };
  await Promise.all(tenant.clients.map((client) => client.connect()));
  await createTenant(tenant, label);
  scratch.push(tenant);
  return tenant;
}

async function createTenant(tenant: Tenant, label: string): Promise<void> {
  await owner.query(
    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
    [tenant.tenantId, `r22-outbox-${label}-${tenant.tenantId}`, `R22 ${label}`],
  );
  await owner.query(
    "insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'R22 outbox actor')",
    [tenant.actorId, tenant.tenantId, `${tenant.actorId}@detran.invalid`],
  );
}

function ack(
  service: PecRenachTransmissionService,
  eventId: string,
  input: RenachAcknowledgementInput,
  rawBody: Buffer = Buffer.from(JSON.stringify(input)),
) {
  // `recordAcknowledgement` valida de forma síncrona hoje; o encadeamento
  // torna a observação indiferente a síncrono/assíncrono.
  return Promise.resolve().then(() =>
    service.recordAcknowledgement(eventId, rawBody, input),
  );
}

async function expectHttpStatus(
  outcome: Promise<unknown>,
  status: number,
): Promise<void> {
  const error = await outcome.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(HttpException);
  expect((error as HttpException).getStatus()).toBe(status);
}

function ids(results: DispatchResult[]): string[] {
  return results.map((result) => result.outboxId);
}

beforeAll(async () => {
  if (!connectionString)
    throw new Error('DETRAN_TEST_DATABASE_URL is required');
  await owner.connect();
  await Promise.all(
    tenants.flatMap((tenant) =>
      tenant.clients.map((client) => client.connect()),
    ),
  );
  await owner.query("select set_config('app.role', 'owner', false)");
  await createTenant(tenantA, 'a');
  await createTenant(tenantB, 'b');
});

afterAll(async () => {
  const all = [...tenants, ...scratch];
  try {
    // Remoção só do que foi criado aqui. `ch`/`est`/`ops` não têm FK para
    // `auth.tenants`: saem explicitamente, filhos antes dos pais; as linhas
    // de integração saem pela FK `ON DELETE CASCADE` de `auth.tenants`.
    const tenantIds = all.map((tenant) => tenant.tenantId);
    for (const table of [
      'ch.registration_block_notice',
      'ch.report_addendum_approval',
      'ch.report_addendum',
      'ch.report',
      'ch.biometric_check',
      'ch.biometric_station',
      'ch.medical_exam',
      'ch.encounter',
      'ch.appointment',
      'ch.toxicology_suspension',
      'ch.periodic_toxicology_result',
      'ch.patient',
      'ch.professional',
      'ch.clinic',
      'est.crash_renaest_submission',
      'est.crash_record',
      'ops.parameter',
    ])
      await owner.query(
        `delete from ${table} where tenant_id = any($1::uuid[])`,
        [tenantIds],
      );
    await owner.query('delete from auth.users where id = any($1::uuid[])', [
      [
        ...all.map((tenant) => tenant.actorId),
        ...extraUsers.map((user) => user.id),
      ],
    ]);
    await owner.query('delete from auth.tenants where id = any($1::uuid[])', [
      all.map((tenant) => tenant.tenantId),
    ]);
  } finally {
    await Promise.all([
      owner.end(),
      ...all.flatMap((tenant) => tenant.clients.map((client) => client.end())),
    ]);
  }
});

describe('R-0022 CTG-0008 fila e ACK RENACH', () => {
  it('C-08-02 AC-PEC-009-5 dado 26 itens RENACH devidos quando o despacho roda com limite 500 e NaN então cada execução reclama no máximo 25', async () => {
    const tenant = await newTenant('limit');
    const port = renachPort();
    const service = transmissions(tenant, tenant.clients[0] as pg.Client, port);
    const items = await enqueue(tenant, 26);

    const first = await service.dispatchDue(Number.NaN);
    expect(first).toHaveLength(25);
    const second = await service.dispatchDue(500);
    expect(second).toHaveLength(1);
    expect(new Set([...ids(first), ...ids(second)])).toEqual(
      new Set(items.map((item) => item.id)),
    );
    await expect(service.dispatchDue(500)).resolves.toEqual([]);
    expect(port.submitMedicalExam).not.toHaveBeenCalled();
    expect(port.submitPsychologicalEvaluation).not.toHaveBeenCalled();
  });

  it('C-08-02 AC-PEC-009-5 dado itens RENACH devidos quando duas execuções concorrentes despacham no mesmo tenant então cada item é reclamado uma única vez', async () => {
    const tenant = await newTenant('concurrent', 2);
    const items = await enqueue(tenant, 30);
    const [left, right] = tenant.clients as [pg.Client, pg.Client];

    const [fromLeft, fromRight] = await Promise.all([
      transmissions(tenant, left).dispatchDue(25),
      transmissions(tenant, right).dispatchDue(25),
    ]);

    const claimed = [...ids(fromLeft), ...ids(fromRight)];
    expect(fromLeft.length).toBeLessThanOrEqual(25);
    expect(fromRight.length).toBeLessThanOrEqual(25);
    expect(claimed).toHaveLength(new Set(claimed).size);
    expect(new Set(claimed)).toEqual(new Set(items.map((item) => item.id)));
    await expect(transmissions(tenant, left).dispatchDue(25)).resolves.toEqual(
      [],
    );
  });

  it('C-08-05 AC-PEC-009-3 dado item RENACH pendente quando ACK ACKED chega e o mesmo evento é reenviado então resolve uma vez e o replay é duplicate sem novo efeito', async () => {
    const tenant = await newTenant('ack-once');
    const service = transmissions(tenant, tenant.clients[0] as pg.Client);
    const [item] = await enqueue(tenant, 1);
    const eventId = `r22-ack-${randomUUID()}`;
    const input: RenachAcknowledgementInput = {
      idempotencyKey: item!.key,
      status: 'ACKED',
      providerProtocol: 'R22-PROTOCOL-1',
    };

    await expect(ack(service, eventId, input)).resolves.toEqual({
      eventId,
      outboxId: item!.id,
      status: 'acked',
      duplicate: false,
    });
    await expect(ack(service, eventId, input)).resolves.toEqual({
      eventId,
      outboxId: item!.id,
      status: 'acked',
      duplicate: true,
    });
    await expect(service.dispatchDue(25)).resolves.toEqual([]);
  });

  it('C-08-05 dado ACK ERROR sem mensagem ou status inválido quando recebido então responde 400 sem persistir o recibo', async () => {
    const tenant = await newTenant('ack-invalid');
    const service = transmissions(tenant, tenant.clients[0] as pg.Client);
    const [item] = await enqueue(tenant, 1);
    const eventId = `r22-ack-${randomUUID()}`;

    await expectHttpStatus(
      ack(service, eventId, { idempotencyKey: item!.key, status: 'ERROR' }),
      400,
    );
    await expectHttpStatus(
      ack(service, eventId, {
        idempotencyKey: item!.key,
        status: 'UNKNOWN' as 'ACKED',
      }),
      400,
    );
    // Nenhum recibo ficou: o mesmo event_id com outro corpo é aceito como
    // primeira entrega (sem 409 de identidade reutilizada).
    await expect(
      ack(service, eventId, { idempotencyKey: item!.key, status: 'ACKED' }),
    ).resolves.toMatchObject({
      outboxId: item!.id,
      status: 'acked',
      duplicate: false,
    });
  });

  it('C-08-05 dado item RENACH já acked quando chega ACK ERROR com mensagem então o estado confirmado não regride', async () => {
    const tenant = await newTenant('ack-no-regress');
    const service = transmissions(tenant, tenant.clients[0] as pg.Client);
    const [item] = await enqueue(tenant, 1);

    await expect(
      ack(service, `r22-ack-${randomUUID()}`, {
        idempotencyKey: item!.key,
        status: 'ACKED',
      }),
    ).resolves.toMatchObject({ status: 'acked', duplicate: false });
    await expect(
      ack(service, `r22-ack-${randomUUID()}`, {
        idempotencyKey: item!.key,
        status: 'ERROR',
        message: 'late provider error',
      }),
    ).resolves.toMatchObject({
      outboxId: item!.id,
      status: 'acked',
      duplicate: false,
    });
    await expect(service.dispatchDue(25)).resolves.toEqual([]);
  });

  it('C-08-05 dado ACK ERROR com mensagem e depois event_id reutilizado com corpo divergente então erro visível com retry de 15 min, 409 e nenhum efeito no item', async () => {
    const tenant = await newTenant('ack-conflict');
    const service = transmissions(tenant, tenant.clients[0] as pg.Client);
    const [item] = await enqueue(tenant, 1);
    const eventId = `r22-ack-${randomUUID()}`;

    const before = await reader(tenant).now();
    await expect(
      ack(service, eventId, {
        idempotencyKey: item!.key,
        status: 'ERROR',
        message: 'provider refused fixture',
        providerCode: 'R22-REFUSED',
      }),
    ).resolves.toMatchObject({ status: 'error', duplicate: false });
    const after = await reader(tenant).now();
    // ERROR com mensagem: erro visível e retry de 15 min; não é reclamado já.
    const { items } = await integrations(tenant).list({});
    const errored = items.find((candidate) => candidate.id === item!.id)!;
    expect(errored).toMatchObject({
      status: 'error',
      last_error: 'provider refused fixture',
    });
    await expectRetryWindow(errored.available_at, before, after);
    await expect(service.dispatchDue(25)).resolves.toEqual([]);

    await expectHttpStatus(
      ack(service, eventId, { idempotencyKey: item!.key, status: 'ACKED' }),
      409,
    );
    // Se o corpo conflitante tivesse sido aplicado, o item estaria acked e um
    // ERROR posterior não regrediria (caso anterior); segue em erro.
    await expect(
      ack(service, `r22-ack-${randomUUID()}`, {
        idempotencyKey: item!.key,
        status: 'ERROR',
        message: 'second provider refusal',
      }),
    ).resolves.toMatchObject({ outboxId: item!.id, status: 'error' });
  });

  it('C-08-06 dado itens RENACH dos tenants A e B quando A lista, despacha e confirma com a chave de B então não alcança B e B segue intacto', async () => {
    const [itemA] = await enqueue(tenantA, 1);
    const [itemB] = await enqueue(tenantB, 1);
    const underA = transmissions(tenantA, tenantA.clients[0] as pg.Client);
    const underB = transmissions(tenantB, tenantB.clients[0] as pg.Client);

    const listedByA = (await integrations(tenantA).list({})).items.map(
      (item) => item.id,
    );
    expect(listedByA).toContain(itemA!.id);
    expect(listedByA).not.toContain(itemB!.id);

    const dispatchedByA = await underA.dispatchDue(25);
    expect(ids(dispatchedByA)).toContain(itemA!.id);
    expect(ids(dispatchedByA)).not.toContain(itemB!.id);

    await expectHttpStatus(
      ack(underA, `r22-ack-${randomUUID()}`, {
        idempotencyKey: itemB!.key,
        status: 'ACKED',
      }),
      400,
    );

    const dispatchedByB = await underB.dispatchDue(25);
    expect(ids(dispatchedByB)).toContain(itemB!.id);
    expect(ids(dispatchedByB)).not.toContain(itemA!.id);
  });

  it('C-08-11 dado append sob A com tenantId de B no envelope quando persistido então o item pertence a A e B não o alcança', async () => {
    const id = await append(
      tenantA,
      queueEnvelope(tenantA, { tenantId: tenantB.tenantId }),
    );

    const dispatchedByB = await transmissions(
      tenantB,
      tenantB.clients[0] as pg.Client,
    ).dispatchDue(25);
    expect(ids(dispatchedByB)).not.toContain(id);

    const dispatchedByA = await transmissions(
      tenantA,
      tenantA.clients[0] as pg.Client,
    ).dispatchDue(25);
    expect(ids(dispatchedByA)).toContain(id);
  });

  it('C-08-12 dado evento de tópico não despachável no log quando o despacho RENACH roda então só consome ch.renach.exam-result e não chama o provedor', async () => {
    const tenant = await newTenant('topics');
    const port = renachPort();
    const aitEvent = await append(
      tenant,
      queueEnvelope(tenant, {
        type: 'ait.changed',
        domainEvent: 'AIT_FINALIZADO',
        aggregate: { kind: 'ait', id: randomUUID(), version: 1 },
      }),
    );
    const [renachItem] = await enqueue(tenant, 1);

    const dispatched = await transmissions(
      tenant,
      tenant.clients[0] as pg.Client,
      port,
    ).dispatchDue(25);

    expect(ids(dispatched)).toEqual([renachItem!.id]);
    expect(ids(dispatched)).not.toContain(aitEvent);
    expect(port.submitMedicalExam).not.toHaveBeenCalled();
    expect(port.submitPsychologicalEvaluation).not.toHaveBeenCalled();
  });

  it('C-08-07 dado dois eventos do mesmo agregado com versões distintas quando anexados então o leitor do log devolve os dois, na ordem (created_at, id)', async () => {
    const tenant = await newTenant('versions');
    const since = await reader(tenant).now();
    const aggregateId = randomUUID();
    const v1 = await append(
      tenant,
      logEnvelope(tenant, {
        aggregate: { kind: 'ait', id: aggregateId, version: 1 },
      }),
    );
    const v2 = await append(
      tenant,
      logEnvelope(tenant, {
        aggregate: { kind: 'ait', id: aggregateId, version: 2 },
      }),
    );

    expect(v2).not.toBe(v1);
    const rows = await readAll(tenant, since);
    expect(rows.map((row) => row.id)).toEqual([v1, v2]);
    expect(
      rows.map(
        (row) =>
          (row.payload.aggregate as TeatEventEnvelope['aggregate']).version,
      ),
    ).toEqual([1, 2]);
  });

  it('C-08-08 dado o mesmo envelope quando anexado de novo em transação posterior então devolve o mesmo id e o leitor vê um único evento', async () => {
    const tenant = await newTenant('replay');
    const since = await reader(tenant).now();
    const envelope = logEnvelope(tenant);
    const first = await append(tenant, envelope);
    const replay = await append(tenant, { ...envelope });

    expect(replay).toBe(first);
    const rows = await readAll(tenant, since);
    expect(rows.map((row) => row.id)).toEqual([first]);
  });

  it('C-08-09 dado envelope sem id e com tenantId alheio quando anexado então o leitor entrega id = id devolvido e tenantId = tenant do contexto', async () => {
    const tenant = await newTenant('envelope');
    const since = await reader(tenant).now();
    const input = logEnvelope(tenant, { id: '', tenantId: tenantB.tenantId });
    const id = await append(tenant, input);

    const found = await reader(tenant).findById(id);
    expect(found?.id).toBe(id);
    expect(found?.payload).toMatchObject({
      id,
      tenantId: tenant.tenantId,
      type: input.type,
      domainEvent: input.domainEvent,
      aggregate: input.aggregate,
    });
    const [listed] = await readAll(tenant, since);
    expect(listed?.payload).toMatchObject({ id, tenantId: tenant.tenantId });
  });

  it('C-08-10 dado eventos já comitados quando lidos a partir de um cursor (created_at, id) então vêm só os posteriores, sem repetir nem pular entre páginas, com empate desempatado por id', async () => {
    const tenant = await newTenant('cursor');
    const since = await reader(tenant).now();
    const appended: string[] = [];
    for (let index = 0; index < 4; index += 1)
      appended.push(await append(tenant, logEnvelope(tenant)));

    const all = await readAll(tenant, since);
    expect(all.map((row) => row.id)).toEqual(appended);

    const paged: string[] = [];
    let cursor: StreamCursor = { createdAt: since, id: null };
    for (;;) {
      const page = await reader(tenant).listSince(cursor, 1);
      if (page.length === 0) break;
      expect(page).toHaveLength(1);
      const [row] = page as [OutboxRow];
      paged.push(row.id);
      cursor = { createdAt: row.created_at, id: row.id };
    }
    expect(paged).toEqual(appended);

    const [first, second, third] = all as [OutboxRow, OutboxRow, OutboxRow];
    await expect(
      reader(tenant).listSince({ createdAt: first.created_at, id: first.id }),
    ).resolves.toMatchObject(appended.slice(1).map((id) => ({ id })));

    // Mesmo created_at: a ordem cai no id.
    const lowest = '00000000-0000-0000-0000-000000000000';
    const highest = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    const tieLow = await reader(tenant).listSince({
      createdAt: second.created_at,
      id: lowest,
    });
    expect(tieLow.map((row) => row.id)).toEqual(appended.slice(1));
    const tieHigh = await reader(tenant).listSince({
      createdAt: second.created_at,
      id: highest,
    });
    expect(tieHigh.map((row) => row.id)).toEqual(appended.slice(2));
    expect(tieHigh[0]?.id).toBe(third.id);
  });

  it('C-08-11 dado evento do tenant B quando A lê o log então o evento nunca chega a A e o id de B é desconhecido sob A', async () => {
    const sinceA = await reader(tenantA).now();
    const fromB = await append(tenantB, logEnvelope(tenantB));
    const fromA = await append(tenantA, logEnvelope(tenantA));

    await expect(reader(tenantA).findById(fromB)).resolves.toBeUndefined();
    const seenByA = (await readAll(tenantA, sinceA)).map((row) => row.id);
    expect(seenByA).toContain(fromA);
    expect(seenByA).not.toContain(fromB);
    await expect(reader(tenantB).findById(fromB)).resolves.toMatchObject({
      id: fromB,
    });
  });

  it('C-08-11 dado append sob A com tenantId de B no envelope quando lido então o evento está no log de A e não no de B', async () => {
    const sinceB = await reader(tenantB).now();
    const id = await append(
      tenantA,
      logEnvelope(tenantA, { tenantId: tenantB.tenantId }),
    );

    await expect(reader(tenantA).findById(id)).resolves.toMatchObject({
      id,
      payload: { tenantId: tenantA.tenantId },
    });
    await expect(reader(tenantB).findById(id)).resolves.toBeUndefined();
    expect((await readAll(tenantB, sinceB)).map((row) => row.id)).not.toContain(
      id,
    );
  });

  it('C-08-19 dado porta injetada não canônica quando teatEventSink anexa então a porta é notificada e o id devolvido é o persistido', async () => {
    const tenant = await newTenant('sink');
    const observer = {
      append: vi.fn(async (_tx: unknown, _envelope: TeatEventEnvelope) => ({
        id: 'observed-only',
      })),
    };
    const envelope = logEnvelope(tenant);
    const client = tenant.clients[0] as pg.Client;

    const { id } = await asTenant(client, tenant, () =>
      teatEventSink(observer).append(sqlTransaction(client) as never, envelope),
    );

    expect(observer.append).toHaveBeenCalledTimes(1);
    expect(observer.append.mock.calls[0]?.[1]).toBe(envelope);
    expect(id).not.toBe('observed-only');
    await expect(reader(tenant).findById(id)).resolves.toMatchObject({
      id,
      payload: { id },
    });
    await expect(append(tenant, envelope)).resolves.toBe(id);
  });

  it('C-08-19 dado persistência no-op (transação sem query) quando teatEventSink anexa então devolve o id observado pela porta injetada', async () => {
    const tenant = await newTenant('sink-noop');
    const observer = {
      append: vi.fn(async (_tx: unknown, _envelope: TeatEventEnvelope) => ({
        id: 'observed-only',
      })),
    };

    await expect(
      teatEventSink(observer).append(
        { kind: 'guard-only-double' } as never,
        logEnvelope(tenant),
      ),
    ).resolves.toEqual({ id: 'observed-only' });
    expect(observer.append).toHaveBeenCalledTimes(1);
  });

  it('C-08-19 dado SqlTeatEventOutbox injetada quando teatEventSink é composto então devolve a mesma instância', () => {
    const canonical = new SqlTeatEventOutbox();
    expect(teatEventSink(canonical)).toBe(canonical);
  });

  it('C-08-16 dado evento de toxicologia processado quando reenviado igual então é duplicate sem novo efeito, e com corpo divergente responde 409', async () => {
    const tenant = await newTenant('toxicology');
    const client = tenant.clients[0] as pg.Client;
    await asTenant(client, tenant, () =>
      client.query(
        `insert into ch.patient (tenant_id, national_id, name)
         values ($1, '11144477735', 'R22 condutor fixture')`,
        [tenant.tenantId],
      ),
    );
    const inbound = new PecToxicologyInboundService(
      tenantDatabase(tenant, client) as never,
      tenantContext(tenant) as never,
    );
    const eventId = `r22-tox-${randomUUID()}`;
    const event = {
      driverCpf: '11144477735',
      category: 'C',
      result: 'NEGATIVE',
      collectedAt: '2026-09-01T12:00:00.000Z',
      validUntil: '2026-11-30T12:00:00.000Z',
      occurredAt: '2026-09-02T12:00:00.000Z',
      laboratoryCode: 'R22-LAB',
      sourceReference: 'r22-source-1',
      driverAlertStatus: 'NOT_REQUIRED',
    };
    const body = Buffer.from(JSON.stringify(event));

    const first = await inbound.receive(eventId, body, event);
    expect(first).toMatchObject({
      eventId,
      status: 'processed',
      duplicate: false,
      resultId: expect.any(String),
    });
    await expect(inbound.receive(eventId, body, event)).resolves.toEqual({
      eventId,
      status: 'processed',
      duplicate: true,
      resultId: first.resultId,
    });

    const divergent = { ...event, sourceReference: 'r22-source-2' };
    await expectHttpStatus(
      inbound.receive(
        eventId,
        Buffer.from(JSON.stringify(divergent)),
        divergent,
      ),
      409,
    );
  });
});

// ---------------------------------------------------------------------------
// Caminho completo pelos escritores reais (#17 laudo/adendo, BOAT
// `transmit`), provedor falso, ledger, lista/saúde e inbox de toxicologia.
// Fixtures `ch`/`est`/`ops.parameter` são criadas sob `role_app_backend` nos
// tenants do próprio teste; owner só lê o parâmetro canônico a copiar,
// envelhece a coluna de claim (C-08-04, adenda A1 do CTG-0008) e limpa.

const SIGNED_AT = '2026-09-01T12:01:00.000Z';
const CANONICAL_TENANT = '00000000-0000-7000-8000-00000000a001';
const extraUsers: Array<{ id: string; tenantId: string }> = [];

function signingDouble() {
  return {
    renderAndSign: vi.fn(
      async (request: { documentType: string; contentSha256: string }) => ({
        contentSha256: request.contentSha256,
        storageDocumentId: randomUUID(),
        artifactSha256: createHash('sha256')
          .update(`${request.documentType}:${request.contentSha256}`)
          .digest('hex'),
        signatureLevel: 'QUALIFIED' as const,
        signatureFormat: 'PAdES-TSA' as const,
        signedAt: SIGNED_AT,
        tsaTime: SIGNED_AT,
        certificateValidationSource: 'OCSP' as const,
        certificateValidationStatus: 'GOOD' as const,
        certificateValidatedAt: SIGNED_AT,
      }),
    ),
  };
}

function reports(tenant: Tenant): ReportLifecycleService {
  const client = tenant.clients[0] as pg.Client;
  return new ReportLifecycleService(
    new ReportRepository(
      tenantDatabase(tenant, client) as never,
      tenantContext(tenant) as never,
    ),
    tenantContext(tenant) as never,
    signingDouble() as never,
  );
}

async function asActor<T>(
  tenant: Tenant,
  actorId: string,
  work: () => Promise<T>,
): Promise<T> {
  const previous = tenant.actorId;
  tenant.actorId = actorId;
  try {
    return await work();
  } finally {
    tenant.actorId = previous;
  }
}

async function extraUser(tenant: Tenant, label: string): Promise<string> {
  const id = randomUUID();
  await owner.query(
    'insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, $4)',
    [id, tenant.tenantId, `${id}@detran.invalid`, `R22 ${label}`],
  );
  extraUsers.push({ id, tenantId: tenant.tenantId });
  return id;
}

async function insertId(
  client: pg.Client,
  sql: string,
  values: unknown[],
): Promise<string> {
  const result = await client.query<{ id: string }>(sql, values);
  return result.rows[0]!.id;
}

/** Atendimento médico pronto para assinatura pelo profissional = ator. */
async function clinicalFixture(
  tenant: Tenant,
): Promise<{ encounterId: string; appointmentId: string }> {
  const client = tenant.clients[0] as pg.Client;
  const t = tenant.tenantId;
  return asTenant(client, tenant, async () => {
    const clinicId = await insertId(
      client,
      `insert into ch.clinic (tenant_id, code, cnpj, name, region_code)
       values ($1, 'r22-clinic', '12345678000199', 'R22 clínica fixture', 'r22-fixture')
       returning id`,
      [t],
    );
    const professionalId = await insertId(
      client,
      `insert into ch.professional
         (tenant_id, clinic_id, user_id, person_name, document_cpf,
          professional_kind, council_type, council_number, council_state)
       values ($1, $2, $3, 'R22 médico fixture', '52998224725', 'MEDICO', 'CRM', 'R22-1234', 'AM')
       returning id`,
      [t, clinicId, tenant.actorId],
    );
    const patientId = await insertId(
      client,
      `insert into ch.patient (tenant_id, clinic_id, national_id, name, birth_date)
       values ($1, $2, '11144477735', 'R22 candidato fixture', '1980-01-01')
       returning id`,
      [t, clinicId],
    );
    const appointmentId = await insertId(
      client,
      `insert into ch.appointment (tenant_id, clinic_id, patient_id, professional_id, scheduled_at)
       values ($1, $2, $3, $4, $5) returning id`,
      [t, clinicId, patientId, professionalId, OCCURRED_AT],
    );
    const encounterId = await insertId(
      client,
      `insert into ch.encounter
         (tenant_id, clinic_id, patient_id, appointment_id, renach_process_key,
          renach_process_type, current_category, exam_eligible,
          eligibility_checked_at, status)
       values ($1, $2, $3, $4, 'R22-PROCESS-1', 'RENEWAL', 'B', true, $5, 'IN_PROGRESS')
       returning id`,
      [t, clinicId, patientId, appointmentId, OCCURRED_AT],
    );
    await client.query(
      `insert into ch.medical_exam
         (tenant_id, encounter_id, professional_id, statutory_valid_until,
          valid_until, data, result)
       values ($1, $2, $3, '2031-09-01', '2031-09-01', '{}'::jsonb, 'APTO')`,
      [t, encounterId, professionalId],
    );
    const stationId = await insertId(
      client,
      `insert into ch.biometric_station
         (tenant_id, clinic_id, name, fingerprint_hash, provider_code,
          device_certificate_fingerprint)
       values ($1, $2, 'R22 estação fixture', $3, 'r22-provider', $3)
       returning id`,
      [t, clinicId, createHash('sha256').update(t).digest('hex')],
    );
    await client.query(
      `insert into ch.biometric_check
         (tenant_id, encounter_id, clinic_id, station_id,
          subject_professional_id, kind, modality, passed,
          evidence_document_id, evidence_sha256, created_by)
       values ($1, $2, $3, $4, $5, 'MEDICAL', 'FACE', true, $6, $7, $8)`,
      [
        t,
        encounterId,
        clinicId,
        stationId,
        professionalId,
        randomUUID(),
        'e'.repeat(64),
        tenant.actorId,
      ],
    );
    return { encounterId, appointmentId };
  });
}

type ReportRow = { id: string; artifact_sha256: string };

async function signedReport(tenant: Tenant): Promise<ReportRow> {
  const { encounterId } = await clinicalFixture(tenant);
  return (await reports(tenant).create({
    encounterId,
    kind: 'MEDICAL',
    templateVersion: 'r22-fixture',
  })) as unknown as ReportRow;
}

async function listed(tenant: Tenant, aggregateId: string) {
  const { items } = await integrations(tenant).list({});
  const item = items.find(
    (candidate) => candidate.aggregate_id === aggregateId,
  );
  expect(item).toBeDefined();
  return item!;
}

function pgTime(text: string): number {
  return new Date(
    text.replace(' ', 'T').replace(/([+-]\d{2})$/u, '$1:00'),
  ).getTime();
}

async function expectRetryWindow(
  availableAt: string,
  before: string,
  after: string,
): Promise<void> {
  const fifteen = 15 * 60 * 1000;
  expect(pgTime(availableAt)).toBeGreaterThanOrEqual(pgTime(before) + fifteen);
  expect(pgTime(availableAt)).toBeLessThanOrEqual(pgTime(after) + fifteen);
}

/**
 * C-08-04 (adenda A1): owner envelhece só a coluna de claim da fase em curso,
 * na preparação. 1.4.0: `integration.outbox.dispatched_at`; 1.5.x:
 * `outbox.event_delivery.lease_until` (0021 publicada), com _lease_ de 15 min.
 */
async function ageClaim(itemId: string, secondsAgo: number): Promise<void> {
  const phase = await owner.query<{ migrated: boolean }>(
    "select to_regclass('outbox.event_delivery') is not null as migrated",
  );
  const result = phase.rows[0]?.migrated
    ? await owner.query(
        `update outbox.event_delivery
            set lease_until = now() - make_interval(secs => $2) + interval '15 minutes'
          where event_id = $1`,
        [itemId, secondsAgo],
      )
    : await owner.query(
        `update integration.outbox
            set dispatched_at = now() - make_interval(secs => $2)
          where id = $1 and status = 'processing'`,
        [itemId, secondsAgo],
      );
  expect(result.rowCount).toBe(1);
}

async function ledger(tenant: Tenant, itemId: string) {
  const client = tenant.clients[0] as pg.Client;
  return asTenant(client, tenant, async () => {
    const result = await client.query(
      `select outbox_id, tenant_id, attempt_number, status, provider_protocol,
              provider_code, provider_message, request_sha256, response_sha256
         from integration.delivery_attempt
        where outbox_id = $1
        order by attempt_number`,
      [itemId],
    );
    return result.rows;
  });
}

async function boatTenant(label: string): Promise<Tenant> {
  const tenant = await newTenant(label);
  const canonical = await owner.query(
    `select parameter.*
       from ops.parameter parameter
       join est.crash_timer_ref timer on timer.parameter_key = parameter.key
      where timer.code = 'T-BOAT-TRANSM' and parameter.tenant_id = $1
        and parameter.surface = 'est' and parameter.scope = 'tenant'
        and parameter.status = 'vigente'
      order by parameter.effective_from desc, parameter.version desc
      limit 1`,
    [CANONICAL_TENANT],
  );
  const row = canonical.rows[0] as Record<string, unknown> | undefined;
  if (!row)
    throw new Error(
      'fixture canônica do parâmetro T-BOAT-TRANSM ausente no banco preparado',
    );
  const client = tenant.clients[0] as pg.Client;
  await asTenant(client, tenant, () =>
    client.query(
      `insert into ops.parameter
         (tenant_id, traffic_agency_id, scope, surface, key, value_json,
          value_type, status, source_pending, legal_readonly, decision_ref,
          legal_basis, reason, version, effective_from, effective_to, changed_by)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13,
               $14, $15, $16, $17)`,
      [
        tenant.tenantId,
        row.traffic_agency_id,
        row.scope,
        row.surface,
        row.key,
        JSON.stringify(row.value_json),
        row.value_type,
        row.status,
        row.source_pending,
        row.legal_readonly,
        row.decision_ref,
        row.legal_basis,
        row.reason,
        row.version,
        row.effective_from,
        row.effective_to,
        tenant.actorId,
      ],
    ),
  );
  return tenant;
}

/** Sinistro FECHADO sem vítima (valores da fixture canônica `r10-no-victim`). */
async function closedCrash(tenant: Tenant): Promise<string> {
  const client = tenant.clients[0] as pg.Client;
  return asTenant(client, tenant, () =>
    insertId(
      client,
      `insert into est.crash_record
         (tenant_id, traffic_agency_id, crash_type, severity, state,
          occurred_at, recorded_at, location_description, municipality_code,
          uf, road_condition, weather_condition, lighting_condition,
          signage_condition, source_system, source_local_id)
       values ($1, $2, 'source_pending', 'SEM_VITIMA', 'FECHADO',
               '2026-09-14T10:12:00-04:00', '2026-09-14T11:00:00-04:00',
               'fixture BOAT FECHADO', '1302603', 'AM', 'source_pending',
               'source_pending', 'source_pending', 'source_pending',
               'boat-fixture', $3)
       returning id`,
      [tenant.tenantId, randomUUID(), `r22-${randomUUID()}`],
    ),
  );
}

async function transmitCrash(tenant: Tenant, crashId: string): Promise<void> {
  await new BoatCrashCommandsService(
    tenantDatabase(tenant, tenant.clients[0] as pg.Client) as never,
    tenantContext(tenant) as never,
  ).transmit(crashId);
}

function renaestPort() {
  return {
    submitCrash: vi.fn(),
    complementCrash: vi.fn(),
    correctCrash: vi.fn(),
  };
}

function boat(
  tenant: Tenant,
  port = renaestPort(),
): BoatRenaestTransmissionService {
  return new BoatRenaestTransmissionService(
    tenantDatabase(tenant, tenant.clients[0] as pg.Client) as never,
    tenantContext(tenant) as never,
    port as never,
  );
}

describe('R-0022 CTG-0008 despacho pelos escritores reais', () => {
  it('C-08-01 AC-PEC-009-1 dado laudo médico assinado pelo escritor #17 quando despachado então envia payload mínimo com chave durável, correlação e artefato', async () => {
    const tenant = await newTenant('renach-ok');
    const report = await signedReport(tenant);
    const port = renachPort();
    port.submitMedicalExam.mockResolvedValue({
      protocol: 'R22-RENACH-1',
      examId: 'r22-exam',
      result: 'APTO',
    });

    const results = await transmissions(
      tenant,
      tenant.clients[0] as pg.Client,
      port,
    ).dispatchDue();

    expect(results).toEqual([
      {
        outboxId: expect.any(String),
        status: 'acked',
        providerProtocol: 'R22-RENACH-1',
      },
    ]);
    expect(port.submitMedicalExam).toHaveBeenCalledTimes(1);
    const [request, context] = port.submitMedicalExam.mock.calls[0] as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(request).toMatchObject({
      renachNumber: 'R22-PROCESS-1',
      result: 'APTO',
      examiner: { cpf: '52998224725', state: 'AM' },
      signature: { hash: report.artifact_sha256 },
    });
    expect(JSON.stringify(request)).not.toMatch(
      /exam_data|examData|anamnes|content/iu,
    );
    expect(context).toMatchObject({
      tenantId: tenant.tenantId,
      actorId: tenant.actorId,
      correlationId: expect.stringMatching(/\S/u),
      metadata: { idempotencyKey: `ch.report:${report.id}` },
    });
    expect(port.submitPsychologicalEvaluation).not.toHaveBeenCalled();
    await expect(listed(tenant, report.id)).resolves.toMatchObject({
      status: 'acked',
      attempts: 1,
    });
  });

  it('C-08-01 AC-PEC-007-4 dado adendo assinado pelo escritor #17 quando despachado então retransmite o artefato e o resultado do adendo', async () => {
    const tenant = await newTenant('renach-addendum');
    const report = await signedReport(tenant);
    const port = renachPort();
    port.submitMedicalExam.mockResolvedValue({ protocol: 'R22-RENACH-2' });
    const service = transmissions(tenant, tenant.clients[0] as pg.Client, port);
    await expect(service.dispatchDue()).resolves.toHaveLength(1);

    const professional = tenant.actorId;
    const supervisor = await extraUser(tenant, 'supervisor');
    const admin = await extraUser(tenant, 'admin clínica');
    const requested = (await reports(tenant).requestAddendum(report.id, {
      reason: 'R22 retificação fixture',
      content: { result: 'APTO_COM_RESTRICOES' },
    })) as unknown as { id: string };
    await asActor(tenant, supervisor, () =>
      reports(tenant).approveAddendum(requested.id, 'SUPERVISOR'),
    );
    await asActor(tenant, admin, () =>
      reports(tenant).approveAddendum(requested.id, 'ADMIN_CLINICA'),
    );
    const signed = (await asActor(tenant, professional, () =>
      reports(tenant).signAddendum(requested.id),
    )) as unknown as { id: string; artifact_sha256: string };

    await expect(service.dispatchDue()).resolves.toEqual([
      expect.objectContaining({
        status: 'acked',
        providerProtocol: 'R22-RENACH-2',
      }),
    ]);
    expect(port.submitMedicalExam).toHaveBeenCalledTimes(2);
    const [request, context] = port.submitMedicalExam.mock.calls[1] as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(signed.artifact_sha256).not.toBe(report.artifact_sha256);
    expect(request).toMatchObject({
      result: 'APTO_COM_RESTRICOES',
      signature: { hash: signed.artifact_sha256 },
    });
    expect(context).toMatchObject({
      metadata: { idempotencyKey: `ch.report-addendum:${signed.id}` },
    });
  });

  it('C-08-01 dado item RENACH cuja espécie diverge do laudo quando despachado então falha fechado sem chamar o provedor (fails closed when queue metadata disagrees with the report kind)', async () => {
    const tenant = await newTenant('renach-kind');
    const report = await signedReport(tenant);
    const port = renachPort();
    port.submitMedicalExam.mockResolvedValue({ protocol: 'R22-RENACH-3' });
    const service = transmissions(tenant, tenant.clients[0] as pg.Client, port);
    await expect(service.dispatchDue()).resolves.toHaveLength(1);

    const divergent = await append(tenant, {
      ...queueEnvelope(tenant),
      reportId: report.id,
      kind: 'PSYCH',
    } as TeatEventEnvelope);
    await expect(service.dispatchDue()).resolves.toEqual([
      expect.objectContaining({ outboxId: divergent, status: 'error' }),
    ]);
    expect(port.submitMedicalExam).toHaveBeenCalledTimes(1);
    expect(port.submitPsychologicalEvaluation).not.toHaveBeenCalled();
  });

  it('C-08-03 AC-PEC-009-2 dado falha do provedor quando despachado então o item fica em erro com tentativa visível e só volta a ser elegível 15 min depois', async () => {
    const tenant = await newTenant('renach-fail');
    const report = await signedReport(tenant);
    const port = renachPort();
    port.submitMedicalExam.mockRejectedValue(
      Object.assign(new Error('provider unavailable fixture'), {
        providerCode: 'R22-UNAVAILABLE',
      }),
    );
    const service = transmissions(tenant, tenant.clients[0] as pg.Client, port);

    const before = await reader(tenant).now();
    await expect(service.dispatchDue()).resolves.toEqual([
      expect.objectContaining({
        status: 'error',
        error: 'provider unavailable fixture',
      }),
    ]);
    const after = await reader(tenant).now();

    const item = await listed(tenant, report.id);
    expect(item).toMatchObject({
      status: 'error',
      attempts: 1,
      last_error: 'provider unavailable fixture',
    });
    await expectRetryWindow(item.available_at, before, after);
    await expect(service.dispatchDue()).resolves.toEqual([]);
    expect(port.submitMedicalExam).toHaveBeenCalledTimes(1);
  });

  it('C-08-14 dado despacho com sucesso e com falha quando a tentativa é registrada então o ledger guarda número, hashes, protocolo/código/mensagem e vínculo ao item e ao tenant', async () => {
    const ok = await newTenant('ledger-ok');
    const okReport = await signedReport(ok);
    const okPort = renachPort();
    okPort.submitMedicalExam.mockResolvedValue({ protocol: 'R22-RENACH-4' });
    const [okResult] = await transmissions(
      ok,
      ok.clients[0] as pg.Client,
      okPort,
    ).dispatchDue();
    const okItem = await listed(ok, okReport.id);
    expect(okResult?.outboxId).toBe(okItem.id);
    expect(await ledger(ok, okItem.id)).toEqual([
      expect.objectContaining({
        outbox_id: okItem.id,
        tenant_id: ok.tenantId,
        attempt_number: okItem.attempts,
        status: 'acked',
        provider_protocol: 'R22-RENACH-4',
        request_sha256: expect.stringMatching(/^[0-9a-f]{64}$/u),
        response_sha256: expect.stringMatching(/^[0-9a-f]{64}$/u),
      }),
    ]);

    const failed = await newTenant('ledger-fail');
    const failedReport = await signedReport(failed);
    const failedPort = renachPort();
    failedPort.submitMedicalExam.mockRejectedValue(
      Object.assign(new Error('provider refused fixture'), {
        providerCode: 'R22-REFUSED',
      }),
    );
    await transmissions(
      failed,
      failed.clients[0] as pg.Client,
      failedPort,
    ).dispatchDue();
    const failedItem = await listed(failed, failedReport.id);
    expect(await ledger(failed, failedItem.id)).toEqual([
      expect.objectContaining({
        outbox_id: failedItem.id,
        tenant_id: failed.tenantId,
        attempt_number: failedItem.attempts,
        status: 'error',
        provider_code: 'R22-REFUSED',
        provider_message: 'provider refused fixture',
        request_sha256: expect.stringMatching(/^[0-9a-f]{64}$/u),
      }),
    ]);
    // Sob o tenant do sucesso, o ledger do outro tenant é invisível.
    expect(await ledger(ok, failedItem.id)).toEqual([]);
  });

  it('C-08-04 C-08-15 dado item reclamado e não concluído quando o claim envelhece então volta a ser elegível após 15 min e não antes; a saúde conta o item em processing', async () => {
    const tenant = await newTenant('renach-lease', 2);
    const report = await signedReport(tenant);
    const [first, second] = tenant.clients as [pg.Client, pg.Client];
    let release: (value: unknown) => void = () => undefined;
    const hanging = renachPort();
    hanging.submitMedicalExam.mockImplementation(
      () => new Promise((resolve) => (release = resolve)),
    );
    const stuck = transmissions(tenant, first, hanging).dispatchDue();
    await vi.waitFor(() =>
      expect(hanging.submitMedicalExam).toHaveBeenCalledTimes(1),
    );
    const item = await listed(tenant, report.id);
    expect(item.status).toBe('processing');
    await expect(
      integrations(tenant).health({
        provider: 'r22-fixture',
        baseUrl: 'http://r22.invalid',
      }),
    ).resolves.toMatchObject({
      queue: { pending: 0, processing: 1, error: 0 },
    });

    const late = renachPort();
    late.submitMedicalExam.mockResolvedValue({ protocol: 'R22-RENACH-LATE' });
    const recovery = transmissions(tenant, second, late);
    await expect(recovery.dispatchDue()).resolves.toEqual([]);
    await ageClaim(item.id, 14 * 60);
    await expect(recovery.dispatchDue()).resolves.toEqual([]);
    await ageClaim(item.id, 15 * 60 + 1);
    await expect(recovery.dispatchDue()).resolves.toEqual([
      {
        outboxId: item.id,
        status: 'acked',
        providerProtocol: 'R22-RENACH-LATE',
      },
    ]);
    expect(late.submitMedicalExam).toHaveBeenCalledTimes(1);

    release({ protocol: 'R22-RENACH-STUCK' });
    await stuck;
    await expect(listed(tenant, report.id)).resolves.toMatchObject({
      status: 'acked',
    });
  });

  it('C-08-15 dado itens pendentes e com erro quando a saúde da fila é consultada então conta pending, processing e error do tenant', async () => {
    const tenant = await newTenant('health');
    await enqueue(tenant, 3);
    const health = () =>
      integrations(tenant).health({
        provider: 'r22-fixture',
        baseUrl: 'http://r22.invalid',
      });
    await expect(health()).resolves.toMatchObject({
      queue: { pending: 3, processing: 0, error: 0 },
    });
    await transmissions(tenant, tenant.clients[0] as pg.Client).dispatchDue(1);
    await expect(health()).resolves.toMatchObject({
      queue: { pending: 2, processing: 0, error: 1 },
    });
  });

  it('C-08-13 dado sinistro FECHADO transmitido pelo BOAT quando runOnce tem sucesso então o item fica acked com protocolo e o evento crash.renaest.changed é publicado', async () => {
    const tenant = await boatTenant('boat-ok');
    const crashId = await closedCrash(tenant);
    const since = await reader(tenant).now();
    await transmitCrash(tenant, crashId);
    const port = renaestPort();
    port.submitCrash.mockResolvedValue({ protocol: 'R22-RENAEST-1' });

    await expect(boat(tenant, port).runOnce()).resolves.toEqual([
      {
        outboxId: expect.any(String),
        status: 'acked',
        protocol: 'R22-RENAEST-1',
      },
    ]);
    expect(port.submitCrash).toHaveBeenCalledTimes(1);
    expect(port.submitCrash.mock.calls[0]?.[1]).toMatchObject({
      tenantId: tenant.tenantId,
      metadata: { idempotencyKey: expect.stringMatching(/\S/u) },
    });
    const { items } = await integrations(tenant).list({});
    expect(
      items.find((item) => item.topic === 'SINISTRO_TRANSMISSAO_PENDENTE'),
    ).toMatchObject({ status: 'acked', attempts: 1 });
    const events = await readAll(tenant, since);
    expect(
      events.find((row) => row.payload.type === 'crash.renaest.changed')
        ?.payload,
    ).toMatchObject({
      domainEvent: 'SINISTRO_TRANSMITIDO',
      data: { protocol: 'R22-RENAEST-1' },
      aggregate: { id: crashId },
    });
    await expect(boat(tenant, port).runOnce()).resolves.toEqual([]);
  });

  it('C-08-13 dado falha do RENAEST quando runOnce roda então o item vai a erro com código traduzido e retry de 15 min', async () => {
    const tenant = await boatTenant('boat-fail');
    await transmitCrash(tenant, await closedCrash(tenant));
    const port = renaestPort();
    port.submitCrash.mockRejectedValue(new Error('renaest down fixture'));

    const before = await reader(tenant).now();
    await expect(boat(tenant, port).runOnce()).resolves.toEqual([
      expect.objectContaining({
        status: 'error',
        error: 'BOAT.RENAEST_UNAVAILABLE',
      }),
    ]);
    const after = await reader(tenant).now();
    const { items } = await integrations(tenant).list({});
    const item = items.find(
      (candidate) => candidate.topic === 'SINISTRO_TRANSMISSAO_PENDENTE',
    )!;
    expect(item).toMatchObject({
      status: 'error',
      attempts: 1,
      last_error: 'BOAT.RENAEST_UNAVAILABLE: renaest down fixture',
    });
    await expectRetryWindow(item.available_at, before, after);
    await expect(boat(tenant, port).runOnce()).resolves.toEqual([]);
    expect(port.submitCrash).toHaveBeenCalledTimes(1);
  });

  it('C-08-13 dado sinistro transmitido no tenant A quando o BOAT roda sob B então B não alcança o item e A segue com ele', async () => {
    const tenantBoatA = await boatTenant('boat-a');
    const tenantBoatB = await boatTenant('boat-b');
    await transmitCrash(tenantBoatA, await closedCrash(tenantBoatA));
    const portB = renaestPort();

    await expect(boat(tenantBoatB, portB).runOnce()).resolves.toEqual([]);
    expect(portB.submitCrash).not.toHaveBeenCalled();
    const portA = renaestPort();
    portA.submitCrash.mockResolvedValue({ protocol: 'R22-RENAEST-A' });
    await expect(boat(tenantBoatA, portA).runOnce()).resolves.toEqual([
      expect.objectContaining({ status: 'acked', protocol: 'R22-RENAEST-A' }),
    ]);
  });

  it('C-08-12 dado log com tópicos RENACH, BOAT e não despacháveis quando RENACH e BOAT despacham então cada fila só consome o seu tópico', async () => {
    const tenant = await boatTenant('topics-boat');
    const aitEvent = await append(tenant, logEnvelope(tenant));
    const [renachItem] = await enqueue(tenant, 1);
    await transmitCrash(tenant, await closedCrash(tenant));
    const renaest = renaestPort();
    renaest.submitCrash.mockResolvedValue({ protocol: 'R22-RENAEST-T' });
    const renach = renachPort();

    const boatResults = await boat(tenant, renaest).runOnce();
    expect(boatResults).toHaveLength(1);
    expect(ids(boatResults as DispatchResult[])).not.toContain(renachItem!.id);
    expect(ids(boatResults as DispatchResult[])).not.toContain(aitEvent);
    expect(renaest.submitCrash).toHaveBeenCalledTimes(1);

    const renachResults = await transmissions(
      tenant,
      tenant.clients[0] as pg.Client,
      renach,
    ).dispatchDue();
    expect(ids(renachResults)).toEqual([renachItem!.id]);
    expect(renach.submitMedicalExam).not.toHaveBeenCalled();
  });
});
