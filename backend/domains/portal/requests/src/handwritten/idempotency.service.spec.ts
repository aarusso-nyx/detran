// R-0009 CTG-0002 §4 e §13 (TASK-0006) — C-0002-01…06: `PortalIdempotencyService`
// (M9, adenda A4(a)): chave persistida `${scope}:${header}` em
// `portal.idempotency_record` (DDL 62), replay com o status e o corpo gravados,
// 409 `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key }` em corpo ou rota
// divergente, `canonicalJson`/`sha256Hex` estáveis. Fica vermelho até
// TASK-0007 criar `idempotency.service.ts` (§14).
//
// Tx falsa em memória (`tests/support/fake-sql.ts`) — o subconjunto de SQL
// aceito está no cabeçalho daquele arquivo. O serviço é construído pelos
// metadados do construtor (`tests/support/nest-construct.ts`): a ordem das
// dependências não importa.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { FakeSqlDatabase } from '../../tests/support/fake-sql.js';
import { constructInjectable } from '../../tests/support/nest-construct.js';
import {
  SUBJECTS,
  TENANT_ID,
  fixedClock,
} from '../../tests/support/portal-fixtures.js';
import {
  PortalIdempotencyService,
  canonicalJson,
  sha256Hex,
} from './idempotency.service.js';

const ROUTE_SUBMIT = 'POST /v1/portal/requests/{id}/submit';
const ROUTE_CREATE = 'POST /v1/portal/requests';

interface BeginResult {
  replay?: { status: number; body: unknown };
  record?: (status: number, body: unknown) => Promise<unknown>;
}

function setup() {
  const db = new FakeSqlDatabase({ tenantId: TENANT_ID, now: fixedClock.now });
  const service = constructInjectable(PortalIdempotencyService, {
    PortalClock: fixedClock,
  });
  const begin = (input: {
    scope: string;
    header: string | undefined;
    route: string;
    body: unknown;
  }): Promise<BeginResult> =>
    (
      service as unknown as {
        begin: (tx: unknown, input: unknown) => Promise<BeginResult>;
      }
    ).begin(db.tx, input);
  return { db, service, begin };
}

const body = {
  serviceKey: 'consulta_multas',
  targetKind: 'none',
  channel: 'portal',
};

