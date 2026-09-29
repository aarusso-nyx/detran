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
//   o de `dispatchDue`/`recordAcknowledgement`, válido nas duas fases.
import { randomUUID } from 'node:crypto';
import { HttpException } from '@nestjs/common';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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

function transmissions(
  tenant: Tenant,
  client: pg.Client,
  port = renachPort(),
): PecRenachTransmissionService {
  const database = {
    tx: <T>(work: (tx: unknown) => Promise<T>) =>
      asTenant(client, tenant, () => work(sqlTransaction(client))),
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: tenant.tenantId,
      actorId: tenant.actorId,
      requestId: `r22-outbox-${randomUUID()}`,
    }),
  };
  return new PecRenachTransmissionService(
    database as never,
    requestContext as never,
    port as never,
  );
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
    // Remoção só de tenants/atores criados aqui; as linhas de integração do
    // tenant saem pela FK `ON DELETE CASCADE` de `auth.tenants`.
    await owner.query('delete from auth.users where id = any($1::uuid[])', [
      all.map((tenant) => tenant.actorId),
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

  it('C-08-05 dado event_id já processado quando reutilizado com corpo divergente então responde 409 sem efeito no item', async () => {
    const tenant = await newTenant('ack-conflict');
    const service = transmissions(tenant, tenant.clients[0] as pg.Client);
    const [item] = await enqueue(tenant, 1);
    const eventId = `r22-ack-${randomUUID()}`;

    await expect(
      ack(service, eventId, {
        idempotencyKey: item!.key,
        status: 'ERROR',
        message: 'provider refused fixture',
        providerCode: 'R22-REFUSED',
      }),
    ).resolves.toMatchObject({ status: 'error', duplicate: false });
    // ERROR com mensagem agenda retry: o item não é reclamado de imediato.
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

  it('C-08-06 dado itens RENACH dos tenants A e B quando A despacha e confirma com a chave de B então não alcança B e B segue intacto', async () => {
    const [itemA] = await enqueue(tenantA, 1);
    const [itemB] = await enqueue(tenantB, 1);
    const underA = transmissions(tenantA, tenantA.clients[0] as pg.Client);
    const underB = transmissions(tenantB, tenantB.clients[0] as pg.Client);

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

  it('C-08-07 dado dois eventos do mesmo agregado com versões distintas quando anexados então ambos são preservados com ids distintos e consumidos na ordem de criação', async () => {
    const tenant = await newTenant('versions');
    const aggregateId = randomUUID();
    const v1 = await append(
      tenant,
      queueEnvelope(tenant, {
        aggregate: { kind: 'ch.report', id: aggregateId, version: 1 },
      }),
    );
    const v2 = await append(
      tenant,
      queueEnvelope(tenant, {
        aggregate: { kind: 'ch.report', id: aggregateId, version: 2 },
      }),
    );

    expect(v2).not.toBe(v1);
    const dispatched = await transmissions(
      tenant,
      tenant.clients[0] as pg.Client,
    ).dispatchDue(25);
    expect(ids(dispatched)).toEqual([v1, v2]);
  });

  it('C-08-08 dado o mesmo envelope quando anexado de novo em transação posterior então devolve o mesmo id e há um único item', async () => {
    const tenant = await newTenant('replay');
    const envelope = queueEnvelope(tenant);
    const first = await append(tenant, envelope);
    const replay = await append(tenant, { ...envelope });

    expect(replay).toBe(first);
    const dispatched = await transmissions(
      tenant,
      tenant.clients[0] as pg.Client,
    ).dispatchDue(25);
    expect(ids(dispatched)).toEqual([first]);
  });
});
