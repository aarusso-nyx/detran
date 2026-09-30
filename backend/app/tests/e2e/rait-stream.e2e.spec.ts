import type http from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  RAIT_STREAM_TOPICS,
  sanitizeRaitEvent,
} from '../../src/handwritten/rait/rait-stream.service.js';
import {
  ACTOR_A,
  TENANT_A,
  bootStreamApp,
  deleteOutbox,
  insertOutbox,
  newOwnerClient,
  openStream,
  seedIsolationTenants,
  settle,
  type StreamApp,
} from './r22-sse-tenancy.support.js';

describe('GET /v1/inf/rait/stream — contrato SSE', () => {
  it('dado envelope com tenant e PII quando preparado então nenhum dado protegido vaza', () => {
    expect(
      sanitizeRaitEvent({
        tenantId: 'tenant-a',
        data: { cpf: 'x', caseId: 'case-1' },
      }),
    ).toEqual({ data: { caseId: 'case-1' } });
  });
  it('dado catálogo de tópicos quando publicado então coincide com o contrato', () => {
    expect(RAIT_STREAM_TOPICS).toEqual([
      'case',
      'assignment',
      'clock',
      'session',
      'agenda-item',
      'batch',
      'outbox',
    ]);
  });
});

/**
 * R-0022 CTG-0001 C-01-12 (F4, HTTP; TASK-0002): `GET /v1/inf/rait/stream` no
 * servidor real (`app.listen(0)`), tenant A de `tools/check-rls-smoke.ts`,
 * agendador manual em `RAIT_STREAM_POLLER` (CTG-0001 §4.3). Válido nas duas
 * fases: só rota, cabeçalhos, status e corpo.
 */
describe('C-01-12 — GET /v1/inf/rait/stream por HTTP (F4)', () => {
  const client = newOwnerClient();
  const openRequests: http.ClientRequest[] = [];
  const created: string[] = [];
  const previousEnv: Record<string, string | undefined> = {};
  const CASE_07 = '00000000-0000-7000-8000-000010000007';
  let target: StreamApp;

  function sessionHeaders(role: string): Record<string, string> {
    process.env.DETRAN_LOCAL_ROLES = role;
    process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
    return {
      authorization: 'Bearer local',
      'x-tenant-id': TENANT_A,
      accept: 'text/event-stream',
    };
  }

  beforeAll(async () => {
    for (const key of [
      'DETRAN_RUNTIME_PROFILE',
      'DETRAN_LOCAL_ACTOR_ID',
      'DETRAN_LOCAL_ROLES',
    ])
      previousEnv[key] = process.env[key];
    process.env.DETRAN_RUNTIME_PROFILE = 'test';
    await client.connect();
    await seedIsolationTenants(client);
    target = await bootStreamApp(TENANT_A);
  }, 120_000);

  afterAll(async () => {
    for (const req of openRequests.splice(0)) req.destroy();
    await target?.app.close();
    await deleteOutbox(client, created.splice(0));
    await client.end();
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  // Adenda TASK-0025 (CTG-0004 §6, OD-R22-04): `event:` = `type` do envelope
  // (antes: `event: case`, 2º segmento do topic).
  it('C-01-12 — dado rait-analyst no tenant A quando abre o fluxo e chega rait.case.changed então 200 text/event-stream, no-cache, keep-alive, `: connected` primeiro e frame id/event: rait.case.changed/uma linha data JSON sem tenantId; dado CANDIDATO então 403 sem corpo SSE', async () => {
    const scheduler = target.schedulers.rait;
    scheduler.reset();
    const stream = openStream(
      target.port,
      '/v1/inf/rait/stream',
      sessionHeaders('rait-analyst'),
      openRequests,
    );
    await stream.opened;
    expect(stream.status(), stream.body()).toBe(200);
    expect(String(stream.headers()['content-type'])).toContain(
      'text/event-stream',
    );
    expect(String(stream.headers()['cache-control'])).toBe('no-cache');
    expect(String(stream.headers().connection).toLowerCase()).toBe(
      'keep-alive',
    );
    expect(stream.sequence[0]).toBe('comment:: connected');
    await stream.waitFor(() => scheduler.reads().length === 1);
    await settle(100);

    const id = await insertOutbox(client, {
      tenantId: TENANT_A,
      topic: 'rait.case.changed',
      domainEvent: 'RAIT_CASO_ALTERADO',
      aggregate: { kind: 'case', id: CASE_07, version: 1 },
      data: { caseId: CASE_07 },
    });
    created.push(id);
    await scheduler.fireReads();
    await stream.waitFor(() => stream.events.some((event) => event.id === id));
    const event = stream.events.find((candidate) => candidate.id === id)!;
    expect(event.event).toBe('rait.case.changed');
    expect(event.dataLines).toBe(1);
    expect(JSON.parse(event.data ?? '')).toMatchObject({
      data: { caseId: CASE_07 },
    });
    expect(event.data).not.toContain('tenantId');
    expect(event.data).not.toContain(TENANT_A);
    expect(stream.body()).toMatch(
      new RegExp(
        `id: ${id}\\nevent: rait\\.case\\.changed\\ndata: \\{[^\\n]*\\}\\n\\n`,
      ),
    );
    stream.close();

    const denied = openStream(
      target.port,
      '/v1/inf/rait/stream',
      sessionHeaders('CANDIDATO'),
      openRequests,
    );
    await denied.ended;
    expect(denied.status(), denied.body()).toBe(403);
    expect(denied.body()).not.toContain(': connected');
  });
});