describe('CTG-0002 §4 — PortalIdempotencyService.begin (M9)', () => {
  it('C-0002-01 — dado rota M9 sem Idempotency-Key quando begin então 400 PORTAL.VALIDATION_FAILED { fields: ["Idempotency-Key"] }', async () => {
    const { begin } = setup();
    for (const header of [undefined, '']) {
      await expect(
        begin({ scope: SUBJECTS.prata.id, header, route: ROUTE_CREATE, body }),
      ).rejects.toMatchObject({
        code: 'PORTAL.VALIDATION_FAILED',
        status: 400,
        context: { fields: ['Idempotency-Key'] },
      });
    }
  });

  it('C-0002-02 — dado registro (scope s, key k, corpo b) quando begin(s, k, b) então replay com o status e o body gravados', async () => {
    const { db, begin } = setup();
    const first = await begin({
      scope: SUBJECTS.prata.id,
      header: 'k-1',
      route: ROUTE_CREATE,
      body,
    });
    expect(first.replay).toBeUndefined();
    expect(typeof first.record).toBe('function');
    const response = {
      requestId: '00000000-0000-7000-8000-000070400005',
      state: 'PEDIDO_EM_COMPOSICAO',
      version: 1,
    };
    await first.record!(201, response);

    const stored = db.rows('portal.idempotency_record');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      key: `${SUBJECTS.prata.id}:k-1`,
      subject_id: SUBJECTS.prata.id,
      route: ROUTE_CREATE,
      body_sha256: sha256Hex(canonicalJson(body)),
      status: 201,
    });
    expect(stored[0]!.response_json).toEqual(response);

    const second = await begin({
      scope: SUBJECTS.prata.id,
      header: 'k-1',
      route: ROUTE_CREATE,
      body: { ...body },
    });
    expect(second.record).toBeUndefined();
    expect(second.replay).toEqual({ status: 201, body: response });
  });

  it("C-0002-03 — dado registro (s, k, b) quando begin(s, k, b') então 409 PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key: k }", async () => {
    const { begin } = setup();
    const first = await begin({
      scope: SUBJECTS.prata.id,
      header: 'k-2',
      route: ROUTE_CREATE,
      body,
    });
    await first.record!(201, { ok: true });

    await expect(
      begin({
        scope: SUBJECTS.prata.id,
        header: 'k-2',
        route: ROUTE_CREATE,
        body: { ...body, targetKind: 'ait' },
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
      status: 409,
      context: { key: 'k-2' },
    });

    // mesma chave e mesmo corpo em OUTRA rota também é reuso divergente (§4 `row.route = route`)
    await expect(
      begin({
        scope: SUBJECTS.prata.id,
        header: 'k-2',
        route: ROUTE_SUBMIT,
        body,
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
      status: 409,
      context: { key: 'k-2' },
    });
  });

  it('C-0002-04 — dado registro (s1, k, b) quando begin(s2, k, b) então sem replay (escopo por sujeito: chave persistida `${s2}:${k}`)', async () => {
    const { db, begin } = setup();
    const first = await begin({
      scope: SUBJECTS.prata.id,
      header: 'k-3',
      route: ROUTE_CREATE,
      body,
    });
    await first.record!(201, { who: 'prata' });

    const other = await begin({
      scope: SUBJECTS.ouro.id,
      header: 'k-3',
      route: ROUTE_CREATE,
      body,
    });
    expect(other.replay).toBeUndefined();
    expect(typeof other.record).toBe('function');
    await other.record!(201, { who: 'ouro' });

    const keys = db
      .rows('portal.idempotency_record')
      .map((row) => row.key)
      .sort();
    expect(keys).toEqual(
      [`${SUBJECTS.prata.id}:k-3`, `${SUBJECTS.ouro.id}:k-3`].sort(),
    );

    // escopo `public` (POST manifestations anônimo, §4): subject_id nulo
    const anonymous = await begin({
      scope: 'public',
      header: 'k-3',
      route: 'POST /v1/portal/manifestations',
      body,
    });
    await anonymous.record!(201, { anonymous: true });
    const publicRow = db
      .rows('portal.idempotency_record')
      .find((row) => row.key === 'public:k-3');
    expect(publicRow).toBeDefined();
    expect(publicRow!.subject_id ?? null).toBeNull();
  });

  it('C-0002-05 — dado canonicalJson({ b: 1, a: { d: [2,1], c: null } }) então \'{"a":{"c":null,"d":[2,1]},"b":1}\' e sha256 estável', () => {
    const value = { b: 1, a: { d: [2, 1], c: null } };
    expect(canonicalJson(value)).toBe('{"a":{"c":null,"d":[2,1]},"b":1}');
    expect(canonicalJson({ a: { c: null, d: [2, 1] }, b: 1 })).toBe(
      canonicalJson(value),
    );
    expect(canonicalJson(null)).toBe('null');
    expect(canonicalJson(undefined)).toBe('null');
    expect(canonicalJson([{ z: 1, y: 2 }])).toBe('[{"y":2,"z":1}]');

    const expected = createHash('sha256')
      .update(canonicalJson(value))
      .digest('hex');
    expect(sha256Hex(canonicalJson(value))).toBe(expected);
    expect(sha256Hex(canonicalJson(value))).toMatch(/^[0-9a-f]{64}$/);
    expect(sha256Hex(canonicalJson({ a: { d: [2, 1], c: null }, b: 1 }))).toBe(
      expected,
    );
  });

  it('C-0002-06 — dado comando que respondeu 403 (sem estado) quando repetido com a mesma chave então executa de novo (não gravado); dado 502 DELEGATION_FAILED então replay do 502', async () => {
    const { db, begin } = setup();
    // 403 sem estado: o chamador NÃO grava (§4 "4xx sem estado não gravam")
    const attempt = await begin({
      scope: SUBJECTS.bronze.id,
      header: 'k-4',
      route: ROUTE_SUBMIT,
      body: {},
    });
    expect(typeof attempt.record).toBe('function');
    // … o comando lançou 403 ASSURANCE_INSUFFICIENT e não chamou record()
    expect(db.rows('portal.idempotency_record')).toHaveLength(0);
    const retry = await begin({
      scope: SUBJECTS.bronze.id,
      header: 'k-4',
      route: ROUTE_SUBMIT,
      body: {},
    });
    expect(retry.replay).toBeUndefined();
    expect(typeof retry.record).toBe('function');

    // 502 DELEGATION_FAILED: gravado com status 502 (§3.1 passo 10) e reproduzido
    const failed = {
      code: 'PORTAL.DELEGATION_FAILED',
      context: {
        protocol: 'AM-FIXTURES-2026-0000015',
        retryPolicy: 'pendencia_interna',
      },
    };
    await retry.record!(502, failed);
    const replayed = await begin({
      scope: SUBJECTS.bronze.id,
      header: 'k-4',
      route: ROUTE_SUBMIT,
      body: {},
    });
    expect(replayed.replay).toEqual({ status: 502, body: failed });
    expect(db.rows('portal.idempotency_record')[0]).toMatchObject({
      status: 502,
    });
  });
});
